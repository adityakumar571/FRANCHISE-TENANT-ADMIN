/* eslint-disable prettier/prettier */
import { useState } from 'react'
import { Search, Plus, Edit2, Trash2, Shield, ChevronLeft, ChevronRight } from 'lucide-react'

const USERS = [
  { id: 1, name: 'Rajesh Kumar',    email: 'rajesh@example.com',  role: 'Super Admin', status: 'Active',   lastLogin: '20 May 2025, 09:30 AM', franchise: 'All' },
  { id: 2, name: 'Priya Sharma',    email: 'priya@example.com',   role: 'Admin',        status: 'Active',   lastLogin: '20 May 2025, 08:15 AM', franchise: 'Sharma Medical' },
  { id: 3, name: 'Suresh Verma',    email: 'suresh@example.com',  role: 'Manager',      status: 'Active',   lastLogin: '19 May 2025, 05:45 PM', franchise: 'Verma Pharmacy' },
  { id: 4, name: 'Anita Gupta',     email: 'anita@example.com',   role: 'Billing',      status: 'Inactive', lastLogin: '15 May 2025, 11:20 AM', franchise: 'Gupta Medicals' },
  { id: 5, name: 'Vikram Singh',    email: 'vikram@example.com',  role: 'Support',      status: 'Active',   lastLogin: '20 May 2025, 07:50 AM', franchise: 'All' },
  { id: 6, name: 'Meena Patel',     email: 'meena@example.com',   role: 'Admin',        status: 'Active',   lastLogin: '18 May 2025, 03:30 PM', franchise: 'Patel Drug House' },
]

const ROLES = [
  { name: 'Super Admin', desc: 'Full access to all modules',          perms: 12, users: 2,  color: '#7c3aed', bg: '#f0ecff', bd: '#d4c8ff' },
  { name: 'Admin',       desc: 'Manage franchises and subscriptions', perms: 8,  users: 15, color: '#1a73e8', bg: '#e8f1ff', bd: '#c5d8ff' },
  { name: 'Manager',     desc: 'Manage franchise operations',         perms: 6,  users: 28, color: '#16a34a', bg: '#e8f8f0', bd: '#bbf0d0' },
  { name: 'Support',     desc: 'Handle support tickets',              perms: 4,  users: 12, color: '#ea7c1e', bg: '#fff4e6', bd: '#ffd9a8' },
  { name: 'Billing',     desc: 'Manage payments and invoices',        perms: 5,  users: 8,  color: '#dc2626', bg: '#fff1f1', bd: '#ffc5c5' },
]

const Badge = ({ status }) => {
  const m = { Active: ['#e8f8f0', '#16a34a', '#bbf0d0'], Inactive: ['#fff1f1', '#dc2626', '#ffc5c5'] }
  const [bg, tx, bd] = m[status] || ['#f3f4f6', '#6b7280', '#e5e7eb']
  return <span style={{ fontSize: '11px', fontWeight: 600, padding: '3px 10px', borderRadius: '20px', background: bg, color: tx, border: `1px solid ${bd}` }}>{status}</span>
}

const Th = ({ children }) => <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: '11px', color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', background: '#f9fafb', borderBottom: '1px solid #e5e7eb', whiteSpace: 'nowrap' }}>{children}</th>
const Td = ({ children, style = {} }) => <td style={{ padding: '10px 12px', fontSize: '13px', color: '#374151', borderBottom: '1px solid #f3f4f6', ...style }}>{children}</td>

