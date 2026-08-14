import React, { useContext, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { CHeader, CContainer } from '@coreui/react'
import {
  Menu,
  Bell,
  ChevronDown,
  LogOut,
  User,
  Settings,
  Calendar,
} from 'lucide-react'
import { AppContext } from '../Context/AppContext'
import { deleteCookie } from '../Hooks/cookie'
import Cookies from 'js-cookie'

const AppHeader = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const sidebarShow = useSelector((state) => state.sidebarShow)
  const { user } = useContext(AppContext)
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const today = new Date().toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  })

  const handleLogout = () => {
    deleteCookie('multitenant')
    localStorage.removeItem('userId')
    Cookies.remove('multitenant')
    navigate('/login')
  }

  return (
    <CHeader
      position="sticky"
      className="p-0"
      style={{ backgroundColor: '#fff', borderBottom: '1px solid #e5e7eb', zIndex: 2 }}
    >
      <CContainer
        fluid
        className="px-4 d-flex align-items-center justify-content-between"
        style={{ height: '58px' }}
      >
        {/* LEFT — hamburger + title */}
        <div className="d-flex align-items-center gap-3">
          <button
            onClick={() => dispatch({ type: 'set', sidebarShow: !sidebarShow })}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#374151', borderRadius: '6px' }}
          >
            <Menu size={20} />
          </button>

          <div>
            <h1 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', margin: 0, lineHeight: 1.2 }}>
              Super Admin Dashboard
            </h1>
            <p style={{ fontSize: '11px', color: '#9ca3af', margin: 0 }}>
              Home / Dashboard
            </p>
          </div>
        </div>

        {/* RIGHT — date + bell + profile */}
        <div className="d-flex align-items-center gap-3">

          {/* Date range */}
          <div
            className="d-none d-md-flex align-items-center gap-2"
            style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '5px 12px', cursor: 'pointer' }}
          >
            <Calendar size={14} style={{ color: '#6b7280' }} />
            <span style={{ fontSize: '12px', color: '#374151', fontWeight: 500 }}>{today}</span>
            <ChevronDown size={12} style={{ color: '#9ca3af' }} />
          </div>

          {/* Notification bell */}
          <button
            style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer', padding: '6px', borderRadius: '8px', color: '#374151' }}
          >
            <Bell size={18} />
            <span
              style={{
                position: 'absolute', top: '2px', right: '2px',
                width: '8px', height: '8px', borderRadius: '50%',
                backgroundColor: '#ef4444', border: '1px solid #fff',
              }}
            />
          </button>

          {/* Profile dropdown */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setDropdownOpen((o) => !o)}
              className="d-flex align-items-center gap-2"
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px', borderRadius: '8px' }}
            >
              <div
                style={{
                  width: '32px', height: '32px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, #0f1f3d 0%, #1e3a6e 100%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontSize: '13px', fontWeight: 600, flexShrink: 0,
                }}
              >
                {user?.name?.[0]?.toUpperCase() || 'S'}
              </div>
              <div className="d-none d-md-block text-start">
                <p style={{ fontSize: '12px', fontWeight: 600, color: '#111827', margin: 0, lineHeight: 1.2 }}>
                  {user?.name || 'Super Admin'}
                </p>
                <p style={{ fontSize: '10px', color: '#9ca3af', margin: 0 }}>
                  {user?.role || 'Administrator'}
                </p>
              </div>
              <ChevronDown size={13} style={{ color: '#9ca3af' }} />
            </button>

            {/* Dropdown menu */}
            {dropdownOpen && (
              <>
                <div
                  style={{ position: 'fixed', inset: 0, zIndex: 40 }}
                  onClick={() => setDropdownOpen(false)}
                />
                <div
                  style={{
                    position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                    width: '180px', background: '#fff', borderRadius: '10px',
                    border: '1px solid #e5e7eb', boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                    zIndex: 50, overflow: 'hidden',
                  }}
                >
                  <div style={{ padding: '10px 14px', borderBottom: '1px solid #f3f4f6' }}>
                    <p style={{ fontSize: '12px', fontWeight: 600, color: '#111827', margin: 0 }}>
                      {user?.name || 'Super Admin'}
                    </p>
                    <p style={{ fontSize: '11px', color: '#9ca3af', margin: 0 }}>{user?.email || ''}</p>
                  </div>
                  {[
                    { icon: User,     label: 'My Profile',  action: () => navigate('/profile') },
                    { icon: Settings, label: 'Settings',    action: () => navigate('/settings') },
                  ].map(({ icon: Icon, label, action }) => (
                    <button
                      key={label}
                      onClick={() => { setDropdownOpen(false); action() }}
                      className="w-100 d-flex align-items-center gap-2"
                      style={{ background: 'none', border: 'none', padding: '9px 14px', cursor: 'pointer', fontSize: '12px', color: '#374151', textAlign: 'left' }}
                    >
                      <Icon size={14} style={{ color: '#9ca3af' }} />
                      {label}
                    </button>
                  ))}
                  <div style={{ borderTop: '1px solid #f3f4f6' }}>
                    <button
                      onClick={handleLogout}
                      className="w-100 d-flex align-items-center gap-2"
                      style={{ background: 'none', border: 'none', padding: '9px 14px', cursor: 'pointer', fontSize: '12px', color: '#ef4444', textAlign: 'left' }}
                    >
                      <LogOut size={14} style={{ color: '#ef4444' }} />
                      Logout
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </CContainer>
    </CHeader>
  )
}

export default AppHeader
