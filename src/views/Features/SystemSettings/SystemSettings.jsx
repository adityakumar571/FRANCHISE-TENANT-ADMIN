/* eslint-disable prettier/prettier */
import { useState } from 'react'
import { Save } from 'lucide-react'

const TABS = ['General Settings', 'Web Settings', 'Email Settings']

const Input = ({ label, value, onChange, type = 'text', placeholder = '' }) => (
  <div>
    <label style={{ fontSize: '12px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '4px' }}>{label}</label>
    <input type={type} value={value} onChange={onChange} placeholder={placeholder}
      style={{ width: '100%', padding: '8px 10px', border: '1px solid #e5e7eb', borderRadius: '7px', fontSize: '13px', outline: 'none', background: '#f9fafb', boxSizing: 'border-box' }} />
  </div>
)

export default function SystemSettings() {
  const [activeTab, setActiveTab] = useState('General Settings')
  const [general, setGeneral] = useState({
    platformName: 'FranchizeAll',
    adminEmail: 'admin@franchizeall.com',
    supportEmail: 'support@franchizeall.com',
    phone: '+91 9876543210',
    address: '123, Business Hub, Mumbai, Maharashtra',
    timezone: 'Asia/Kolkata',
    currency: 'INR (₹)',
  })
  const [web, setWeb] = useState({
    siteUrl: 'https://franchizeall.com',
    logoUrl: '',
    faviconUrl: '',
    maintenanceMode: false,
    googleAnalytics: 'UA-XXXXXXXXX-X',
  })
  const [email, setEmail] = useState({
    smtpHost: 'smtp.gmail.com',
    smtpPort: '587',
    smtpUser: 'noreply@franchizeall.com',
    smtpPass: '',
    fromName: 'FranchizeAll',
    fromEmail: 'noreply@franchizeall.com',
  })

  const setG = (k) => (e) => setGeneral(f => ({ ...f, [k]: e.target.value }))
  const setW = (k) => (e) => setWeb(f => ({ ...f, [k]: e.target.value }))
  const setE = (k) => (e) => setEmail(f => ({ ...f, [k]: e.target.value }))

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div>
        <h1 style={{ fontSize: '18px', fontWeight: 700, color: '#111827', margin: 0 }}>System Settings</h1>
        <p style={{ fontSize: '12px', color: '#9ca3af', margin: '2px 0 0' }}>Home / System Settings</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '16px', alignItems: 'start' }}>
        {/* Left tabs */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px', overflow: 'hidden' }}>
          {TABS.map(t => (
            <button key={t} onClick={() => setActiveTab(t)}
              style={{ display: 'block', width: '100%', padding: '12px 16px', border: 'none', textAlign: 'left', fontSize: '13px', fontWeight: activeTab === t ? 700 : 500, background: activeTab === t ? '#e8f1ff' : '#fff', color: activeTab === t ? '#1a73e8' : '#374151', cursor: 'pointer', borderLeft: activeTab === t ? '3px solid #1a73e8' : '3px solid transparent', transition: 'all .15s' }}>
              {t}
            </button>
          ))}
        </div>

        {/* Right content */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '22px' }}>
          {activeTab === 'General Settings' && (
            <>
              <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#111827', margin: '0 0 18px' }}>General Settings</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <Input label="Platform Name"   value={general.platformName}  onChange={setG('platformName')}  placeholder="Platform Name" />
                <Input label="Admin Email"     value={general.adminEmail}    onChange={setG('adminEmail')}    type="email" placeholder="admin@example.com" />
                <Input label="Support Email"   value={general.supportEmail}  onChange={setG('supportEmail')}  type="email" placeholder="support@example.com" />
                <Input label="Contact Phone"   value={general.phone}         onChange={setG('phone')}         placeholder="+91 XXXXXXXXXX" />
                <div style={{ gridColumn: '1/-1' }}>
                  <Input label="Address" value={general.address} onChange={setG('address')} placeholder="Address" />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '4px' }}>Timezone</label>
                  <select value={general.timezone} onChange={setG('timezone')}
                    style={{ width: '100%', padding: '8px 10px', border: '1px solid #e5e7eb', borderRadius: '7px', fontSize: '13px', outline: 'none', background: '#f9fafb' }}>
                    {['Asia/Kolkata', 'UTC', 'America/New_York', 'Europe/London'].map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '4px' }}>Currency</label>
                  <select value={general.currency} onChange={setG('currency')}
                    style={{ width: '100%', padding: '8px 10px', border: '1px solid #e5e7eb', borderRadius: '7px', fontSize: '13px', outline: 'none', background: '#f9fafb' }}>
                    {['INR (₹)', 'USD ($)', 'EUR (€)', 'GBP (£)'].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
            </>
          )}

          {activeTab === 'Web Settings' && (
            <>
              <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#111827', margin: '0 0 18px' }}>Web Settings</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div style={{ gridColumn: '1/-1' }}>
                  <Input label="Site URL" value={web.siteUrl} onChange={setW('siteUrl')} placeholder="https://example.com" />
                </div>
                <Input label="Logo URL"    value={web.logoUrl}    onChange={setW('logoUrl')}    placeholder="https://..." />
                <Input label="Favicon URL" value={web.faviconUrl} onChange={setW('faviconUrl')} placeholder="https://..." />
                <Input label="Google Analytics ID" value={web.googleAnalytics} onChange={setW('googleAnalytics')} placeholder="UA-XXXXXXXXX-X" />
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 0' }}>
                  <input type="checkbox" checked={web.maintenanceMode} onChange={e => setWeb(f => ({ ...f, maintenanceMode: e.target.checked }))} style={{ width: '16px', height: '16px', cursor: 'pointer' }} />
                  <label style={{ fontSize: '13px', color: '#374151', cursor: 'pointer', fontWeight: 500 }}>Enable Maintenance Mode</label>
                </div>
              </div>
            </>
          )}

          {activeTab === 'Email Settings' && (
            <>
              <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#111827', margin: '0 0 18px' }}>Email Settings</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <Input label="SMTP Host"  value={email.smtpHost}  onChange={setE('smtpHost')}  placeholder="smtp.gmail.com" />
                <Input label="SMTP Port"  value={email.smtpPort}  onChange={setE('smtpPort')}  placeholder="587" />
                <Input label="SMTP User"  value={email.smtpUser}  onChange={setE('smtpUser')}  placeholder="user@example.com" />
                <Input label="SMTP Password" type="password" value={email.smtpPass} onChange={setE('smtpPass')} placeholder="••••••••" />
                <Input label="From Name"  value={email.fromName}  onChange={setE('fromName')}  placeholder="Your Platform" />
                <Input label="From Email" value={email.fromEmail} onChange={setE('fromEmail')} placeholder="noreply@example.com" />
              </div>
            </>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #f3f4f6' }}>
            <button style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#1a73e8', color: '#fff', border: 'none', borderRadius: '8px', padding: '9px 20px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
              <Save size={14} /> Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
