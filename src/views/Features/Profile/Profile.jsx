/* eslint-disable prettier/prettier */
import { useState, useContext, useEffect } from 'react'
import { Camera, Save, Lock, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'
import { AppContext } from '../../../Context/AppContext'
import { getRequest, putRequest, fileUpload } from '../../../Helpers'

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
        width: '100%', padding: '9px 12px',
        border: '1px solid #e5e7eb', borderRadius: '8px',
        fontSize: '13px', outline: 'none',
        background: readOnly ? '#f3f4f6' : '#f9fafb',
        color:      readOnly ? '#9ca3af' : '#374151',
        boxSizing: 'border-box',
      }}
    />
  </div>
)

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

export default function Profile() {
  const { user, setUser } = useContext(AppContext)

  const [tab, setTab]         = useState('profile')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving]   = useState(false)

  // Profile form state
  const [form, setForm] = useState({
    name:  '',
    email: '',
    phone: '',
    role:  '',
  })

  // Password form state
  const [pwd, setPwd] = useState({ current: '', newPwd: '', confirm: '' })
  const [pwdSaving, setPwdSaving] = useState(false)

  /* ── Load profile on mount ── */
  useEffect(() => {
    setLoading(true)
    getRequest('admins/me')
      .then((res) => {
        const d = res?.data?.data
        if (d) {
          setForm({
            name:  d.name  || '',
            email: d.email || '',
            phone: d.phone || '',
            role:  d.role  || '',
          })
          // Update AppContext with fresh data
          setUser((prev) => ({ ...prev, ...d }))
        }
      })
      .catch(() => toast.error('Failed to load profile'))
      .finally(() => setLoading(false))
  }, [])

  const set  = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))
  const setP = (k) => (e) => setPwd(f => ({ ...f, [k]: e.target.value }))

  /* ── Save profile ── */
  const handleSaveProfile = () => {
    if (!form.name.trim()) return toast.error('Name cannot be empty')
    setSaving(true)
    putRequest({ url: 'admins/me', cred: { name: form.name, phone: form.phone } })
      .then((res) => {
        const updated = res?.data?.data
        toast.success('Profile updated successfully ✅')
        if (updated) {
          setUser((prev) => ({ ...prev, ...updated }))
          localStorage.setItem('userId', JSON.stringify({ ...user, ...updated }))
        }
      })
      .catch((err) => toast.error(err?.response?.data?.message || 'Failed to update profile'))
      .finally(() => setSaving(false))
  }

  /* ── Change password ── */
  const handleChangePassword = () => {
    if (!pwd.current)           return toast.error('Current password is required')
    if (!pwd.newPwd)            return toast.error('New password is required')
    if (pwd.newPwd.length < 6)  return toast.error('New password must be at least 6 characters')
    if (pwd.newPwd !== pwd.confirm) return toast.error('Passwords do not match')

    setPwdSaving(true)
    putRequest({ url: 'admins/me/change-password', cred: { currentPassword: pwd.current, newPassword: pwd.newPwd } })
      .then(() => {
        toast.success('Password changed successfully ✅')
        setPwd({ current: '', newPwd: '', confirm: '' })
      })
      .catch((err) => toast.error(err?.response?.data?.message || 'Failed to change password'))
      .finally(() => setPwdSaving(false))
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '16px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: 700, color: '#111827', margin: 0 }}>Profile &amp; Security</h1>
          <p style={{ fontSize: '12px', color: '#9ca3af', margin: '2px 0 0' }}>Home / Profile</p>
        </div>
        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#9ca3af' }}>
            <RefreshCw size={13} /> Loading…
          </div>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px', overflow: 'hidden', width: 'fit-content' }}>
        {[['profile', 'Profile'], ['password', 'Change Password']].map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)}
            style={{ padding: '10px 24px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 600, background: tab === k ? '#1a73e8' : '#fff', color: tab === k ? '#fff' : '#6b7280', transition: 'all .15s' }}>
            {l}
          </button>
        ))}
      </div>

      {/* ════ Profile tab ════ */}
      {tab === 'profile' && (
        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '16px', alignItems: 'start' }}>

          {/* Avatar card */}
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '24px', textAlign: 'center' }}>
            <div style={{ position: 'relative', display: 'inline-block', marginBottom: '14px' }}>
              <div style={{ width: '90px', height: '90px', borderRadius: '50%', background: 'linear-gradient(135deg,#1a73e8,#0f1f3d)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', fontWeight: 700, color: '#fff', margin: '0 auto' }}>
                {form.name?.[0]?.toUpperCase() || 'A'}
              </div>
              <button
                style={{ position: 'absolute', bottom: 0, right: 0, width: '28px', height: '28px', borderRadius: '50%', background: '#1a73e8', border: '2px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                title="Upload photo (coming soon)">
                <Camera size={13} style={{ color: '#fff' }} />
              </button>
            </div>

            <p style={{ fontSize: '15px', fontWeight: 700, color: '#111827', margin: '0 0 4px' }}>
              {loading ? '…' : form.name || 'Admin'}
            </p>
            <p style={{ fontSize: '12px', color: '#9ca3af', margin: '0 0 8px' }}>
              {loading ? '…' : form.email}
            </p>
            <span style={{ fontSize: '11px', fontWeight: 600, padding: '4px 12px', borderRadius: '20px', background: form.role === 'SuperAdmin' ? '#f0ecff' : '#e8f1ff', color: form.role === 'SuperAdmin' ? '#7c3aed' : '#1a73e8', border: `1px solid ${form.role === 'SuperAdmin' ? '#d4c8ff' : '#c5d8ff'}` }}>
              {form.role || 'Admin'}
            </span>

            <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #f3f4f6', textAlign: 'left' }}>
              {[
                ['User ID',      user?.userId    || '—'],
                ['Member Since', fmtDate(user?.createdAt)],
                ['Last Login',   fmtDate(user?.lastLogin)],
              ].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '12px', color: '#6b7280' }}>{k}</span>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#111827' }}>{v}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Edit form */}
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '24px' }}>
            <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#111827', margin: '0 0 18px' }}>Edit Profile</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
              <Input label="Full Name"     value={form.name}  onChange={set('name')}  placeholder="Enter full name" />
              <Input label="Email Address" value={form.email} readOnly />
              <Input label="Phone Number"  value={form.phone} onChange={set('phone')} placeholder="+91 XXXXXXXXXX" />
              <Input label="Role"          value={form.role}  readOnly />
            </div>

            <div style={{ padding: '12px 14px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px', color: '#6b7280', marginBottom: '16px' }}>
              💡 Email and Role cannot be changed here. Contact the platform owner to update these.
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={handleSaveProfile}
                disabled={saving || loading}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', background: saving ? '#93c5fd' : '#1a73e8', color: '#fff', border: 'none', borderRadius: '8px', padding: '9px 20px', fontSize: '13px', fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer' }}>
                <Save size={14} /> {saving ? 'Saving…' : 'Update Profile'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════ Change Password tab ════ */}
      {tab === 'password' && (
        <div style={{ maxWidth: '480px', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#e8f1ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Lock size={16} style={{ color: '#1a73e8' }} />
            </div>
            <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#111827', margin: 0 }}>Change Password</h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <Input label="Current Password" type="password" value={pwd.current} onChange={setP('current')} placeholder="Enter current password" />
            <Input label="New Password"     type="password" value={pwd.newPwd}  onChange={setP('newPwd')}  placeholder="Min. 6 characters" />
            <Input label="Confirm Password" type="password" value={pwd.confirm} onChange={setP('confirm')} placeholder="Re-enter new password" />
          </div>

          {/* Password strength hints */}
          <div style={{ marginTop: '14px', padding: '12px', background: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
            <p style={{ fontSize: '11px', fontWeight: 600, color: '#6b7280', margin: '0 0 6px' }}>Password requirements:</p>
            {[
              ['At least 6 characters',       pwd.newPwd.length >= 6],
              ['Contains a number',            /\d/.test(pwd.newPwd)],
              ['Passwords match',              pwd.newPwd && pwd.newPwd === pwd.confirm],
            ].map(([rule, met]) => (
              <p key={rule} style={{ fontSize: '11px', color: met ? '#16a34a' : '#9ca3af', margin: '3px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '12px' }}>{met ? '✅' : '○'}</span> {rule}
              </p>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '18px', paddingTop: '16px', borderTop: '1px solid #f3f4f6' }}>
            <button
              onClick={handleChangePassword}
              disabled={pwdSaving}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', background: pwdSaving ? '#93c5fd' : '#1a73e8', color: '#fff', border: 'none', borderRadius: '8px', padding: '9px 20px', fontSize: '13px', fontWeight: 600, cursor: pwdSaving ? 'not-allowed' : 'pointer' }}>
              <Lock size={14} /> {pwdSaving ? 'Updating…' : 'Update Password'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
