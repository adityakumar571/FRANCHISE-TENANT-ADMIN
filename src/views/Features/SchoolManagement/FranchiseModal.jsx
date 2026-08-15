/* eslint-disable prettier/prettier */
/**
 * FranchiseModal
 *
 * Clean Create/Edit modal for Franchise management.
 * Replaces the old SchoolRegisterModal with franchise-domain terminology.
 * Sends data to existing POST /api/schools (registerTenant) and PUT /api/schools/:id (updateTenant).
 *
 * Tabs:
 *  1. Basic Info    — franchise name, code, business type, GST, subdomain, status
 *  2. Address       — address, city, state, pincode
 *  3. Contact       — contact person, email, mobile
 *  4. Admin         — franchise admin name, email/userId, password (create only)
 *  5. Subscription  — placeholder (Phase 2)
 */
import { useState, useEffect, useRef, useCallback } from 'react'
import { Modal } from 'antd'
import { Loader2, CheckCircle2, XCircle, Upload, Building2, MapPin, Phone, UserCog, CreditCard, Store } from 'lucide-react'
import toast from 'react-hot-toast'
import { fileUpload, getRequest, postRequest, putRequest } from '../../../Helpers'

/* ── Input & Label helpers ── */
const Label = ({ children, req }) => (
  <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>
    {children}{req && <span style={{ color: '#dc2626' }}> *</span>}
  </label>
)
const Input = ({ error, ...props }) => (
  <div>
    <input
      {...props}
      style={{
        width: '100%', padding: '8px 10px', border: `1px solid ${error ? '#dc2626' : '#e5e7eb'}`,
        borderRadius: 7, fontSize: 13, outline: 'none', background: '#f9fafb', boxSizing: 'border-box',
        ...props.style,
      }}
    />
    {error && <small style={{ color: '#dc2626', fontSize: 11 }}>{error}</small>}
  </div>
)
const Select = ({ error, children, ...props }) => (
  <div>
    <select
      {...props}
      style={{
        width: '100%', padding: '8px 10px', border: `1px solid ${error ? '#dc2626' : '#e5e7eb'}`,
        borderRadius: 7, fontSize: 13, outline: 'none', background: '#f9fafb', boxSizing: 'border-box', cursor: 'pointer',
      }}
    >
      {children}
    </select>
    {error && <small style={{ color: '#dc2626', fontSize: 11 }}>{error}</small>}
  </div>
)
const Row = ({ children }) => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
    {children}
  </div>
)
const SectionCard = ({ icon: Icon, title, children }) => (
  <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, marginBottom: 14 }}>
    <div style={{ background: '#0c3b73', color: '#fff', padding: '8px 14px', borderRadius: '10px 10px 0 0', display: 'flex', alignItems: 'center', gap: 8 }}>
      {Icon && <Icon size={14} />}
      <span style={{ fontSize: 13, fontWeight: 600 }}>{title}</span>
    </div>
    <div style={{ padding: '14px' }}>
      {children}
    </div>
  </div>
)

/* ── Subdomain availability check badge ── */
const SubdomainBadge = ({ status }) => {
  if (!status || status === 'idle') return null
  const map = {
    checking:  { color: '#2563eb', text: 'Checking…' },
    available: { color: '#16a34a', text: '✓ Available' },
    taken:     { color: '#dc2626', text: '✗ Already taken' },
  }
  const m = map[status]
  return m ? <small style={{ color: m.color, fontSize: 11 }}>{m.text}</small> : null
}

/* ── Tabs config ── */
const TABS = [
  { key: 'basic',    label: 'Basic Info',    icon: Store },
  { key: 'address',  label: 'Address',       icon: MapPin },
  { key: 'contact',  label: 'Contact',       icon: Phone },
  { key: 'admin',    label: 'Admin',         icon: UserCog },
  { key: 'subscription', label: 'Subscription', icon: CreditCard },
]

