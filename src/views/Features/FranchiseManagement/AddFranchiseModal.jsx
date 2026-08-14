/* eslint-disable prettier/prettier */
import { useState } from 'react'
import { X, Upload } from 'lucide-react'

const Label = ({ children, req }) => (
  <label style={{ fontSize: '12px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '4px' }}>
    {children}{req && <span style={{ color: '#dc2626' }}> *</span>}
  </label>
)
const Input = ({ ...props }) => (
  <input {...props} style={{ width: '100%', padding: '8px 10px', border: '1px solid #e5e7eb', borderRadius: '7px', fontSize: '13px', outline: 'none', background: '#f9fafb', boxSizing: 'border-box', ...props.style }} />
)
const Select = ({ children, ...props }) => (
  <select {...props} style={{ width: '100%', padding: '8px 10px', border: '1px solid #e5e7eb', borderRadius: '7px', fontSize: '13px', outline: 'none', background: '#f9fafb', boxSizing: 'border-box', cursor: 'pointer' }}>
    {children}
  </select>
)

export default function AddFranchiseModal({ onClose }) {
  const [form, setForm] = useState({
    franchiseName: '', ownerName: '', email: '', phone: '', businessType: '',
    gstNo: '', address: '', city: '', state: '', pincode: '',
    plan: '', billingCycle: 'Monthly', startDate: '', endDate: '',
  })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = (e) => {
    e.preventDefault()
    alert('Franchise added (mock)!')
    onClose()
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 999, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
      <div style={{ width: '520px', height: '100vh', background: '#fff', display: 'flex', flexDirection: 'column', overflowY: 'auto', boxShadow: '-4px 0 24px rgba(0,0,0,0.15)' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 22px', borderBottom: '1px solid #e5e7eb', position: 'sticky', top: 0, background: '#fff', zIndex: 1 }}>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', margin: 0 }}>Add Franchise</h2>
            <p style={{ fontSize: '11px', color: '#9ca3af', margin: 0 }}>Franchise Management &rsaquo; Add Franchise</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', padding: '4px' }}><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: '20px', flex: 1 }}>

          {/* Business Information */}
          <section>
            <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#111827', margin: '0 0 12px', paddingBottom: '8px', borderBottom: '1px solid #f3f4f6' }}>Business Information</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <Label req>Franchise Name</Label>
                <Input placeholder="Enter franchise name" value={form.franchiseName} onChange={e => set('franchiseName', e.target.value)} required />
              </div>
              <div>
                <Label req>Owner Name</Label>
                <Input placeholder="Enter owner name" value={form.ownerName} onChange={e => set('ownerName', e.target.value)} required />
              </div>
              <div>
                <Label req>Email Address</Label>
                <Input type="email" placeholder="Enter email" value={form.email} onChange={e => set('email', e.target.value)} required />
              </div>
              <div>
                <Label req>Phone Number</Label>
                <Input type="tel" placeholder="Enter phone number" value={form.phone} onChange={e => set('phone', e.target.value)} required />
              </div>
              <div>
                <Label>GST Number</Label>
                <Input placeholder="Enter GST number" value={form.gstNo} onChange={e => set('gstNo', e.target.value)} />
              </div>
              <div>
                <Label req>Business Type</Label>
                <Select value={form.businessType} onChange={e => set('businessType', e.target.value)} required>
                  <option value="">Select business type</option>
                  <option>Pharmacy</option>
                  <option>Medical Store</option>
                  <option>Clinic</option>
                  <option>Hospital</option>
                  <option>Other</option>
                </Select>
              </div>
            </div>
          </section>

          {/* Address */}
          <section>
            <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#111827', margin: '0 0 12px', paddingBottom: '8px', borderBottom: '1px solid #f3f4f6' }}>Address</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <Label>Address</Label>
                <Input placeholder="Enter address" value={form.address} onChange={e => set('address', e.target.value)} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                <div>
                  <Label>State</Label>
                  <Select value={form.state} onChange={e => set('state', e.target.value)}>
                    <option value="">Select state</option>
                    {['Delhi', 'Maharashtra', 'Uttar Pradesh', 'Gujarat', 'Rajasthan', 'Karnataka'].map(s => <option key={s}>{s}</option>)}
                  </Select>
                </div>
                <div>
                  <Label>City</Label>
                  <Select value={form.city} onChange={e => set('city', e.target.value)}>
                    <option value="">Select city</option>
                    {['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Pune', 'Ahmedabad'].map(c => <option key={c}>{c}</option>)}
                  </Select>
                </div>
                <div>
                  <Label>Pincode</Label>
                  <Input placeholder="Enter pincode" value={form.pincode} onChange={e => set('pincode', e.target.value)} />
                </div>
              </div>
            </div>
          </section>

          {/* Subscription & Plan */}
          <section>
            <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#111827', margin: '0 0 12px', paddingBottom: '8px', borderBottom: '1px solid #f3f4f6' }}>Subscription &amp; Plan</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <Label req>Plan Name</Label>
                <Select value={form.plan} onChange={e => set('plan', e.target.value)} required>
                  <option value="">Select plan</option>
                  {['Basic', 'Professional', 'Enterprise', 'Custom'].map(p => <option key={p}>{p}</option>)}
                </Select>
              </div>
              <div>
                <Label>Association Type</Label>
                <Select value={form.billingCycle} onChange={e => set('billingCycle', e.target.value)}>
                  <option>Monthly</option>
                  <option>Yearly</option>
                </Select>
              </div>
              <div>
                <Label>Start Date</Label>
                <Input type="date" value={form.startDate} onChange={e => set('startDate', e.target.value)} />
              </div>
              <div>
                <Label>End Date</Label>
                <Input type="date" value={form.endDate} onChange={e => set('endDate', e.target.value)} />
              </div>
            </div>
          </section>

          {/* Upload Documents */}
          <section>
            <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#111827', margin: '0 0 12px', paddingBottom: '8px', borderBottom: '1px solid #f3f4f6' }}>Upload Documents</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {['Logo', 'Documents'].map(doc => (
                <div key={doc}>
                  <Label>{doc}</Label>
                  <div style={{ border: '1px dashed #d1d5db', borderRadius: '8px', padding: '16px', textAlign: 'center', background: '#f9fafb', cursor: 'pointer' }}>
                    <Upload size={18} style={{ color: '#9ca3af', margin: '0 auto 4px' }} />
                    <p style={{ fontSize: '11px', color: '#9ca3af', margin: 0 }}>Choose File</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Footer */}
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', paddingTop: '10px', borderTop: '1px solid #f3f4f6' }}>
            <button type="button" onClick={onClose}
              style={{ padding: '9px 20px', border: '1px solid #e5e7eb', borderRadius: '8px', background: '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer', color: '#374151' }}>
              Cancel
            </button>
            <button type="submit"
              style={{ padding: '9px 20px', border: 'none', borderRadius: '8px', background: '#1a73e8', color: '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
              Save Franchise
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
