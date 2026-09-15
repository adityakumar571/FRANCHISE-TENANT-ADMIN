/* eslint-disable prettier/prettier */
import { useState, useEffect } from 'react'
import { Save, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'
import { getRequest, putRequest } from '../../../Helpers'

const TABS = ['General Settings', 'Web Settings', 'Email Settings']

const Input = ({ label, value, onChange, type = 'text', placeholder = '', readOnly = false }) => (
  <div>
    <label style={{ fontSize: '12px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '4px' }}>
      {label}
    </label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      readOnly={readOnly}
      style={{
        width: '100%', padding: '8px 10px',
        border: '1px solid #e5e7eb', borderRadius: '7px',
        fontSize: '13px', outline: 'none',
        background: readOnly ? '#f3f4f6' : '#f9fafb',
        color: readOnly ? '#9ca3af' : '#374151',
        boxSizing: 'border-box',
      }}
    />
  </div>
)

/* default state shape — mirrors the SiteSettings model */
const DEFAULTS = {
  // General
  platformName:  'FranchizeAll',
  adminEmail:    'admin@franchizeall.com',
  supportEmail:  'support@franchizeall.com',
  phone:         '+91 9838075493',
  address:       '',
  timezone:      'Asia/Kolkata',
  currency:      'INR (₹)',
  // Web
  siteUrl:         '',
  logoUrl:         '',
  faviconUrl:      '',
  maintenanceMode: false,
  googleAnalytics: '',
  // Email
  smtpHost:  'smtp.gmail.com',
  smtpPort:  '587',
  smtpUser:  '',
  smtpPass:  '',
  fromName:  'FranchizeAll',
  fromEmail: 'noreply@franchizeall.com',
}

export default function SystemSettings() {
  const [activeTab, setActiveTab] = useState('General Settings')
  const [settings, setSettings]   = useState(DEFAULTS)
  const [loading, setLoading]     = useState(false)
  const [saving, setSaving]       = useState(false)

  /* ── Load settings on mount ── */
  useEffect(() => {
    setLoading(true)
    getRequest('site-settings')
      .then((res) => {
        const d = res?.data?.data
        if (d) {
          setSettings({
            platformName:    d.platformName    ?? DEFAULTS.platformName,
            adminEmail:      d.adminEmail      ?? DEFAULTS.adminEmail,
            supportEmail:    d.supportEmail    ?? DEFAULTS.supportEmail,
            phone:           d.phone           ?? DEFAULTS.phone,
            address:         d.address         ?? DEFAULTS.address,
            timezone:        d.timezone        ?? DEFAULTS.timezone,
            currency:        d.currency        ?? DEFAULTS.currency,
            siteUrl:         d.siteUrl         ?? DEFAULTS.siteUrl,
            logoUrl:         d.logoUrl         ?? DEFAULTS.logoUrl,
            faviconUrl:      d.faviconUrl      ?? DEFAULTS.faviconUrl,
            maintenanceMode: d.maintenanceMode ?? DEFAULTS.maintenanceMode,
            googleAnalytics: d.googleAnalytics ?? DEFAULTS.googleAnalytics,
            smtpHost:        d.smtpHost        ?? DEFAULTS.smtpHost,
            smtpPort:        d.smtpPort        ?? DEFAULTS.smtpPort,
            smtpUser:        d.smtpUser        ?? DEFAULTS.smtpUser,
            smtpPass:        d.smtpPass        ?? DEFAULTS.smtpPass,
            fromName:        d.fromName        ?? DEFAULTS.fromName,
            fromEmail:       d.fromEmail       ?? DEFAULTS.fromEmail,
          })
        }
      })
      .catch(() => toast.error('Failed to load settings'))
      .finally(() => setLoading(false))
  }, [])

  /* ── Generic field setter ── */
  const set = (key) => (e) =>
    setSettings((prev) => ({ ...prev, [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))

  /* ── Save current tab's fields ── */
  const handleSave = () => {
    setSaving(true)

    // Send only the fields relevant to the active tab (plus full object — backend ignores unknowns)
    putRequest({ url: 'site-settings/update', cred: settings })
      .then(() => toast.success('Settings saved successfully ✅'))
      .catch((err) => toast.error(err?.response?.data?.message || 'Failed to save settings'))
      .finally(() => setSaving(false))
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '16px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: 700, color: '#111827', margin: 0 }}>System Settings</h1>
          <p style={{ fontSize: '12px', color: '#9ca3af', margin: '2px 0 0' }}>Home / System Settings</p>
        </div>
        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#9ca3af' }}>
            <RefreshCw size={13} style={{ animation: 'spin 1s linear infinite' }} /> Loading…
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '16px', alignItems: 'start' }}>

        {/* ── Left tab nav ── */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px', overflow: 'hidden' }}>
          {TABS.map(t => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              style={{
                display: 'block', width: '100%', padding: '12px 16px',
                border: 'none', textAlign: 'left', fontSize: '13px',
                fontWeight: activeTab === t ? 700 : 500,
                background: activeTab === t ? '#e8f1ff' : '#fff',
                color: activeTab === t ? '#1a73e8' : '#374151',
                cursor: 'pointer',
                borderLeft: activeTab === t ? '3px solid #1a73e8' : '3px solid transparent',
                transition: 'all .15s',
              }}>
              {t}
            </button>
          ))}
        </div>

        {/* ── Right content panel ── */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '22px' }}>

          {/* ─── General Settings ─── */}
          {activeTab === 'General Settings' && (
            <>
              <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#111827', margin: '0 0 18px' }}>General Settings</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <Input label="Platform Name"  value={settings.platformName} onChange={set('platformName')} placeholder="Platform Name" />
                <Input label="Admin Email"    value={settings.adminEmail}   onChange={set('adminEmail')}   type="email" placeholder="admin@example.com" />
                <Input label="Support Email"  value={settings.supportEmail} onChange={set('supportEmail')} type="email" placeholder="support@example.com" />
                <Input label="Contact Phone"  value={settings.phone}        onChange={set('phone')}        placeholder="+91 XXXXXXXXXX" />
                <div style={{ gridColumn: '1/-1' }}>
                  <Input label="Address" value={settings.address} onChange={set('address')} placeholder="Full business address" />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '4px' }}>Timezone</label>
                  <select
                    value={settings.timezone}
                    onChange={set('timezone')}
                    style={{ width: '100%', padding: '8px 10px', border: '1px solid #e5e7eb', borderRadius: '7px', fontSize: '13px', outline: 'none', background: '#f9fafb' }}>
                    {['Asia/Kolkata', 'UTC', 'America/New_York', 'Europe/London', 'Asia/Dubai'].map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '4px' }}>Currency</label>
                  <select
                    value={settings.currency}
                    onChange={set('currency')}
                    style={{ width: '100%', padding: '8px 10px', border: '1px solid #e5e7eb', borderRadius: '7px', fontSize: '13px', outline: 'none', background: '#f9fafb' }}>
                    {['INR (₹)', 'USD ($)', 'EUR (€)', 'GBP (£)', 'AED (د.إ)'].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
            </>
          )}

          {/* ─── Web Settings ─── */}
          {activeTab === 'Web Settings' && (
            <>
              <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#111827', margin: '0 0 18px' }}>Web Settings</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div style={{ gridColumn: '1/-1' }}>
                  <Input label="Site URL" value={settings.siteUrl} onChange={set('siteUrl')} placeholder="https://example.com" />
                </div>
                <Input label="Logo URL"             value={settings.logoUrl}         onChange={set('logoUrl')}         placeholder="https://cdn.example.com/logo.png" />
                <Input label="Favicon URL"          value={settings.faviconUrl}      onChange={set('faviconUrl')}      placeholder="https://cdn.example.com/favicon.ico" />
                <Input label="Google Analytics ID"  value={settings.googleAnalytics} onChange={set('googleAnalytics')} placeholder="UA-XXXXXXXXX-X or G-XXXXXXXX" />
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 0' }}>
                  <input
                    type="checkbox"
                    checked={settings.maintenanceMode}
                    onChange={set('maintenanceMode')}
                    style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                  />
                  <label style={{ fontSize: '13px', color: '#374151', cursor: 'pointer', fontWeight: 500 }}>
                    Enable Maintenance Mode
                  </label>
                  {settings.maintenanceMode && (
                    <span style={{ fontSize: '11px', background: '#fff1f1', color: '#dc2626', padding: '2px 8px', borderRadius: '20px', fontWeight: 600 }}>
                      ACTIVE
                    </span>
                  )}
                </div>
              </div>
            </>
          )}

          {/* ─── Email Settings ─── */}
          {activeTab === 'Email Settings' && (
            <>
              <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#111827', margin: '0 0 18px' }}>Email / SMTP Settings</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <Input label="SMTP Host"     value={settings.smtpHost}  onChange={set('smtpHost')}  placeholder="smtp.gmail.com" />
                <Input label="SMTP Port"     value={settings.smtpPort}  onChange={set('smtpPort')}  placeholder="587" />
                <Input label="SMTP Username" value={settings.smtpUser}  onChange={set('smtpUser')}  placeholder="user@example.com" />
                <Input label="SMTP Password" type="password" value={settings.smtpPass} onChange={set('smtpPass')} placeholder="••••••••" />
                <Input label="From Name"     value={settings.fromName}  onChange={set('fromName')}  placeholder="Your Platform Name" />
                <Input label="From Email"    value={settings.fromEmail} onChange={set('fromEmail')} placeholder="noreply@example.com" />
              </div>
              <div style={{ marginTop: '14px', padding: '12px 14px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px', color: '#6b7280' }}>
                💡 SMTP credentials are stored securely and used for sending system emails (password resets, notifications).
              </div>
            </>
          )}

          {/* ─── Save button ─── */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #f3f4f6' }}>
            <button
              onClick={handleSave}
              disabled={saving || loading}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                background: saving ? '#93c5fd' : '#1a73e8',
                color: '#fff', border: 'none', borderRadius: '8px',
                padding: '9px 20px', fontSize: '13px', fontWeight: 600,
                cursor: saving ? 'not-allowed' : 'pointer',
                transition: 'background .15s',
              }}>
              <Save size={14} />
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