const EMPTY = {
  schoolName:          '',  // = franchise name (maps to existing field)
  franchiseCode:       '',
  businessType:        '',
  gstNo:               '',
  subdomain:           '',
  logo:                '',
  description:         '',
  addressLine1:        '',
  city:                '',
  state:               '',
  country:             'India',
  pincode:             '',
  schoolContact:       '',  // = contact mobile
  schoolContactAlt:    '',
  schoolEmail:         '',  // = contact email
  contactPerson1:      { name: '', designation: '', contactNo: '', email: '' },
  franchiseAdminName:  '',
  franchiseAdminEmail: '',
  isActive:            true,
  // admin credentials (create only — generate auto)
  adminUserId:         '',
  adminPassword:       '',
}

const BUSINESS_TYPES = ['Pharmacy', 'Medical Store', 'Clinic', 'Hospital', 'Other']

const STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat',
  'Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh',
  'Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab',
  'Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh',
  'Uttarakhand','West Bengal','Delhi','Jammu and Kashmir','Ladakh',
]

/* ════════════════════════════════════════════ */
const FranchiseModal = ({ open, onClose, editData, refresh }) => {
  const isEdit = !!editData
  const fileRef = useRef(null)
  const subdomainTimer = useRef(null)

  const [activeTab, setActiveTab]           = useState('basic')
  const [form, setForm]                     = useState({ ...EMPTY, contactPerson1: { name: '', designation: '', contactNo: '', email: '' } })
  const [logoPreview, setLogoPreview]       = useState(null)
  const [errors, setErrors]                 = useState({})
  const [loading, setLoading]               = useState(false)
  const [uploading, setUploading]           = useState(false)
  const [subdomainStatus, setSubdomainStatus] = useState('idle')

  /* ── Prefill on edit ── */
  useEffect(() => {
    if (!open) return
    if (editData) {
      const cp1 = editData.contactPerson1 || {}
      setForm({
        schoolName:          editData.schoolName || '',
        franchiseCode:       editData.franchiseCode || editData.schoolCode || '',
        businessType:        editData.businessType || '',
        gstNo:               editData.gstNo || '',
        subdomain:           editData.subdomain || '',
        logo:                editData.logo || '',
        description:         editData.description || '',
        addressLine1:        editData.addressLine1 || '',
        city:                editData.city || '',
        state:               editData.state || '',
        country:             editData.country || 'India',
        pincode:             editData.pincode || '',
        schoolContact:       editData.schoolContact || '',
        schoolContactAlt:    editData.schoolContactAlt || '',
        schoolEmail:         editData.schoolEmail || '',
        contactPerson1:      { name: cp1.name || '', designation: cp1.designation || '', contactNo: cp1.contactNo || '', email: cp1.email || '' },
        franchiseAdminName:  editData.franchiseAdminName || '',
        franchiseAdminEmail: editData.franchiseAdminEmail || '',
        isActive:            editData.isActive ?? true,
        adminUserId:         '',
        adminPassword:       '',
      })
      setLogoPreview(editData.logo || null)
    } else {
      setForm({ ...EMPTY, contactPerson1: { name: '', designation: '', contactNo: '', email: '' } })
      setLogoPreview(null)
    }
    setErrors({})
    setActiveTab('basic')
    setSubdomainStatus('idle')
  }, [open, editData])

  const set = (k, v) => {
    setForm(p => ({ ...p, [k]: v }))
    setErrors(p => ({ ...p, [k]: undefined }))
  }
  const setCP = (field, value) => {
    setForm(p => ({ ...p, contactPerson1: { ...p.contactPerson1, [field]: value } }))
  }

  /* ── Subdomain check ── */
  const checkSubdomain = useCallback((val) => {
    clearTimeout(subdomainTimer.current)
    if (!val || val.length < 3) { setSubdomainStatus('idle'); return }
    setSubdomainStatus('checking')
    subdomainTimer.current = setTimeout(async () => {
      try {
        const res = await postRequest({ url: 'onboarding/check-subdomain', cred: { subdomain: val } })
        const avail = res?.data?.data?.available
        setSubdomainStatus(typeof avail === 'boolean' ? (avail ? 'available' : 'taken') : 'idle')
      } catch (err) {
        const msg = (err?.response?.data?.message || '').toLowerCase()
        setSubdomainStatus(msg.includes('taken') || msg.includes('already') ? 'taken' : 'idle')
      }
    }, 600)
  }, [])

  /* ── Logo upload ── */
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { toast.error('Please upload a valid image file'); return }
    if (file.size > 2 * 1024 * 1024) { toast.error('Logo must be under 2 MB'); return }
    setLogoPreview(URL.createObjectURL(file))
    setUploading(true)
    try {
      const fd = new FormData(); fd.append('file', file)
      const res = await fileUpload({ url: 'upload/uploadImage', cred: fd })
      const url = res?.data?.data?.imageUrl
      if (!url) throw new Error('No URL returned')
      setLogoPreview(url); set('logo', url); toast.success('Logo uploaded')
    } catch { toast.error('Upload failed'); setLogoPreview(form.logo || null) }
    finally { setUploading(false); if (fileRef.current) fileRef.current.value = '' }
  }

  /* ── Validation ── */
  const validate = () => {
    const e = {}
    const t = v => (v || '').trim()
    if (!t(form.schoolName)) e.schoolName = 'Franchise name is required'
    if (!isEdit) {
      if (!t(form.subdomain)) e.subdomain = 'Subdomain is required'
      else if (!/^[a-z0-9-]+$/.test(t(form.subdomain))) e.subdomain = 'Only lowercase letters, numbers and hyphens'
      else if (subdomainStatus === 'taken') e.subdomain = 'This subdomain is already taken'
    }
    if (!t(form.schoolEmail)) e.schoolEmail = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t(form.schoolEmail))) e.schoolEmail = 'Enter valid email'
    if (!t(form.schoolContact)) e.schoolContact = 'Mobile is required'
    else if (!/^\d{10}$/.test(t(form.schoolContact))) e.schoolContact = 'Enter valid 10-digit mobile'
    if (!t(form.addressLine1)) e.addressLine1 = 'Address is required'
    if (!t(form.city)) e.city = 'City is required'
    if (!t(form.state)) e.state = 'State is required'
    if (!t(form.pincode)) e.pincode = 'Pincode is required'
    return e
  }

  /* ── Submit ── */
  const handleSubmit = async () => {
    const e = validate()
    if (Object.keys(e).length) {
      setErrors(e)
      toast.error('Please fix the highlighted errors')
      // Navigate to tab with first error
      const basicKeys = ['schoolName', 'subdomain', 'businessType', 'franchiseCode']
      const addrKeys  = ['addressLine1', 'city', 'state', 'pincode']
      const contactKeys = ['schoolEmail', 'schoolContact']
      if (Object.keys(e).some(k => basicKeys.includes(k))) setActiveTab('basic')
      else if (Object.keys(e).some(k => addrKeys.includes(k))) setActiveTab('address')
      else if (Object.keys(e).some(k => contactKeys.includes(k))) setActiveTab('contact')
      return
    }

    setLoading(true)
    try {
      const t = v => (typeof v === 'string' ? v.trim() : v)
      const payload = {
        schoolName:          t(form.schoolName),
        franchiseCode:       t(form.franchiseCode) || undefined,
        businessType:        t(form.businessType) || undefined,
        gstNo:               t(form.gstNo) || undefined,
        logo:                t(form.logo) || undefined,
        description:         t(form.description) || undefined,
        schoolEmail:         t(form.schoolEmail),
        schoolContact:       t(form.schoolContact),
        schoolContactAlt:    t(form.schoolContactAlt) || undefined,
        addressLine1:        t(form.addressLine1),
        city:                t(form.city),
        state:               t(form.state),
        country:             t(form.country) || 'India',
        pincode:             t(form.pincode),
        franchiseAdminName:  t(form.franchiseAdminName) || undefined,
        franchiseAdminEmail: t(form.franchiseAdminEmail) || undefined,
        contactPerson1:      (() => {
          const cp = form.contactPerson1
          const o = {}
          if (t(cp.name))        o.name        = t(cp.name)
          if (t(cp.designation)) o.designation = t(cp.designation)
          if (t(cp.contactNo))   o.contactNo   = t(cp.contactNo)
          if (t(cp.email))       o.email       = t(cp.email)
          return Object.keys(o).length ? o : undefined
        })(),
      }

      if (!isEdit) {
        payload.subdomain  = t(form.subdomain).toLowerCase()
        payload.schoolCode = t(form.franchiseCode) || undefined  // map franchiseCode → schoolCode too
      } else {
        payload.isActive = form.isActive
      }

      if (isEdit) {
        await putRequest({ url: `schools/${editData._id}`, cred: payload })
        toast.success('Franchise updated successfully')
      } else {
        await postRequest({ url: 'schools', cred: payload })
        toast.success('Franchise created successfully! Admin credentials sent via email.')
      }

      refresh?.()
      onClose()
    } catch (err) {
      toast.error(err?.response?.data?.message || (isEdit ? 'Update failed' : 'Creation failed'))
    } finally {
      setLoading(false)
    }
  }

  /* ─── JSX ─── */
  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={900}
      destroyOnClose
      styles={{
        content: { borderRadius: 12, padding: 0, overflow: 'hidden' },
        header:  { padding: '16px 20px 0', marginBottom: 0 },
        body:    { padding: '0 0 0' },
      }}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: '#0c3b73', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Store size={16} color="#fff" />
          </div>
          <div>
            <p style={{ fontSize: 16, fontWeight: 700, color: '#111827', margin: 0 }}>
              {isEdit ? 'Edit Franchise' : 'Create New Franchise'}
            </p>
            <p style={{ fontSize: 12, color: '#9ca3af', margin: 0 }}>
              {isEdit ? 'Update franchise details' : 'Register a new franchise on the platform'}
            </p>
          </div>
        </div>
      }
    >
      {/* ── Tabs ── */}
      <div style={{ borderBottom: '1px solid #e5e7eb', padding: '0 20px', background: '#fafafa' }}>
        <div style={{ display: 'flex', gap: 2 }}>
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '10px 14px', fontSize: 12, fontWeight: 600,
                border: 'none', background: 'none', cursor: 'pointer',
                borderBottom: activeTab === key ? '2px solid #0c3b73' : '2px solid transparent',
                color: activeTab === key ? '#0c3b73' : '#6b7280',
                transition: 'all 0.15s',
              }}
            >
              <Icon size={13} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Content ── */}
      <div style={{ padding: '20px', maxHeight: '60vh', overflowY: 'auto' }}>

        {/* ────────── TAB 1: BASIC INFO ────────── */}
        {activeTab === 'basic' && (
          <>
            <SectionCard icon={Store} title="Franchise Identity">
              <Row>
                <div>
                  <Label req>Franchise Name</Label>
                  <Input
                    placeholder="e.g. Sharma Medical Store"
                    value={form.schoolName}
                    onChange={e => set('schoolName', e.target.value)}
                    error={errors.schoolName}
                  />
                </div>
                <div>
                  <Label>Franchise Code</Label>
                  <Input
                    placeholder="e.g. FRN-001"
                    value={form.franchiseCode}
                    onChange={e => set('franchiseCode', e.target.value.toUpperCase())}
                    error={errors.franchiseCode}
                  />
                </div>
                {!isEdit && (
                  <div>
                    <Label req>Subdomain / ID</Label>
                    <Input
                      placeholder="e.g. sharma-pharmacy"
                      value={form.subdomain}
                      onChange={e => { const v = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''); set('subdomain', v); checkSubdomain(v) }}
                      error={errors.subdomain}
                    />
                    <SubdomainBadge status={subdomainStatus} />
                  </div>
                )}
                <div>
                  <Label>Business Type</Label>
                  <Select value={form.businessType} onChange={e => set('businessType', e.target.value)}>
                    <option value="">Select type</option>
                    {BUSINESS_TYPES.map(t => <option key={t}>{t}</option>)}
                  </Select>
                </div>
                <div>
                  <Label>GST Number</Label>
                  <Input
                    placeholder="Enter GST number"
                    value={form.gstNo}
                    onChange={e => set('gstNo', e.target.value.toUpperCase())}
                  />
                </div>
                {isEdit && (
                  <div>
                    <Label>Status</Label>
                    <Select value={form.isActive ? 'active' : 'inactive'} onChange={e => set('isActive', e.target.value === 'active')}>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </Select>
                  </div>
                )}
              </Row>
            </SectionCard>

            <SectionCard icon={Building2} title="Logo & Description">
              <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                <div
                  onClick={() => !uploading && fileRef.current?.click()}
                  style={{ width: 72, height: 72, border: '2px dashed #e5e7eb', borderRadius: 10, cursor: uploading ? 'wait' : 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9fafb', overflow: 'hidden' }}
                >
                  {uploading
                    ? <Loader2 size={20} className="animate-spin text-[#0c3b73]" />
                    : logoPreview
                    ? <img src={logoPreview} alt="logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    : <Upload size={18} style={{ color: '#9ca3af' }} />}
                </div>
                <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileUpload} />
                <div style={{ flex: 1 }}>
                  <Input
                    placeholder="Or paste logo URL"
                    value={form.logo}
                    onChange={e => { set('logo', e.target.value); setLogoPreview(e.target.value || null) }}
                  />
                  <textarea
                    placeholder="Brief description of the franchise"
                    value={form.description}
                    onChange={e => set('description', e.target.value)}
                    rows={2}
                    style={{ width: '100%', marginTop: 8, padding: '8px 10px', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 13, outline: 'none', background: '#f9fafb', resize: 'vertical', boxSizing: 'border-box' }}
                  />
                </div>
              </div>
            </SectionCard>
          </>
        )}

        {/* ────────── TAB 2: ADDRESS ────────── */}
        {activeTab === 'address' && (
          <SectionCard icon={MapPin} title="Franchise Address">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <Label req>Address Line</Label>
                <Input placeholder="Street address, building, locality" value={form.addressLine1} onChange={e => set('addressLine1', e.target.value)} error={errors.addressLine1} />
              </div>
              <Row>
                <div>
                  <Label req>City</Label>
                  <Input placeholder="City" value={form.city} onChange={e => set('city', e.target.value)} error={errors.city} />
                </div>
                <div>
                  <Label req>State</Label>
                  <Select value={form.state} onChange={e => set('state', e.target.value)} error={errors.state}>
                    <option value="">Select state</option>
                    {STATES.map(s => <option key={s}>{s}</option>)}
                  </Select>
                </div>
                <div>
                  <Label req>Pincode</Label>
                  <Input placeholder="6-digit pincode" value={form.pincode} onChange={e => set('pincode', e.target.value.replace(/\D/g, ''))} maxLength={6} error={errors.pincode} />
                </div>
                <div>
                  <Label>Country</Label>
                  <Input placeholder="Country" value={form.country} onChange={e => set('country', e.target.value)} />
                </div>
              </Row>
            </div>
          </SectionCard>
        )}

        {/* ────────── TAB 3: CONTACT ────────── */}
        {activeTab === 'contact' && (
          <>
            <SectionCard icon={Phone} title="Primary Contact">
              <Row>
                <div>
                  <Label req>Mobile Number</Label>
                  <Input placeholder="10-digit mobile" value={form.schoolContact} onChange={e => set('schoolContact', e.target.value.replace(/\D/g, ''))} maxLength={10} error={errors.schoolContact} />
                </div>
                <div>
                  <Label>Alternate Mobile</Label>
                  <Input placeholder="Alternate mobile" value={form.schoolContactAlt} onChange={e => set('schoolContactAlt', e.target.value.replace(/\D/g, ''))} maxLength={10} error={errors.schoolContactAlt} />
                </div>
                <div>
                  <Label req>Email Address</Label>
                  <Input type="email" placeholder="franchise@example.com" value={form.schoolEmail} onChange={e => set('schoolEmail', e.target.value)} error={errors.schoolEmail} />
                </div>
              </Row>
            </SectionCard>

            <SectionCard icon={Phone} title="Contact Person (Optional)">
              <Row>
                <div>
                  <Label>Contact Name</Label>
                  <Input placeholder="Full name" value={form.contactPerson1.name} onChange={e => setCP('name', e.target.value)} />
                </div>
                <div>
                  <Label>Designation</Label>
                  <Input placeholder="e.g. Manager" value={form.contactPerson1.designation} onChange={e => setCP('designation', e.target.value)} />
                </div>
                <div>
                  <Label>Mobile</Label>
                  <Input placeholder="10-digit mobile" value={form.contactPerson1.contactNo} onChange={e => setCP('contactNo', e.target.value.replace(/\D/g, ''))} maxLength={10} />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input type="email" placeholder="contact@example.com" value={form.contactPerson1.email} onChange={e => setCP('email', e.target.value)} />
                </div>
              </Row>
            </SectionCard>
          </>
        )}

        {/* ────────── TAB 4: ADMIN ────────── */}
        {activeTab === 'admin' && (
          <SectionCard icon={UserCog} title="Franchise Administrator">
            <div style={{ marginBottom: 12 }}>
              <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8, padding: '10px 14px', fontSize: 12, color: '#92400e', marginBottom: 14 }}>
                {isEdit
                  ? '⚠️ Admin credentials (userId/password) are auto-generated by the system and cannot be changed here. Contact Super Admin for credential reset.'
                  : '✅ Admin credentials (userId & password) are auto-generated and sent to the franchise email on creation. You can optionally override the admin name and email below.'}
              </div>
            </div>
            <Row>
              <div>
                <Label>Admin Name</Label>
                <Input placeholder="e.g. Rahul Sharma" value={form.franchiseAdminName} onChange={e => set('franchiseAdminName', e.target.value)} />
              </div>
              <div>
                <Label>Admin Email</Label>
                <Input type="email" placeholder="admin@franchise.com" value={form.franchiseAdminEmail} onChange={e => set('franchiseAdminEmail', e.target.value)} />
              </div>
            </Row>
            {!isEdit && (
              <div style={{ marginTop: 16, padding: '12px 14px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8 }}>
                <p style={{ fontSize: 12, color: '#166534', margin: 0 }}>
                  <strong>Auto-generated credentials:</strong> After creation, the system will generate userId as <code>admin_[subdomain]</code> and a random password, then email them to the franchise email address.
                </p>
              </div>
            )}
          </SectionCard>
        )}

        {/* ────────── TAB 5: SUBSCRIPTION ────────── */}
        {activeTab === 'subscription' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 200, gap: 12 }}>
            <div style={{ width: 56, height: 56, borderRadius: 14, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CreditCard size={24} color="#0c3b73" />
            </div>
            <p style={{ fontSize: 15, fontWeight: 700, color: '#111827', margin: 0 }}>Subscription Management</p>
            <p style={{ fontSize: 12, color: '#9ca3af', margin: 0, maxWidth: 320, textAlign: 'center' }}>
              Subscription assignment will be available after franchise creation. Use the Subscription tab in the franchise details page.
            </p>
            <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8, padding: '8px 16px', fontSize: 12, color: '#92400e' }}>
              🔧 Phase 2 Feature
            </div>
          </div>
        )}
      </div>

      {/* ── Footer ── */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, padding: '14px 20px', borderTop: '1px solid #e5e7eb', background: '#fafafa' }}>
        <button
          onClick={onClose}
          style={{ padding: '8px 20px', border: '1px solid #e5e7eb', borderRadius: 8, background: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', color: '#374151' }}
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            padding: '8px 24px', border: 'none', borderRadius: 8,
            background: loading ? '#6fa3d0' : '#0c3b73',
            color: '#fff', fontSize: 13, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', gap: 6,
          }}
        >
          {loading && <Loader2 size={13} className="animate-spin" />}
          {loading ? (isEdit ? 'Updating…' : 'Creating…') : (isEdit ? 'Update Franchise' : 'Create Franchise')}
        </button>
      </div>
    </Modal>
  )
}

export default FranchiseModal