export default function UsersRoles() {
  const [tab, setTab]     = useState('users')
  const [search, setSearch] = useState('')
  const [page, setPage]   = useState(1)
  const PER = 10

  const filtered = USERS.filter(u =>
    search === '' || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
  )
  const pages = Math.max(1, Math.ceil(filtered.length / PER))
  const rows  = filtered.slice((page - 1) * PER, page * PER)

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '16px' }}>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: 700, color: '#111827', margin: 0 }}>Users &amp; Roles</h1>
          <p style={{ fontSize: '12px', color: '#9ca3af', margin: '2px 0 0' }}>Home / Users &amp; Roles</p>
        </div>
        <button style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#1a73e8', color: '#fff', border: 'none', borderRadius: '8px', padding: '9px 16px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
          <Plus size={15} /> Add User
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px', overflow: 'hidden', width: 'fit-content' }}>
        {['users', 'roles'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{ padding: '10px 24px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 600, background: tab === t ? '#1a73e8' : '#fff', color: tab === t ? '#fff' : '#6b7280', transition: 'all .15s', textTransform: 'capitalize' }}>
            {t === 'users' ? 'Users' : 'Roles'}
          </button>
        ))}
      </div>

      {tab === 'users' && (
        <>
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '14px 18px', display: 'flex', gap: '12px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
              <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} placeholder="Search users..."
                style={{ width: '100%', paddingLeft: '30px', padding: '8px 10px 8px 30px', border: '1px solid #e5e7eb', borderRadius: '7px', fontSize: '13px', outline: 'none', background: '#f9fafb' }} />
            </div>
          </div>
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr><Th>Name</Th><Th>Email</Th><Th>Role</Th><Th>Status</Th><Th>Last Login</Th><Th>Franchise</Th><Th>Action</Th></tr></thead>
              <tbody>
                {rows.map(u => (
                  <tr key={u.id}>
                    <Td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#e8f1ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, color: '#1a73e8', flexShrink: 0 }}>
                          {u.name[0]}
                        </div>
                        <span style={{ fontWeight: 600, color: '#111827' }}>{u.name}</span>
                      </div>
                    </Td>
                    <Td>{u.email}</Td>
                    <Td>
                      <span style={{ fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '20px', background: '#e8f1ff', color: '#1a73e8', border: '1px solid #c5d8ff' }}>{u.role}</span>
                    </Td>
                    <Td><Badge status={u.status} /></Td>
                    <Td style={{ color: '#6b7280', fontSize: '12px' }}>{u.lastLogin}</Td>
                    <Td>{u.franchise}</Td>
                    <Td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button style={{ background: '#fffbeb', border: 'none', borderRadius: '6px', padding: '5px 7px', cursor: 'pointer', color: '#d97706' }}><Edit2 size={13} /></button>
                        <button style={{ background: '#fff1f1', border: 'none', borderRadius: '6px', padding: '5px 7px', cursor: 'pointer', color: '#dc2626' }}><Trash2 size={13} /></button>
                      </div>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 18px', borderTop: '1px solid #f3f4f6' }}>
              <span style={{ fontSize: '12px', color: '#6b7280' }}>Showing {rows.length} of {filtered.length} entries</span>
              <div style={{ display: 'flex', gap: '4px' }}>
                <button onClick={() => setPage(p => Math.max(1, p - 1))} style={{ background: 'none', border: '1px solid #e5e7eb', borderRadius: '6px', padding: '4px 8px', cursor: 'pointer' }}><ChevronLeft size={14} /></button>
                <button onClick={() => setPage(p => Math.min(pages, p + 1))} style={{ background: 'none', border: '1px solid #e5e7eb', borderRadius: '6px', padding: '4px 8px', cursor: 'pointer' }}><ChevronRight size={14} /></button>
              </div>
            </div>
          </div>
        </>
      )}

      {tab === 'roles' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px,1fr))', gap: '14px' }}>
          {ROLES.map(r => (
            <div key={r.name} style={{ background: '#fff', border: `1px solid ${r.bd}`, borderRadius: '10px', padding: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: r.bg, border: `1px solid ${r.bd}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Shield size={16} style={{ color: r.color }} />
                  </div>
                  <div>
                    <p style={{ fontSize: '13px', fontWeight: 700, color: '#111827', margin: 0 }}>{r.name}</p>
                    <p style={{ fontSize: '11px', color: '#9ca3af', margin: 0 }}>{r.users} users</p>
                  </div>
                </div>
                <button style={{ background: '#fffbeb', border: 'none', borderRadius: '6px', padding: '5px 7px', cursor: 'pointer', color: '#d97706' }}><Edit2 size={13} /></button>
              </div>
              <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 10px' }}>{r.desc}</p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '10px', borderTop: '1px solid #f3f4f6' }}>
                <span style={{ fontSize: '12px', color: '#374151', fontWeight: 500 }}>{r.perms} Permissions</span>
                <button style={{ fontSize: '11px', color: r.color, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>View →</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
