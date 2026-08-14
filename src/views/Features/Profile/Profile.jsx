/* eslint-disable prettier/prettier */
import { useState, useContext } from 'react'
import { Camera, Save, Lock } from 'lucide-react'
import { AppContext } from '../../../Context/AppContext'

const Input = ({ label, value, onChange, type = 'text', placeholder = '', readOnly = false }) => (
  <div>
    <label style={{ fontSize: '12px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '4px' }}>{label}</label>
    <input type={type} value={value} onChange={onChange} placeholder={placeholder} readOnly={readOnly}
      style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '13px', outline: 'none', background: readOnly ? '#f3f4f6' : '#f9fafb', boxSizing: 'border-box', color: readOnly ? '#9ca3af' : '#374151' }} />
  </div>
)

export default function Profile() {
  const { user } = useContext(AppContext)
  const [tab, setTab] = useState('profile')
  const [form, setForm] = useState({
    name:  user?.name  || 'Super Admin',
    email: user?.email || 'superadmin@franchizeall.com',
    phone: user?.phone || '+91 9999999999',
    role:  user?.role  || 'SuperAdmin',
  })
  const [pwd, setPwd] = useState({ current: '', newPwd: '', confirm: '' })

  const set  = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))
  const setP = (k) => (e) => setPwd(f => ({ ...f, [k]: e.target.value }))

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div>
        <h1 style={{ fontSize: '18px', fontWeight: 700, color: '#111827', margin: 0 }}>Profile &amp; Security</h1>
        <p style={{ fontSize: '12px', color: '#9ca3af', margin: '2px 0 0' }}>Home / Profile</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px', overflow: 'hidden', width: 'fit-content' }}>
        {[['profile', 'Profile'], ['password', 'Change Password']].map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)}
            style={{ padding: '10px 24px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 600, background: tab === k ? '#1a73e8' : '#fff', color: tab === k ? '#fff' : '#6b7280' }}>
            {l}
          </button>
        ))}
      </div>

      {tab === 'profile' && (
        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '16px', alignItems: 'start' }}>
          {/* Avatar card */}
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '24px', textAlign: 'center' }}>
            <div style={{ position: 'relative', display: 'inline-block', marginBottom: '14px' }}>
              <div style={{ width: '90px', height: '90px', borderRadius: '50%', background: 'linear-gradient(135deg,#1a73e8,#0f1f3d)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', fontWeight: 700, color: '#fff', margin: '0 auto' }}>
                {form.name?.[0]?.toUpperCase() || 'S'}
              </div>
              <button style={{ position: 'absolute', bottom: 0, right: 0, width: '28px', height: '28px', borderRadius: '50%', background: '#1a73e8', border: '2px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <Camera size={13} style={{ color: '#fff' }} />
              </button>
            </div>
            <p style={{ fontSize: '15px', fontWeight: 700, color: '#111827', margin: '0 0 4px' }}>{form.name}</p>
            <p style={{ fontSize: '12px', color: '#9ca3af', margin: '0 0 8px' }}>{form.email}</p>
            <span style={{ fontSize: '11px', fontWeight: 600, padding: '4px 12px', borderRadius: '20px', background: '#f0ecff', color: '#7c3aed', border: '1px solid #d4c8ff' }}>{form.role}</span>

            <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #f3f4f6', textAlign: 'left' }}>
              {[['User ID', user?.userId || 'superadmin'], ['Member Since', 'Jan 2025'], ['Last Login', 'Today']].map(([k, v]) => (
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
              <Input label="Full Name"  value={form.name}  onChange={set('name')}  placeholder="Enter name" />
              <Input label="Email Address" value={form.email} onChange={set('email')} type="email" placeholder="Enter email" />
              <Input label="Phone Number"  value={form.phone} onChange={set('phone')} placeholder="+91 XXXXXXXXXX" />
              <Input label="Role" value={form.role} readOnly />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '16px', borderTop: '1px solid #f3f4f6' }}>
              <button style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#1a73e8', color: '#fff', border: 'none', borderRadius: '8px', padding: '9px 20px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                <Save size={14} /> Update Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {tab === 'password' && (
        <div style={{ maxWidth: '480px', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#e8f1ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Lock size={16} style={{ color: '#1a73e8' }} />
            </div>
            <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#111827', margin: 0 }}>Change Password</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <Input label="Current Password" type="password" value={pwd.current}  onChange={setP('current')}  placeholder="Enter current password" />
            <Input label="New Password"     type="password" value={pwd.newPwd}   onChange={setP('newPwd')}   placeholder="Enter new password" />
            <Input label="Confirm Password" type="password" value={pwd.confirm}  onChange={setP('confirm')}  placeholder="Confirm new password" />
          </div>
          {/* Password rules */}
          <div style={{ marginTop: '14px', padding: '12px', background: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
            <p style={{ fontSize: '11px', fontWeight: 600, color: '#6b7280', margin: '0 0 6px' }}>Password must contain:</p>
            {['At least 8 characters', 'One uppercase letter', 'One number', 'One special character'].map(r => (
              <p key={r} style={{ fontSize: '11px', color: '#9ca3af', margin: '2px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ color: '#d1d5db' }}>•</span> {r}
              </p>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '18px', paddingTop: '16px', borderTop: '1px solid #f3f4f6' }}>
            <button style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#1a73e8', color: '#fff', border: 'none', borderRadius: '8px', padding: '9px 20px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
              <Lock size={14} /> Update Password
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
