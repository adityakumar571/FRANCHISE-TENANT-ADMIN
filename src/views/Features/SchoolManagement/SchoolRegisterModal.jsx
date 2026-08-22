import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Modal, Tag, Tooltip } from 'antd'
import { Loader2, CheckCircle2, XCircle, Upload, Calculator, Users, Check, CreditCard, ChevronDown, IndianRupee, Puzzle, PackagePlus, Trash2, AlertTriangle, RefreshCw, CheckCircle, Clock } from 'lucide-react'
import toast from 'react-hot-toast'
import { deleteRequest, fileUpload, getRequest, postRequest, putRequest } from '../../../Helpers'
import { calculatePrice, resolveAmount } from '../PricingConfig/PricingConfig'
import dayjs from 'dayjs'

/* ─── Subscription Tab Defaults ─── */
const DEFAULT_PRICING = {
  baseStudentLimit: 350,
  basePrice: 1200,
  extraBlockSize: 50,
  extraBlockPrice: 100,
}

/* ─── Current Subscription Status Banner ─── */
const CurrentSubStatus = ({ tenantId, onRefresh }) => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetch = async () => {
    if (!tenantId) return
    setLoading(true)
    try {
      const res = await getRequest(`subscription?tenantId=${tenantId}&isPagination=false`)
      const subs = res?.data?.data?.subscriptions || []
      setData(subs[0] || null)
    } catch { setData(null) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetch() }, [tenantId])

  // expose refresh to parent
  useEffect(() => { if (onRefresh) onRefresh.current = fetch }, [])

  if (loading) return (
    <div className="flex items-center gap-2 text-gray-400 py-3 text-xs">
      <Loader2 size={13} className="animate-spin" /> Loading current subscription…
    </div>
  )

  const plan    = data?.currentPlan
  const addons  = data?.currentAddons || []
  const status  = data?.status
  const endDate = plan?.endDate ? dayjs(plan.endDate) : null
  const daysLeft = endDate ? Math.max(0, endDate.diff(dayjs(), 'day')) : null

  const statusColor = { ACTIVE: 'green', TRIAL: 'gold', EXPIRED: 'red', CANCELLED: 'default', PENDING: 'blue' }

  if (!data || !plan) return (
    <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-gray-50 border border-dashed border-gray-300 mb-3">
      <XCircle size={15} className="text-gray-400" />
      <div>
        <p className="text-xs font-semibold text-gray-500">No subscription assigned yet</p>
        <p className="text-[11px] text-gray-400">Plan select karke assign karo</p>
      </div>
    </div>
  )

  return (
    <div className="mb-3 rounded-lg border border-blue-200 bg-blue-50 p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <CreditCard size={14} className="text-[#0c3b73]" />
          <span className="text-xs font-bold text-[#0c3b73]">Current Subscription</span>
        </div>
        <button onClick={fetch} className="p-1 rounded hover:bg-blue-100 transition text-blue-400">
          <RefreshCw size={11} />
        </button>
      </div>

      {/* Plan row */}
      <div className="flex items-center justify-between text-xs mb-1.5">
        <span className="text-gray-600 font-semibold">{plan.name}</span>
        <div className="flex items-center gap-1.5">
          <Tag color={statusColor[status] || 'default'} className="text-[10px] m-0">{status || '—'}</Tag>
          {daysLeft !== null && (
            <span className={`text-[10px] font-bold ${daysLeft <= 30 ? 'text-red-600' : daysLeft <= 60 ? 'text-amber-600' : 'text-green-600'}`}>
              {daysLeft}d left
            </span>
          )}
        </div>
      </div>

      {/* Dates + cycle */}
      <div className="flex items-center gap-3 text-[11px] text-gray-500 mb-1.5">
        <span>{plan.billingCycle}</span>
        {plan.startDate && <span>{dayjs(plan.startDate).format('DD MMM YY')} → {dayjs(plan.endDate).format('DD MMM YY')}</span>}
        <span>Limit: <strong>{(data.totalStudentLimit || 0).toLocaleString('en-IN')}</strong></span>
      </div>

      {/* Payment + amount */}
      <div className="flex items-center gap-2 text-[11px]">
        <Tag color={data.paidStatus === 'PAID' ? 'green' : data.paidStatus === 'OVERDUE' ? 'red' : 'orange'} className="m-0 text-[10px]">
          {data.paidStatus}
        </Tag>
        <span className="text-gray-500">Total: <strong className="text-[#0c3b73]">₹{(data.totalAmount || 0).toLocaleString('en-IN')}</strong></span>
        {data.usedStudents > 0 && (
          <span className="text-gray-400">Used: {data.usedStudents.toLocaleString()}</span>
        )}
      </div>

      {/* Addons summary */}
      {addons.length > 0 && (
        <div className="mt-2 pt-2 border-t border-blue-200">
          <p className="text-[10px] font-semibold text-purple-700 mb-1">Active Add-ons ({addons.length})</p>
          <div className="flex flex-wrap gap-1">
            {addons.map((a, i) => (
              <span key={i} className="text-[10px] bg-purple-100 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-full font-semibold">
                {a.name}{a.quantity > 1 ? ` ×${a.quantity}` : ''} · +{((a.studentLimit || 0) * (a.quantity || 1)).toLocaleString()} students
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Expiry warning */}
      {daysLeft !== null && daysLeft <= 30 && status !== 'EXPIRED' && (
        <div className="flex items-center gap-1.5 mt-2 text-[11px] text-red-600 font-semibold">
          <AlertTriangle size={11} /> Plan {daysLeft === 0 ? 'expires today' : `expires in ${daysLeft} days`} — update karo
        </div>
      )}
    </div>
  )
}

/* ─── Addon Manager ─── */
const AddonManager = ({ tenantId, addons, onAddonChange }) => {
  const [availableAddons, setAvailableAddons] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedAddon, setSelectedAddon] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [removingId, setRemovingId] = useState(null)

  useEffect(() => {
    getRequest('subscriptionPlan?planType=Addon')
      .then((res) => setAvailableAddons(res?.data?.data?.plans || []))
      .catch(() => {})
  }, [])

  const handleAssign = async () => {
    if (!selectedAddon) { toast.error('Addon select karo'); return }
    setSubmitting(true)
    try {
      await postRequest({ url: `subscription/${tenantId}/addon`, cred: { addonId: selectedAddon, quantity: Number(quantity) || 1 } })
      toast.success('Add-on assigned successfully')
      setSelectedAddon('')
      setQuantity(1)
      onAddonChange?.()
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Addon assign failed')
    } finally { setSubmitting(false) }
  }

  const handleRemove = async (addonId, addonName) => {
    setRemovingId(addonId)
    try {
      await deleteRequest(`subscription/${tenantId}/addon/${addonId}`)
      toast.success(`${addonName} removed`)
      onAddonChange?.()
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Remove failed')
    } finally { setRemovingId(null) }
  }

  const addonOptions = availableAddons.filter(
    (a) => !addons.find((ca) => String(ca.addonId) === String(a._id))
  )

  return (
    <div>
      {/* Current Addons List */}
      {addons.length > 0 ? (
        <div className="space-y-1.5 mb-3">
          {addons.map((a, i) => (
            <div key={i} className="flex items-center justify-between px-3 py-2 rounded-lg bg-purple-50 border border-purple-100">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Puzzle size={12} className="text-purple-500 flex-shrink-0" />
                  <span className="text-xs font-semibold text-purple-800 truncate">{a.name}</span>
                  {a.quantity > 1 && (
                    <span className="text-[10px] font-bold bg-purple-200 text-purple-800 px-1.5 py-0.5 rounded-full">×{a.quantity}</span>
                  )}
                </div>
                <p className="text-[11px] text-purple-600 mt-0.5 pl-5">
                  +{((a.studentLimit || 0) * (a.quantity || 1)).toLocaleString()} students · ₹{((a.price || 0) * (a.quantity || 1)).toLocaleString('en-IN')}
                </p>
              </div>
              <Tooltip title="Remove addon">
                <button
                  onClick={() => handleRemove(String(a.addonId), a.name)}
                  disabled={removingId === String(a.addonId)}
                  className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition ml-2 flex-shrink-0"
                >
                  {removingId === String(a.addonId)
                    ? <Loader2 size={12} className="animate-spin" />
                    : <Trash2 size={12} />}
                </button>
              </Tooltip>
            </div>
          ))}
        </div>
      ) : (
        <div className="px-3 py-2.5 rounded-lg bg-gray-50 border border-dashed border-gray-200 text-center mb-3">
          <p className="text-xs text-gray-400">No add-ons assigned</p>
        </div>
      )}

      {/* Assign New Addon */}
      {addonOptions.length > 0 && (
        <div className="border border-purple-200 rounded-lg p-3 bg-white">
          <p className="text-xs font-semibold text-purple-700 mb-2 flex items-center gap-1.5">
            <PackagePlus size={13} /> Assign New Add-on
          </p>
          <div className="flex gap-2 flex-wrap">
            <select
              value={selectedAddon}
              onChange={(e) => setSelectedAddon(e.target.value)}
              className="flex-1 h-8 px-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-400 min-w-[140px]"
            >
              <option value="">Select add-on…</option>
              {addonOptions.map((a) => (
                <option key={a._id} value={a._id}>
                  {a.name} — +{a.studentLimit} students · ₹{a.price?.toLocaleString('en-IN')}
                </option>
              ))}
            </select>
            <div className="flex items-center gap-1">
              <button onClick={() => setQuantity(q => Math.max(1, q - 1))}
                className="w-7 h-8 rounded border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100 text-sm font-bold">−</button>
              <input type="number" min={1} value={quantity} onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
                className="w-12 h-8 text-center text-xs border border-gray-300 rounded" />
              <button onClick={() => setQuantity(q => q + 1)}
                className="w-7 h-8 rounded border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100 text-sm font-bold">+</button>
            </div>
            <button
              onClick={handleAssign}
              disabled={submitting || !selectedAddon}
              className="h-8 px-3 text-xs bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition disabled:opacity-60 flex items-center gap-1"
            >
              {submitting ? <Loader2 size={11} className="animate-spin" /> : <Check size={11} />}
              Assign
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

/* ─── Price Breakdown for Subscription Tab ─── */
const PriceBreakdown = ({ studentCount, pricingConfig, selectedPlan }) => {
  if (!studentCount || studentCount < 1) return null

  // Fixed price plan → show plan price directly
  if (selectedPlan && selectedPlan.price > 0 && selectedPlan.pricingModel !== 'PER_STUDENT') {
    return (
      <div className="mt-3 bg-green-50 border border-green-100 rounded-lg p-3">
        <div className="flex items-center gap-1.5 mb-2">
          <IndianRupee size={13} className="text-green-700" />
          <span className="text-xs font-semibold text-green-700">Plan Fixed Price</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-gray-500">Plan: {selectedPlan.name} ({selectedPlan.billingCycle})</span>
          <span className="font-bold text-green-700 text-sm">₹{selectedPlan.price?.toLocaleString('en-IN')}</span>
        </div>
      </div>
    )
  }

  // PER_STUDENT → formula breakdown
  const config = pricingConfig || DEFAULT_PRICING
  const total = calculatePrice(studentCount, config)
  const extra = Math.max(0, studentCount - config.baseStudentLimit)
  const blocks = extra > 0 ? Math.ceil(extra / config.extraBlockSize) : 0
  return (
    <div className="mt-3 bg-blue-50 border border-blue-100 rounded-lg p-3">
      <div className="flex items-center gap-1.5 mb-2">
        <Calculator size={13} className="text-[#0c3b73]" />
        <span className="text-xs font-semibold text-[#0c3b73]">Auto-calculated Price (Per-Student)</span>
      </div>
      <div className="space-y-1 text-xs">
        <div className="flex justify-between">
          <span className="text-gray-500">Base (0–{config.baseStudentLimit} students)</span>
          <span className="font-medium text-gray-800">₹{config.basePrice?.toLocaleString('en-IN')}</span>
        </div>
        {blocks > 0 && (
          <div className="flex justify-between text-orange-600">
            <span>Extra {extra} students ({blocks} block{blocks > 1 ? 's' : ''} × ₹{config.extraBlockPrice})</span>
            <span className="font-medium">₹{(blocks * config.extraBlockPrice)?.toLocaleString('en-IN')}</span>
          </div>
        )}
        <div className="border-t border-blue-200 pt-1 flex justify-between">
          <span className="font-bold text-[#0c3b73]">Total Amount</span>
          <span className="font-bold text-[#0c3b73] text-sm">₹{total?.toLocaleString('en-IN')}</span>
        </div>
      </div>
    </div>
  )
}

/* ─── Plan Card for Subscription Tab ─── */
const PlanCard = ({ plan, selected, onSelect }) => (
  <div
    onClick={() => onSelect(plan._id)}
    className={`border rounded-lg p-3 cursor-pointer transition-all ${
      selected
        ? 'border-[#0c3b73] bg-blue-50 ring-1 ring-[#0c3b73]'
        : 'border-gray-200 hover:border-gray-300 bg-white'
    }`}
  >
    <div className="flex items-start justify-between gap-2">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold text-gray-800 truncate">{plan.name}</span>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
            plan.planType === 'Addon' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
          }`}>{plan.planType}</span>
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
            {plan.billingCycle}
          </span>
        </div>
        <div className="flex items-center gap-3 mt-1.5 flex-wrap">
          <span className="text-sm font-bold text-[#0c3b73]">₹{plan.price?.toLocaleString('en-IN')}</span>
          <span className="text-[11px] text-gray-500">{plan.studentLimit?.toLocaleString('en-IN')} student limit</span>
        </div>
      </div>
      <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-colors ${
        selected ? 'border-[#0c3b73] bg-[#0c3b73]' : 'border-gray-300'
      }`}>
        {selected && <Check size={10} className="text-white" strokeWidth={3} />}
      </div>
    </div>
    {plan.features?.length > 0 && (
      <div className="mt-2 flex flex-wrap gap-1">
        {plan.features.slice(0, 4).map((f, i) => (
          <span key={i} className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">{f}</span>
        ))}
        {plan.features.length > 4 && (
          <span className="text-[10px] text-gray-400">+{plan.features.length - 4} more</span>
        )}
      </div>
    )}
  </div>
)

/* ─── Empty form state ─── */
const EMPTY_CP = { name: '', designation: '', contactNo: '', email: '' }

const EMPTY_FORM = {
  schoolName: '', subdomain: '', logo: '', description: '',
  schoolEmail: '', schoolContact: '', schoolContactAlt: '',
  schoolCode: '', estNo: '',
  addressLine1: '', city: '', state: '', country: 'India', pincode: '',
  schoolAddress: '',
  razorpayKey: '', razorpaySecret: '',
  dbUri: '', useCustomDb: false,
  isActive: true,
  affiliationLine: '', affiliationNo: '', schoolMedium: '',
  msmeRegNo: '', isoRegNo: '', regInfo: '', registrationNo: '',
  nitiAayog: '', managedBy: '',
  contactPerson1: { ...EMPTY_CP },
  contactPerson2: { ...EMPTY_CP },
}

/* ─── Subdomain badge ─── */
const SubdomainBadge = ({ status }) => {
  if (!status || status === 'idle') return null
  const cfg = {
    checking: { icon: <Loader2 size={11} className="animate-spin" />, text: 'Checking...', cls: 'text-blue-500' },
    available: { icon: <CheckCircle2 size={11} />, text: 'Available', cls: 'text-green-600' },
    taken:     { icon: <XCircle size={11} />,        text: 'Already taken', cls: 'text-red-500' },
  }
  const item = cfg[status]
  if (!item) return null
  return (
    <small className={`d-flex align-items-center gap-1 mt-1 ${item.cls}`} style={{ fontSize: 11 }}>
      {item.icon} {item.text}
    </small>
  )
}

/* ─── Main component ─── */
const SchoolModal = ({ open, onClose, editData, refresh }) => {
  const isEdit = !!editData
  const fileRef = useRef(null)
  const subdomainTimer = useRef(null)

  const [activeTab, setActiveTab] = useState('identity')
  const [form, setForm] = useState({ ...EMPTY_FORM, contactPerson1: { ...EMPTY_CP }, contactPerson2: { ...EMPTY_CP } })
  const [logoPreview, setLogoPreview] = useState(null)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [subdomainStatus, setSubdomainStatus] = useState('idle')

  /* ── Subscription tab state ── */
  const subStatusRefreshRef = useRef(null)  // ref to trigger CurrentSubStatus refresh
  const [subCurrentAddons, setSubCurrentAddons] = useState([])
  const [subPlans, setSubPlans] = useState([])
  const [subPlanTab, setSubPlanTab] = useState('Plan')
  const [subLoading, setSubLoading] = useState(false)
  const [subSubmitting, setSubSubmitting] = useState(false)
  const [subPricingConfig, setSubPricingConfig] = useState(DEFAULT_PRICING)
  const [subLoadingStudentCount, setSubLoadingStudentCount] = useState(false)
  const [subStudentCountSource, setSubStudentCountSource] = useState(null)
  const [subForm, setSubForm] = useState({
    selectedPlan: '',
    studentCount: '',
    paidStatus: 'PENDING',
    billingMonth: '',
    dueDate: '',
    paymentRef: '',
  })
  const [subErrors, setSubErrors] = useState({})

  /* ── Prefill on edit / reset on open ── */
  useEffect(() => {
    if (editData) {
      const cp1 = editData.contactPerson1 || {}
      const cp2 = editData.contactPerson2 || {}
      setForm({
        schoolName: editData.schoolName || editData.name || '',
        subdomain: editData.subdomain || '',
        logo: editData.logo || editData.schoolLogoUrl || '',
        description: editData.description || '',
        schoolEmail: editData.schoolEmail || '',
        schoolContact: editData.schoolContact || '',
        schoolContactAlt: editData.schoolContactAlt || '',
        schoolCode: editData.schoolCode || '',
        estNo: editData.estNo || '',
        addressLine1: editData.addressLine1 || '',
        city: editData.city || '',
        state: editData.state || '',
        country: editData.country || 'India',
        pincode: editData.pincode || '',
        schoolAddress: editData.schoolAddress || '',
        razorpayKey: editData.razorpayKey || '',
        razorpaySecret: editData.razorpaySecret || '',
        dbUri: editData.dbUri || '',
        useCustomDb: !!editData.dbUri,
        isActive: editData.isActive ?? true,
        affiliationLine: editData.affiliationLine || '',
        affiliationNo: editData.affiliationNo || '',
        schoolMedium: editData.schoolMedium || '',
        msmeRegNo: editData.msmeRegNo || '',
        isoRegNo: editData.isoRegNo || '',
        regInfo: editData.regInfo || '',
        registrationNo: editData.registrationNo || '',
        nitiAayog: editData.nitiAayog || '',
        managedBy: editData.managedBy || '',
        contactPerson1: { name: cp1.name||'', designation: cp1.designation||'', contactNo: cp1.contactNo||'', email: cp1.email||'' },
        contactPerson2: { name: cp2.name||'', designation: cp2.designation||'', contactNo: cp2.contactNo||'', email: cp2.email||'' },
      })
      setLogoPreview(editData.logo || editData.schoolLogoUrl || null)
    } else {
      setForm({ ...EMPTY_FORM, contactPerson1: { ...EMPTY_CP }, contactPerson2: { ...EMPTY_CP } })
      setLogoPreview(null)
    }
    setErrors({})
    setSubdomainStatus('idle')
    setActiveTab('identity')
    // Reset subscription form state for fresh load
    setSubForm({
      selectedPlan: '',
      studentCount: '',
      paidStatus: 'PENDING',
      billingMonth: '',
      dueDate: '',
      paymentRef: '',
    })
    setSubErrors({})
    setSubPlanTab('Plan')
    setSubStudentCountSource(null)
  }, [editData, open])

  /* ── Load subscription data when subscription tab is opened ── */
  useEffect(() => {
    if (activeTab !== 'subscription' || !editData?._id) return

    // Fetch plans
    setSubLoading(true)
    getRequest('subscriptionPlan')
      .then((res) => setSubPlans(res?.data?.data?.plans || []))
      .catch(() => toast.error('Failed to load subscription plans'))
      .finally(() => setSubLoading(false))

    // Fetch pricing config
    getRequest('pricing-config')
      .then((res) => { if (res?.data?.data?.current) setSubPricingConfig(res.data.data.current) })
      .catch(() => {})

    // Auto-fetch student count from school
    setSubLoadingStudentCount(true)
    setSubStudentCountSource(null)
    getRequest(`schools/${editData._id}`)
      .then((res) => {
        const count = res?.data?.data?.stats?.totalStudents
        if (count !== undefined && count !== null) {
          setSubForm((p) => ({ ...p, studentCount: String(count) }))
          setSubStudentCountSource('auto')
        }
      })
      .catch(() => {})
      .finally(() => setSubLoadingStudentCount(false))

    // ── Pre-fill existing subscription data ──
    getRequest(`subscription?tenantId=${editData._id}&isPagination=false`)
      .then((res) => {
        const subs = res?.data?.data?.subscriptions || res?.data?.subscriptions || []
        const existing = subs[0] // most recent subscription for this school
        if (!existing) return

        const planId = existing.currentPlan?.planId || existing.currentPlanDetails?._id || ''
        const billingCycle = existing.currentPlan?.billingCycle || existing.currentPlanDetails?.billingCycle || ''

        // Set plan tab based on existing plan type
        const planType = existing.currentPlanDetails?.planType || 'Plan'
        setSubPlanTab(planType)

        // Format billingMonth from existing billingMonth string (YYYY-MM)
        const billingMonth = existing.billingMonth || ''

        // Format dueDate to YYYY-MM-DD for date input
        const dueDate = existing.dueDate
          ? new Date(existing.dueDate).toISOString().split('T')[0]
          : ''

        setSubForm((p) => ({
          ...p,
          selectedPlan: planId ? String(planId) : p.selectedPlan,
          paidStatus: existing.paidStatus || 'PENDING',
          billingMonth: billingMonth,
          dueDate: dueDate,
          paymentRef: existing.paymentRef || '',
        }))

        // Store current addons for AddonManager
        setSubCurrentAddons(existing.currentAddons || [])
      })
      .catch(() => {}) // silently ignore — not critical
  }, [activeTab, editData])

  /* ── Field helpers ── */
  const set = (k, v) => { setForm(p => ({ ...p, [k]: v })); setErrors(p => ({ ...p, [k]: undefined })) }
  const setCP = (person, field, value) => {
    setForm(p => ({ ...p, [person]: { ...p[person], [field]: value } }))
    setErrors(p => ({ ...p, [`${person}_${field}`]: undefined }))
  }
  const renderError = field => errors[field] && <small className="text-danger">{errors[field]}</small>

  /* ── Subdomain availability check ── */
  const checkSubdomain = useCallback((value) => {
    clearTimeout(subdomainTimer.current)
    if (!value || value.length < 3) { setSubdomainStatus('idle'); return }
    setSubdomainStatus('checking')
    subdomainTimer.current = setTimeout(async () => {
      const controller = new AbortController()
      const t = setTimeout(() => controller.abort(), 5000)
      try {
        const res = await postRequest({ url: 'onboarding/check-subdomain', cred: { subdomain: value } })
        clearTimeout(t)
        const available = res?.data?.data?.available
        if (typeof available === 'boolean') { setSubdomainStatus(available ? 'available' : 'taken'); return }
        const msg = (res?.data?.message || '').toLowerCase()
        if (msg.includes('available')) setSubdomainStatus('available')
        else if (msg.includes('taken') || msg.includes('already')) setSubdomainStatus('taken')
        else setSubdomainStatus('idle')
      } catch (err) {
        clearTimeout(t)
        const msg = (err?.response?.data?.message || '').toLowerCase()
        if (msg.includes('taken') || msg.includes('already')) setSubdomainStatus('taken')
        else setSubdomainStatus('idle')
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
      const res = await fileUpload({ url: 'upload/uploadImage', cred: fd, isFormData: true })
      const url = res?.data?.data?.imageUrl
      if (!url) throw new Error('No URL')
      setLogoPreview(url); set('logo', url); toast.success('Logo uploaded')
    } catch { toast.error('Upload failed'); setLogoPreview(form.logo || null) }
    finally { setUploading(false); if (fileRef.current) fileRef.current.value = '' }
  }

  /* ── Compose flat address ── */
  const composeAddress = (f) => [f.addressLine1, f.city, f.state, f.country, f.pincode].filter(Boolean).join(', ')

  /* ── Validation ── */
  const validate = () => {
    const e = {}
    if (!form.schoolName.trim()) e.schoolName = 'Required'
    if (!isEdit && !form.subdomain.trim()) e.subdomain = 'Required'
    if (!isEdit && form.subdomain && !/^[a-z0-9-]+$/.test(form.subdomain)) e.subdomain = 'Only lowercase letters, numbers & hyphens'
    if (!isEdit && subdomainStatus === 'taken') e.subdomain = 'This subdomain is already taken'
    if (!form.schoolEmail.trim()) e.schoolEmail = 'Required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.schoolEmail)) e.schoolEmail = 'Enter valid email'
    if (!form.schoolContact.trim()) e.schoolContact = 'Required'
    else if (!/^\d{10}$/.test(form.schoolContact)) e.schoolContact = 'Enter valid 10-digit number'
    if (form.schoolContactAlt && !/^\d{10}$/.test(form.schoolContactAlt)) e.schoolContactAlt = 'Enter valid 10-digit number'
    if (!form.schoolCode.trim()) e.schoolCode = 'Required'
    if (!form.estNo.trim()) e.estNo = 'Required'
    if (!form.addressLine1.trim()) e.addressLine1 = 'Required'
    if (!form.city.trim()) e.city = 'Required'
    if (!form.state.trim()) e.state = 'Required'
    if (!form.country.trim()) e.country = 'Required'
    if (!form.pincode.trim()) e.pincode = 'Required'
    if (!form.razorpayKey.trim()) e.razorpayKey = 'Required'
    if (!form.razorpaySecret.trim()) e.razorpaySecret = 'Required'
    const cp1 = form.contactPerson1
    if (cp1.contactNo && !/^\d{10}$/.test(cp1.contactNo)) e.contactPerson1_contactNo = 'Enter valid 10-digit number'
    if (cp1.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cp1.email)) e.contactPerson1_email = 'Enter valid email'
    const cp2 = form.contactPerson2
    if (cp2.contactNo && !/^\d{10}$/.test(cp2.contactNo)) e.contactPerson2_contactNo = 'Enter valid 10-digit number'
    if (cp2.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cp2.email)) e.contactPerson2_email = 'Enter valid email'
    return e
  }

  /* ── Build payload ── */
  const buildPayload = () => {
    const t = v => typeof v === 'string' ? v.trim() : v
    const payload = { schoolName: t(form.schoolName) }
    const optional = ['logo','description','schoolEmail','schoolContact','schoolContactAlt','schoolCode','estNo',
      'razorpayKey','razorpaySecret','affiliationLine','affiliationNo','schoolMedium','msmeRegNo','isoRegNo',
      'regInfo','registrationNo','nitiAayog','managedBy','addressLine1','city','state','country','pincode']
    optional.forEach(k => { if (t(form[k])) payload[k] = t(form[k]) })
    const addr = composeAddress(form)
    if (addr) payload.schoolAddress = addr
    if (form.useCustomDb && form.dbUri.trim()) payload.dbUri = form.dbUri.trim()
    if (isEdit) payload.isActive = form.isActive
    if (!isEdit) payload.subdomain = t(form.subdomain)
    else if (t(form.subdomain)) payload.subdomain = t(form.subdomain)
    const buildCP = cp => { const o = {}; if(cp.name.trim()) o.name=cp.name.trim(); if(cp.designation.trim()) o.designation=cp.designation.trim(); if(cp.contactNo.trim()) o.contactNo=cp.contactNo.trim(); if(cp.email.trim()) o.email=cp.email.trim(); return Object.keys(o).length ? o : null }
    const cp1 = buildCP(form.contactPerson1); if(cp1) payload.contactPerson1 = cp1
    const cp2 = buildCP(form.contactPerson2); if(cp2) payload.contactPerson2 = cp2
    return payload
  }

  /* ── Submit ── */
  const handleSubmit = async () => {
    const e = validate()
    if (Object.keys(e).length) {
      setErrors(e)
      toast.error('Please fix the errors before submitting')
      // auto-navigate to first tab with error
      const tab1Keys = ['schoolName','subdomain','schoolEmail','schoolContact','schoolCode','estNo']
      const tab2Keys = ['addressLine1','city','state','country','pincode','schoolContactAlt','contactPerson1_contactNo','contactPerson1_email','contactPerson2_contactNo','contactPerson2_email']
      if (Object.keys(e).some(k => tab1Keys.includes(k))) setActiveTab('identity')
      else if (Object.keys(e).some(k => tab2Keys.includes(k))) setActiveTab('address')
      else setActiveTab('payment')
      return
    }
    setLoading(true)
    try {
      const payload = buildPayload()
      if (isEdit) { await putRequest({ url: `schools/${editData._id}`, cred: payload }); toast.success('Franchise updated successfully') }
      else { await postRequest({ url: 'schools', cred: payload }); toast.success('Franchise registered successfully') }
      refresh(); onClose()
    } catch (err) { toast.error(err?.response?.data?.message || (isEdit ? 'Update failed' : 'Registration failed')) }
    finally { setLoading(false) }
  }

  /* ── Subscription submit ── */
  const handleSubSubmit = async () => {
    const e = {}
    if (!subForm.selectedPlan) e.selectedPlan = 'Please select a subscription plan'
    if (!subForm.studentCount || Number(subForm.studentCount) < 1) e.studentCount = 'Enter current student count'
    if (!subForm.billingMonth) e.billingMonth = 'Select billing month'
    if (Object.keys(e).length) {
      setSubErrors(e)
      toast.error('Please complete all required fields')
      return
    }
    const selectedPlanData = subPlans.find((p) => String(p._id) === String(subForm.selectedPlan))
    const computedAmount = resolveAmount(selectedPlanData, Number(subForm.studentCount), subPricingConfig)
    setSubSubmitting(true)
    try {
      await postRequest({
        url: 'subscription/admin-assign',
        cred: {
          tenantId: editData._id,
          planId: subForm.selectedPlan,
          studentCount: Number(subForm.studentCount),
          totalAmount: computedAmount,
          paidStatus: subForm.paidStatus,
          billingMonth: subForm.billingMonth,
          ...(subForm.dueDate ? { dueDate: subForm.dueDate } : {}),
          ...(subForm.paymentRef ? { paymentRef: subForm.paymentRef } : {}),
        },
      })
      toast.success('Subscription assigned successfully')
      refresh?.()
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to assign subscription')
    } finally {
      setSubSubmitting(false)
    }
  }

  const TABS = [
    { key: 'identity', label: 'Franchise Identity' },
    { key: 'address',  label: 'Address & Contact' },
    { key: 'payment',  label: 'Payment & DB' },
    ...(isEdit ? [{ key: 'subscription', label: '💳 Subscription' }] : []),
  ]

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={960}
      destroyOnClose
      title={
        <div>
          <p className="mb-0" style={{ fontSize: 18, fontWeight: 600, color: '#1e293b' }}>
            {isEdit ? 'Edit Franchise' : 'Register Franchise'}
          </p>
          <p className="mb-0 text-muted" style={{ fontSize: 13, fontWeight: 400 }}>
            {isEdit ? 'Update franchise details below' : 'Fill in the required details to register a new franchise'}
          </p>
        </div>
      }
    >
      {/* ── Tab navigation (same pattern as Enrollment modal) ── */}
      <div style={{ borderBottom: '1px solid #dee2e6', marginBottom: 16 }}>
        <ul className="nav nav-tabs" style={{ borderBottom: 'none' }}>
          {TABS.map(({ key, label }) => (
            <li className="nav-item" key={key}>
              <button
                type="button"
                className={`nav-link ${activeTab === key ? 'active' : ''}`}
                style={{ fontSize: 13, color: '#0c3b73' }}
                onClick={() => setActiveTab(key)}
              >
                {label}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* ══════════════════════════════════════════
          TAB 1 — Franchise Identity
      ══════════════════════════════════════════ */}
      {activeTab === 'identity' && (
        <div className="container-fluid px-0">

          {/* Logo */}
          <div className="card mb-3">
            <div className="card-header !bg-[#0c3b73] text-white">Franchise Logo</div>
            <div className="card-body">
              <div className="d-flex align-items-center gap-4">
                {/* Preview box */}
                <div
                  onClick={() => !uploading && fileRef.current?.click()}
                  style={{ width: 80, height: 80, border: '2px dashed #cbd5e1', borderRadius: 12, overflow: 'hidden', cursor: uploading ? 'wait' : 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}
                >
                  {uploading ? <Loader2 size={22} className="text-primary animate-spin" />
                    : logoPreview ? <img src={logoPreview} alt="logo" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 4 }} />
                    : <div className="text-center"><Upload size={20} className="text-muted mb-1" /><div style={{ fontSize: 10, color: '#94a3b8' }}>Upload</div></div>}
                </div>
                <input ref={fileRef} type="file" accept="image/*" className="d-none" onChange={handleFileUpload} />
                <div className="flex-1">
                  <p className="mb-1" style={{ fontSize: 13, fontWeight: 500 }}>Upload or paste a logo URL</p>
                  <p className="text-muted mb-2" style={{ fontSize: 11 }}>PNG, JPG or SVG · Max 2 MB</p>
                  <input
                    className="form-control form-control-sm"
                    value={form.logo}
                    onChange={e => { set('logo', e.target.value); setLogoPreview(e.target.value || null) }}
                    placeholder="https://example.com/logo.png"
                  />
                  {logoPreview && !uploading && (
                    <button className="btn btn-link btn-sm text-danger p-0 mt-1" style={{ fontSize: 11 }}
                      onClick={() => { set('logo', ''); setLogoPreview(null); if(fileRef.current) fileRef.current.value='' }}>
                      Remove logo
                    </button>
                  )}
                  {uploading && <p className="text-primary mb-0 mt-1" style={{ fontSize: 11 }}>Uploading...</p>}
                </div>
              </div>
            </div>
          </div>

          {/* Basic Info */}
          <div className="card mb-3">
            <div className="card-header !bg-[#0c3b73] text-white">Basic Information</div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-4">
                  <label className="form-label">Franchise Name <span className="text-danger">*</span></label>
                  <input className={`form-control form-control-sm ${errors.schoolName ? 'is-invalid' : ''}`}
                    value={form.schoolName} onChange={e => set('schoolName', e.target.value)} placeholder="e.g. ABC Franchise" />
                  {renderError('schoolName')}
                </div>

                <div className="col-md-4">
                  <label className="form-label">Subdomain <span className="text-danger">*</span></label>
                  <div className="input-group input-group-sm">
                    <input
                      className={`form-control form-control-sm ${errors.subdomain ? 'is-invalid' : ''}`}
                      value={form.subdomain}
                      onChange={e => {
                        const val = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')
                        set('subdomain', val)
                        if (!isEdit) checkSubdomain(val)
                      }}
                      placeholder="e.g. dps-noida"
                      disabled={isEdit}
                    />
                    <span className="input-group-text" style={{ fontSize: 11 }}>.franchisecloudx.com</span>
                  </div>
                  {!isEdit && <SubdomainBadge status={subdomainStatus} />}
                  {isEdit && <small className="text-muted">Subdomain cannot be changed after registration</small>}
                  {renderError('subdomain')}
                </div>

                <div className="col-md-4">
                  <label className="form-label">Franchise Code <span className="text-danger">*</span></label>
                  <input className={`form-control form-control-sm ${errors.schoolCode ? 'is-invalid' : ''}`}
                    value={form.schoolCode} onChange={e => set('schoolCode', e.target.value)} placeholder="e.g. DPS001" />
                  {renderError('schoolCode')}
                </div>

                <div className="col-md-4">
                  <label className="form-label">Register Email ID <span className="text-danger">*</span></label>
                  <input type="email" className={`form-control form-control-sm ${errors.schoolEmail ? 'is-invalid' : ''}`}
                    value={form.schoolEmail} onChange={e => set('schoolEmail', e.target.value)} placeholder="franchise@gmail.com" />
                  {renderError('schoolEmail')}
                </div>

                <div className="col-md-4">
                  <label className="form-label">Register Phone No. <span className="text-danger">*</span></label>
                  <input className={`form-control form-control-sm ${errors.schoolContact ? 'is-invalid' : ''}`}
                    value={form.schoolContact}
                    onChange={e => set('schoolContact', e.target.value.replace(/\D/g,'').slice(0,10))}
                    placeholder="10-digit number" />
                  {renderError('schoolContact')}
                </div>

                <div className="col-md-4">
                  <label className="form-label">Establishment No. <span className="text-danger">*</span></label>
                  <input className={`form-control form-control-sm ${errors.estNo ? 'is-invalid' : ''}`}
                    value={form.estNo} onChange={e => set('estNo', e.target.value)} placeholder="e.g. EST/2001/001" />
                  {renderError('estNo')}
                </div>

                <div className="col-12">
                  <label className="form-label">Description</label>
                  <textarea className="form-control form-control-sm" rows={2}
                    value={form.description} onChange={e => set('description', e.target.value)}
                    placeholder="Brief description of the franchise (optional)" style={{ resize: 'none' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Registration & Accreditations */}
          <div className="card mb-3">
            <div className="card-header !bg-[#0c3b73] text-white">Registration &amp; Accreditations</div>
            <div className="card-body">
              <div className="row g-3">
                {[
                  ['affiliationLine','Affiliation Line','e.g. Affiliation PS'],
                  ['affiliationNo','Affiliation No.','e.g. 2131047'],
                  ['schoolMedium','School Medium','English / Hindi'],
                  ['msmeRegNo','MSME Reg. No.','UDYAM-XX-00-000000'],
                  ['isoRegNo','ISO Reg. No.','ISO-9001-2015'],
                  ['regInfo','Reg. Info','e.g. Reg. 12A'],
                  ['registrationNo','Registration No.','REG/2024/001'],
                  ['nitiAayog','NITI Aayog','NITI AAYOG/XX'],
                  ['managedBy','Managed By','Trust / Society'],
                ].map(([key, lbl, ph]) => (
                  <div className="col-md-4" key={key}>
                    <label className="form-label">{lbl}</label>
                    <input className="form-control form-control-sm" value={form[key]}
                      onChange={e => set(key, e.target.value)} placeholder={ph} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════
          TAB 2 — Address & Contact
      ══════════════════════════════════════════ */}
      {activeTab === 'address' && (
        <div className="container-fluid px-0">

          {/* Franchise Address */}
          <div className="card mb-3">
            <div className="card-header !bg-[#0c3b73] text-white">Franchise Address</div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-12">
                  <label className="form-label">Address Line 1 <span className="text-danger">*</span></label>
                  <input className={`form-control form-control-sm ${errors.addressLine1 ? 'is-invalid' : ''}`}
                    value={form.addressLine1} onChange={e => set('addressLine1', e.target.value)}
                    placeholder="Street / Building / Area" />
                  {renderError('addressLine1')}
                </div>
                <div className="col-md-3">
                  <label className="form-label">City / District <span className="text-danger">*</span></label>
                  <input className={`form-control form-control-sm ${errors.city ? 'is-invalid' : ''}`}
                    value={form.city} onChange={e => set('city', e.target.value)} placeholder="e.g. Noida" />
                  {renderError('city')}
                </div>
                <div className="col-md-3">
                  <label className="form-label">State <span className="text-danger">*</span></label>
                  <input className={`form-control form-control-sm ${errors.state ? 'is-invalid' : ''}`}
                    value={form.state} onChange={e => set('state', e.target.value)} placeholder="e.g. Uttar Pradesh" />
                  {renderError('state')}
                </div>
                <div className="col-md-3">
                  <label className="form-label">Country <span className="text-danger">*</span></label>
                  <input className={`form-control form-control-sm ${errors.country ? 'is-invalid' : ''}`}
                    value={form.country} onChange={e => set('country', e.target.value)} placeholder="e.g. India" />
                  {renderError('country')}
                </div>
                <div className="col-md-3">
                  <label className="form-label">Pincode <span className="text-danger">*</span></label>
                  <input className={`form-control form-control-sm ${errors.pincode ? 'is-invalid' : ''}`}
                    value={form.pincode} onChange={e => set('pincode', e.target.value.replace(/\D/g,'').slice(0,10))}
                    placeholder="e.g. 201301" />
                  {renderError('pincode')}
                </div>
                {(form.addressLine1 || form.city || form.state) && (
                  <div className="col-12">
                    <small className="text-muted">
                      <strong>Full address:</strong> {composeAddress(form)}
                    </small>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Contact Numbers */}
          <div className="card mb-3">
            <div className="card-header !bg-[#0c3b73] text-white">Contact Numbers</div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Alternate Contact No.</label>
                  <input className={`form-control form-control-sm ${errors.schoolContactAlt ? 'is-invalid' : ''}`}
                    value={form.schoolContactAlt}
                    onChange={e => set('schoolContactAlt', e.target.value.replace(/\D/g,'').slice(0,10))}
                    placeholder="10-digit number (optional)" />
                  {renderError('schoolContactAlt')}
                </div>
              </div>
            </div>
          </div>

          {/* Contact Person 1 */}
          <div className="card mb-3">
            <div className="card-header !bg-[#0c3b73] text-white">Contact Person 1</div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-3">
                  <label className="form-label">Full Name</label>
                  <input className="form-control form-control-sm"
                    value={form.contactPerson1.name} onChange={e => setCP('contactPerson1','name',e.target.value)}
                    placeholder="e.g. Ramesh Kumar" />
                </div>
                <div className="col-md-3">
                  <label className="form-label">Designation</label>
                  <input className="form-control form-control-sm"
                    value={form.contactPerson1.designation} onChange={e => setCP('contactPerson1','designation',e.target.value)}
                    placeholder="e.g. Principal" />
                </div>
                <div className="col-md-3">
                  <label className="form-label">Contact No.</label>
                  <input className={`form-control form-control-sm ${errors.contactPerson1_contactNo ? 'is-invalid' : ''}`}
                    value={form.contactPerson1.contactNo}
                    onChange={e => setCP('contactPerson1','contactNo',e.target.value.replace(/\D/g,'').slice(0,10))}
                    placeholder="10-digit number" />
                  {renderError('contactPerson1_contactNo')}
                </div>
                <div className="col-md-3">
                  <label className="form-label">Email ID</label>
                  <input type="email" className={`form-control form-control-sm ${errors.contactPerson1_email ? 'is-invalid' : ''}`}
                    value={form.contactPerson1.email} onChange={e => setCP('contactPerson1','email',e.target.value)}
                    placeholder="name@franchise.com" />
                  {renderError('contactPerson1_email')}
                </div>
              </div>
            </div>
          </div>

          {/* Contact Person 2 */}
          <div className="card mb-3">
            <div className="card-header !bg-[#0c3b73] text-white">Contact Person 2 <span style={{fontSize:11,fontWeight:400,opacity:0.8}}>(Optional)</span></div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-3">
                  <label className="form-label">Full Name</label>
                  <input className="form-control form-control-sm"
                    value={form.contactPerson2.name} onChange={e => setCP('contactPerson2','name',e.target.value)}
                    placeholder="e.g. Sunita Sharma" />
                </div>
                <div className="col-md-3">
                  <label className="form-label">Designation</label>
                  <input className="form-control form-control-sm"
                    value={form.contactPerson2.designation} onChange={e => setCP('contactPerson2','designation',e.target.value)}
                    placeholder="e.g. Vice Principal" />
                </div>
                <div className="col-md-3">
                  <label className="form-label">Contact No.</label>
                  <input className={`form-control form-control-sm ${errors.contactPerson2_contactNo ? 'is-invalid' : ''}`}
                    value={form.contactPerson2.contactNo}
                    onChange={e => setCP('contactPerson2','contactNo',e.target.value.replace(/\D/g,'').slice(0,10))}
                    placeholder="10-digit number" />
                  {renderError('contactPerson2_contactNo')}
                </div>
                <div className="col-md-3">
                  <label className="form-label">Email ID</label>
                  <input type="email" className={`form-control form-control-sm ${errors.contactPerson2_email ? 'is-invalid' : ''}`}
                    value={form.contactPerson2.email} onChange={e => setCP('contactPerson2','email',e.target.value)}
                    placeholder="name@franchise.com" />
                  {renderError('contactPerson2_email')}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════
          TAB 3 — Payment & DB
      ══════════════════════════════════════════ */}
      {activeTab === 'payment' && (
        <div className="container-fluid px-0">

          {/* Payment Gateway */}
          <div className="card mb-3">
            <div className="card-header !bg-[#0c3b73] text-white">Payment Gateway Configuration</div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Razorpay Key <span className="text-danger">*</span></label>
                  <input className={`form-control form-control-sm ${errors.razorpayKey ? 'is-invalid' : ''}`}
                    value={form.razorpayKey} onChange={e => set('razorpayKey', e.target.value)}
                    placeholder="Razorpay API Key" />
                  {renderError('razorpayKey')}
                </div>
                <div className="col-md-6">
                  <label className="form-label">Razorpay Secret <span className="text-danger">*</span></label>
                  <input className={`form-control form-control-sm ${errors.razorpaySecret ? 'is-invalid' : ''}`}
                    value={form.razorpaySecret} onChange={e => set('razorpaySecret', e.target.value)}
                    placeholder="Razorpay API Secret" />
                  {renderError('razorpaySecret')}
                </div>
              </div>
            </div>
          </div>

          {/* Database Configuration */}
          <div className="card mb-3">
            <div className="card-header !bg-[#0c3b73] text-white d-flex justify-content-between align-items-center">
              <span>Database Configuration</span>
              <div className="form-check form-switch mb-0">
                <input
                  className="form-check-input"
                  type="checkbox"
                  role="switch"
                  id="useCustomDb"
                  checked={form.useCustomDb}
                  onChange={() => setForm(p => ({ ...p, useCustomDb: !p.useCustomDb, dbUri: !p.useCustomDb ? p.dbUri : '' }))}
                  style={{ cursor: 'pointer' }}
                />
                <label className="form-check-label text-white" htmlFor="useCustomDb" style={{ fontSize: 12 }}>
                  Use Custom Database
                </label>
              </div>
            </div>
            <div className="card-body">
              {form.useCustomDb ? (
                <div>
                  <label className="form-label">Custom MongoDB URI</label>
                  <input className="form-control form-control-sm font-monospace"
                    value={form.dbUri} onChange={e => set('dbUri', e.target.value)}
                    placeholder="mongodb+srv://user:pass@cluster.mongodb.net/dbname" />
                  <small className="text-muted">Provide a valid MongoDB connection string</small>
                </div>
              ) : (
                <p className="text-muted mb-0" style={{ fontSize: 13 }}>
                  The shared default database will be used for this school.
                </p>
              )}
            </div>
          </div>

          {/* Status — edit only */}
          {isEdit && (
            <div className="card mb-3">
              <div className="card-header !bg-[#0c3b73] text-white">Franchise Status</div>
              <div className="card-body">
                <div className="form-check form-switch">
                  <input className="form-check-input" type="checkbox" role="switch" id="isActive"
                    checked={form.isActive} onChange={() => set('isActive', !form.isActive)}
                    style={{ cursor: 'pointer' }} />
                  <label className="form-check-label" htmlFor="isActive" style={{ fontWeight: 500 }}>
                    {form.isActive
                      ? <span className="text-success">Active</span>
                      : <span className="text-danger">Inactive</span>}
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════
          TAB 4 — Subscription (Edit only)
      ══════════════════════════════════════════ */}
      {activeTab === 'subscription' && isEdit && (
        <div className="container-fluid px-0" style={{ maxHeight: '65vh', overflowY: 'auto', paddingRight: 4 }}>

          {/* ① Current Status Banner — live data */}
          <CurrentSubStatus
            tenantId={editData._id}
            onRefresh={subStatusRefreshRef}
          />

          {/* ② Assign / Change Base Plan ─────────────────── */}
          <div className="card mb-3">
            <div className="card-header !bg-[#0c3b73] text-white d-flex align-items-center gap-2">
              <CreditCard size={14} />
              <span>Assign / Change Base Plan</span>
            </div>
            <div className="card-body">
              {subLoading ? (
                <div className="flex items-center justify-center py-6 gap-2 text-gray-400">
                  <Loader2 size={15} className="animate-spin" /><span className="text-sm">Loading plans…</span>
                </div>
              ) : (() => {
                const plans = subPlans.filter((p) => p.planType === 'Plan')
                return plans.length === 0
                  ? <div className="text-center py-4 text-sm text-gray-400">No subscription plans available</div>
                  : (
                    <div className="flex flex-col gap-2">
                      {plans.map((plan) => (
                        <PlanCard key={plan._id} plan={plan}
                          selected={subForm.selectedPlan === plan._id}
                          onSelect={(id) => { setSubForm((p) => ({ ...p, selectedPlan: id })); setSubErrors((p) => ({ ...p, selectedPlan: undefined })) }}
                        />
                      ))}
                    </div>
                  )
              })()}
              {subErrors.selectedPlan && <small className="text-danger d-block mt-1">{subErrors.selectedPlan}</small>}
            </div>
          </div>

          {/* ③ Billing Details ───────────────────────────── */}
          <div className="card mb-3">
            <div className="card-header !bg-[#0c3b73] text-white">Billing Details</div>
            <div className="card-body">

              {/* Student Count */}
              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <label className="form-label mb-0 d-flex align-items-center gap-1">
                    <Users size={13} /> Current Student Count <span className="text-danger">*</span>
                  </label>
                  {subStudentCountSource === 'auto' && (
                    <span className="badge bg-success-subtle text-success border border-success" style={{ fontSize: 10 }}>
                      ✅ Auto-fetched
                    </span>
                  )}
                </div>
                {subLoadingStudentCount ? (
                  <div className="form-control form-control-sm d-flex align-items-center gap-2 bg-light" style={{ height: 34 }}>
                    <Loader2 size={13} className="animate-spin text-secondary" />
                    <span style={{ fontSize: 12, color: '#94a3b8' }}>Fetching…</span>
                  </div>
                ) : (
                  <div className="d-flex gap-2">
                    <input type="number" min={1}
                      className={`form-control form-control-sm ${subErrors.studentCount ? 'is-invalid' : subStudentCountSource === 'auto' ? 'border-success' : ''}`}
                      value={subForm.studentCount}
                      onChange={(e) => { setSubForm((p) => ({ ...p, studentCount: e.target.value })); setSubStudentCountSource('manual'); setSubErrors((p) => ({ ...p, studentCount: undefined })) }}
                      placeholder="e.g. 1500" />
                    {subStudentCountSource === 'auto' && (
                      <button type="button" className="btn btn-sm btn-outline-warning" style={{ fontSize: 11, whiteSpace: 'nowrap' }}
                        onClick={() => { setSubForm((p) => ({ ...p, studentCount: '' })); setSubStudentCountSource('manual') }}>
                        Override
                      </button>
                    )}
                  </div>
                )}
                {subErrors.studentCount && <small className="text-danger">{subErrors.studentCount}</small>}
                <PriceBreakdown studentCount={Number(subForm.studentCount)} pricingConfig={subPricingConfig}
                  selectedPlan={subPlans.find(p => String(p._id) === String(subForm.selectedPlan))} />
              </div>

              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label">Billing Month <span className="text-danger">*</span></label>
                  <input type="month" className={`form-control form-control-sm ${subErrors.billingMonth ? 'is-invalid' : ''}`}
                    value={subForm.billingMonth}
                    onChange={(e) => { setSubForm((p) => ({ ...p, billingMonth: e.target.value })); setSubErrors((p) => ({ ...p, billingMonth: undefined })) }} />
                  {subErrors.billingMonth && <small className="text-danger">{subErrors.billingMonth}</small>}
                </div>
                <div className="col-md-6">
                  <label className="form-label">Due Date <span className="text-muted" style={{ fontSize: 11 }}>(optional)</span></label>
                  <input type="date" className="form-control form-control-sm" value={subForm.dueDate}
                    onChange={(e) => setSubForm((p) => ({ ...p, dueDate: e.target.value }))} />
                </div>
              </div>

              {/* Payment Status */}
              <div className="mb-3">
                <label className="form-label">Payment Status</label>
                <div className="flex gap-2">
                  {[
                    { value: 'PAID',    label: '✅ Paid',    cls: 'border-success bg-success-subtle text-success' },
                    { value: 'PENDING', label: '🕐 Pending', cls: 'border-warning bg-warning-subtle text-warning' },
                    { value: 'UNPAID',  label: '❌ Unpaid',  cls: 'border-danger bg-danger-subtle text-danger' },
                  ].map((opt) => (
                    <button key={opt.value} type="button"
                      onClick={() => setSubForm((p) => ({ ...p, paidStatus: opt.value }))}
                      className={`btn btn-sm flex-1 border-2 transition fw-semibold ${subForm.paidStatus === opt.value ? opt.cls : 'border-secondary-subtle text-secondary'}`}
                      style={{ fontSize: 12 }}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {subForm.paidStatus === 'PAID' && (
                <div className="mb-2">
                  <label className="form-label">Payment Reference <span className="text-muted" style={{ fontSize: 11 }}>(optional)</span></label>
                  <input type="text" className="form-control form-control-sm" value={subForm.paymentRef}
                    onChange={(e) => setSubForm((p) => ({ ...p, paymentRef: e.target.value }))}
                    placeholder="UTR / Cheque / Transaction ID" />
                </div>
              )}
            </div>
          </div>

          {/* ④ Summary before assigning ─────────────────── */}
          {subForm.selectedPlan && Number(subForm.studentCount) > 0 && (() => {
            const planData = subPlans.find((p) => String(p._id) === String(subForm.selectedPlan))
            const total = resolveAmount(planData, Number(subForm.studentCount), subPricingConfig)
            return planData ? (
              <div className="card mb-3">
                <div className="card-header !bg-[#0c3b73] text-white">Assignment Summary</div>
                <div className="card-body py-2">
                  <div className="row g-0">
                    {[
                      ['School', editData?.schoolName || '—'],
                      ['Plan', planData.name],
                      ['Billing Cycle', planData.billingCycle],
                      ['Students', subForm.studentCount],
                      ['Billing Month', subForm.billingMonth || '—'],
                      ['Payment Status', subForm.paidStatus],
                      ['Plan Amount', `₹${total?.toLocaleString('en-IN')}`],
                    ].map(([k, v]) => (
                      <div key={k} className="col-6 d-flex justify-content-between py-1 border-bottom" style={{ fontSize: 12 }}>
                        <span className="text-muted">{k}</span>
                        <span className={`fw-semibold ${k === 'Plan Amount' ? 'text-primary' : 'text-dark'}`}>{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : null
          })()}

          {/* ⑤ Addon Management ─────────────────────────── */}
          <div className="card mb-3">
            <div className="card-header !bg-purple-700 text-white d-flex align-items-center gap-2">
              <Puzzle size={14} />
              <span>Add-on Management</span>
              {subCurrentAddons.length > 0 && (
                <span className="ms-auto badge bg-white text-purple-700" style={{ fontSize: 10 }}>
                  {subCurrentAddons.length} active
                </span>
              )}
            </div>
            <div className="card-body">
              <AddonManager
                tenantId={editData._id}
                addons={subCurrentAddons}
                onAddonChange={() => {
                  // Refresh current addons + status banner
                  getRequest(`subscription?tenantId=${editData._id}&isPagination=false`)
                    .then((res) => {
                      const subs = res?.data?.data?.subscriptions || []
                      setSubCurrentAddons(subs[0]?.currentAddons || [])
                      subStatusRefreshRef.current?.()
                    })
                    .catch(() => {})
                }}
              />
            </div>
          </div>

        </div>
      )}

      {/* ── Footer ── */}
      <div className="text-end mt-4 pt-3 border-top d-flex justify-content-between align-items-center">
        <div>
          {activeTab !== 'identity' && (
            <button type="button" className="btn btn-outline-secondary btn-sm me-2"
              onClick={() => {
                if (activeTab === 'subscription') setActiveTab('payment')
                else if (activeTab === 'payment') setActiveTab('address')
                else setActiveTab('identity')
              }}>
              ← Back
            </button>
          )}
        </div>
        <div className="d-flex gap-2">
          <button type="button" className="btn btn-sm"
            style={{ border: '1px solid #dee2e6', color: '#374151' }}
            onClick={onClose}>
            Cancel
          </button>
          {activeTab === 'subscription' ? (
            <button
              type="button"
              className="btn btn-sm text-white d-flex align-items-center gap-1"
              style={{ backgroundColor: '#0c3b73' }}
              onClick={handleSubSubmit}
              disabled={subSubmitting}
            >
              {subSubmitting && <Loader2 size={14} className="animate-spin" />}
              {subSubmitting ? 'Assigning…' : 'Assign / Update Plan'}
            </button>
          ) : activeTab !== 'payment' ? (
            <button type="button" className="btn btn-sm text-white"
              style={{ backgroundColor: '#0c3b73' }}
              onClick={() => setActiveTab(activeTab === 'identity' ? 'address' : 'payment')}>
              Next →
            </button>
          ) : (
            <button type="button" className="btn btn-sm text-white d-flex align-items-center gap-1"
              style={{ backgroundColor: '#0c3b73' }}
              onClick={handleSubmit} disabled={loading || uploading}>
              {loading && <Loader2 size={14} className="animate-spin" />}
              {loading ? (isEdit ? 'Updating...' : 'Registering...') : (isEdit ? 'Update Franchise' : 'Register Franchise')}
            </button>
          )}
        </div>
      </div>

    </Modal>
  )
}

export default SchoolModal
