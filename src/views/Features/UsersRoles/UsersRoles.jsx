/* eslint-disable prettier/prettier */
import { useState, useEffect, useCallback } from 'react'
import { Search, Plus, Edit2, Trash2, Shield, ChevronLeft, ChevronRight, RefreshCw, X, Save } from 'lucide-react'
import toast from 'react-hot-toast'
import { getRequest, postRequest, putRequest, deleteRequest } from '../../../Helpers'

/* ─── static role definitions (no role CRUD API exists yet) ─── */
const ROLES = [
  { name: 'SuperAdmin', desc: 'Full access to all modules',          perms: 12, color: '#7c3aed', bg: '#f0ecff', bd: '#d4c8ff' },
  { name: 'Admin',      desc: 'Manage franchises and subscriptions', perms: 8,  color: '#1a73e8', bg: '#e8f1ff', bd: '#c5d8ff' },
]

/* ─── helpers ─── */
const Badge = ({ status }) => {
  const m = {
    true:  ['#e8f8f0', '#16a34a', '#bbf0d0'],
    false: ['#fff1f1', '#dc2626', '#ffc5c5'],
  }
  const key   = String(status === true || status === 'Active')
  const [bg, tx, bd] = m[key] || ['#f3f4f6', '#6b7280', '#e5e7eb']
  const label = (status === true || status === 'Active') ? 'Active' : 'Inactive'
  return (
    <span style={{ fontSize: '11px', fontWeight: 600, padding: '3px 10px', borderRadius: '20px', background: bg, color: tx, border: `1px solid ${bd}` }}>
      {label}
    </span>
  )
}

const Th = ({ children }) => (
  <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: '11px', color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', background: '#f9fafb', borderBottom: '1px solid #e5e7eb', whiteSpace: 'nowrap' }}>
    {children}
  </th>
)
const Td = ({ children, style = {} }) => (
  <td style={{ padding: '10px 12px', fontSize: '13px', color: '#374151', borderBottom: '1px solid #f3f4f6', ...style }}>
    {children}
  </td>
)

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

/* ─── Add/Edit Modal ─── */
function UserModal({ open, onClose, onSaved, editUser }) {
  const isEdit = !!editUser
  const [form, setForm]   = useState({ name: '', email: '', phone: '', gender: '', role: 'Admin' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (editUser) {
      setForm({
        name:   editUser.name   || '',
        email:  editUser.email  || '',
        phone:  editUser.phone  || '',
        gender: editUser.gender || '',
        role:   editUser.role   || 'Admin',
      })
    } else {
      setForm({ name: '', email: '', phone: '', gender: '', role: 'Admin' })
    }
  }, [editUser, open])

  if (!open) return null

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.name.trim())  return toast.error('Name is required')
    if (!form.email.trim()) return toast.error('Email is required')

    setSaving(true)
    const req = isEdit
      ? putRequest({ url: `admins/${editUser._id}`, cred: form })
      : postRequest({ url: 'admins/create', cred: form })

    req
      .then((res) => {
        const msg = res?.data?.message || (isEdit ? 'Admin updated' : 'Admin created')
        toast.success(msg)
        // If new user, show credentials
        if (!isEdit && res?.data?.data?.credentials) {
          const { userId, password } = res.data.data.credentials
          toast.success(`Credentials — ID: ${userId} | Pass: ${password}`, { duration: 8000 })
        }
        onSaved()
        onClose()
      })
      .catch((err) => toast.error(err?.response?.data?.message || 'Failed to save'))
      .finally(() => setSaving(false))
  }

  const inputStyle = {
    width: '100%', padding: '8px 10px', border: '1px solid #e5e7eb',
    borderRadius: '7px', fontSize: '13px', outline: 'none',
    background: '#f9fafb', boxSizing: 'border-box',
  }
  const labelStyle = { fontSize: '12px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '4px' }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div style={{ background: '#fff', borderRadius: '14px', width: '100%', maxWidth: '480px', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
        {/* Modal header */}
        <div style={{ padding: '18px 22px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#111827', margin: 0 }}>
            {isEdit ? 'Edit Admin' : 'Add New Admin'}
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: '2px' }}>
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={labelStyle}>Full Name *</label>
              <input value={form.name} onChange={set('name')} placeholder="Enter full name" style={inputStyle} required />
            </div>
            <div>
              <label style={labelStyle}>Email Address *</label>
              <input value={form.email} onChange={set('email')} type="email" placeholder="email@example.com" style={inputStyle} required disabled={isEdit} />
            </div>
            <div>
              <label style={labelStyle}>Phone</label>
              <input value={form.phone} onChange={set('phone')} placeholder="+91 XXXXXXXXXX" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Gender</label>
              <select value={form.gender} onChange={set('gender')} style={inputStyle}>
                <option value="">Select gender</option>
                {['Male', 'Female', 'Other'].map(g => <option key={g}>{g}</option>)}
              </select>
            </div>
            <div style={{ gridColumn: '1/-1' }}>
              <label style={labelStyle}>Role</label>
              <select value={form.role} onChange={set('role')} style={inputStyle}>
                <option value="Admin">Admin</option>
                <option value="SuperAdmin">SuperAdmin</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '6px', borderTop: '1px solid #f3f4f6' }}>
            <button type="button" onClick={onClose} style={{ padding: '9px 18px', background: '#f3f4f6', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 600, color: '#374151', cursor: 'pointer' }}>
              Cancel
            </button>
            <button type="submit" disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 18px', background: saving ? '#93c5fd' : '#1a73e8', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 600, color: '#fff', cursor: saving ? 'not-allowed' : 'pointer' }}>
              <Save size={13} /> {saving ? 'Saving…' : (isEdit ? 'Update' : 'Create Admin')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ════════════════════════════════════════════════════════════ */
export default function UsersRoles() {
  const [tab, setTab]       = useState('users')
  const [users, setUsers]   = useState([])
  const [total, setTotal]   = useState(0)
  const [pages, setPages]   = useState(1)
  const [loading, setLoading] = useState(false)

  const [search, setSearch] = useState('')
  const [roleF, setRoleF]   = useState('All')
  const [page, setPage]     = useState(1)
  const PER = 10

  // modal state
  const [modalOpen, setModalOpen] = useState(false)
  const [editUser, setEditUser]   = useState(null)

  /* ── Fetch admins ── */
  const fetchUsers = useCallback(() => {
    setLoading(true)
    const params = new URLSearchParams({ page, limit: PER })
    if (search)          params.set('search', search)
    if (roleF !== 'All') params.set('role', roleF)

    getRequest(`admins?${params}`)
      .then((res) => {
        const d = res?.data?.data
        setUsers(d?.data       || [])
        setTotal(d?.total      || 0)
        setPages(d?.totalPages || 1)
      })
      .catch(() => toast.error('Failed to load admins'))
      .finally(() => setLoading(false))
  }, [page, search, roleF])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  const applyFilter = (fn) => { fn(); setPage(1) }

  /* ── Toggle active status ── */
  const handleToggle = (user) => {
    putRequest({ url: `admins/${user._id}`, cred: { isActive: !user.isActive } })
      .then(() => {
        toast.success(`${user.name} ${!user.isActive ? 'activated' : 'deactivated'}`)
        fetchUsers()
      })
      .catch(() => toast.error('Failed to toggle status'))
  }

  /* ── Delete admin ── */
  const handleDelete = (user) => {
    if (!window.confirm(`Delete admin "${user.name}"? This cannot be undone.`)) return
    deleteRequest(`admins/${user._id}`)
      .then(() => { toast.success('Admin deleted'); fetchUsers() })
      .catch((err) => toast.error(err?.response?.data?.message || 'Failed to delete'))
  }

  /* ── Open edit modal ── */
  const openEdit = (user) => { setEditUser(user); setModalOpen(true) }
  const openAdd  = ()     => { setEditUser(null);  setModalOpen(true) }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '16px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: 700, color: '#111827', margin: 0 }}>Users &amp; Roles</h1>
          <p style={{ fontSize: '12px', color: '#9ca3af', margin: '2px 0 0' }}>Home / Users &amp; Roles</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={fetchUsers}
            disabled={loading}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#fff', color: '#374151', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '9px 14px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', opacity: loading ? 0.6 : 1 }}>
            <RefreshCw size={13} /> Refresh
          </button>
          <button
            onClick={openAdd}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#1a73e8', color: '#fff', border: 'none', borderRadius: '8px', padding: '9px 16px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
            <Plus size={15} /> Add Admin
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px', overflow: 'hidden', width: 'fit-content' }}>
        {['users', 'roles'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{ padding: '10px 24px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 600, background: tab === t ? '#1a73e8' : '#fff', color: tab === t ? '#fff' : '#6b7280', transition: 'all .15s', textTransform: 'capitalize' }}>
            {t === 'users' ? 'Admins' : 'Roles'}
          </button>
        ))}
      </div>

      {/* ════ Users/Admins tab ════ */}
      {tab === 'users' && (
        <>
          {/* Filters */}
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '14px 18px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
              <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
              <input
                value={search}
                onChange={e => applyFilter(() => setSearch(e.target.value))}
                placeholder="Search name, email, userId…"
                style={{ width: '100%', padding: '8px 10px 8px 30px', border: '1px solid #e5e7eb', borderRadius: '7px', fontSize: '13px', outline: 'none', background: '#f9fafb' }}
              />
            </div>
            <select
              value={roleF}
              onChange={e => applyFilter(() => setRoleF(e.target.value))}
              style={{ padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: '7px', fontSize: '13px', background: '#f9fafb', color: '#374151', cursor: 'pointer' }}>
              {['All', 'Admin', 'SuperAdmin'].map(r => <option key={r}>{r}</option>)}
            </select>
          </div>

          {/* Table */}
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <Th>Name</Th><Th>User ID</Th><Th>Email</Th><Th>Role</Th>
                  <Th>Status</Th><Th>Last Login</Th><Th>Action</Th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} style={{ padding: '60px', textAlign: 'center', color: '#9ca3af', fontSize: '13px' }}>Loading…</td></tr>
                ) : users.length === 0 ? (
                  <tr><td colSpan={7} style={{ padding: '60px', textAlign: 'center', color: '#9ca3af', fontSize: '13px' }}>No admins found</td></tr>
                ) : (
                  users.map(u => (
                    <tr key={u._id} onMouseEnter={e => e.currentTarget.style.background = '#fafafa'} onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
                      <Td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#e8f1ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, color: '#1a73e8', flexShrink: 0 }}>
                            {(u.name || '?')[0].toUpperCase()}
                          </div>
                          <span style={{ fontWeight: 600, color: '#111827' }}>{u.name}</span>
                        </div>
                      </Td>
                      <Td><span style={{ fontFamily: 'monospace', fontSize: '12px', color: '#6b7280' }}>{u.userId}</span></Td>
                      <Td>{u.email || '—'}</Td>
                      <Td>
                        <span style={{ fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '20px', background: u.role === 'SuperAdmin' ? '#f0ecff' : '#e8f1ff', color: u.role === 'SuperAdmin' ? '#7c3aed' : '#1a73e8', border: `1px solid ${u.role === 'SuperAdmin' ? '#d4c8ff' : '#c5d8ff'}` }}>
                          {u.role}
                        </span>
                      </Td>
                      <Td>
                        <button
                          onClick={() => handleToggle(u)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                          title={u.isActive ? 'Click to deactivate' : 'Click to activate'}>
                          <Badge status={u.isActive} />
                        </button>
                      </Td>
                      <Td style={{ color: '#6b7280', fontSize: '12px' }}>{fmtDate(u.lastLogin)}</Td>
                      <Td>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            onClick={() => openEdit(u)}
                            style={{ background: '#fffbeb', border: 'none', borderRadius: '6px', padding: '5px 7px', cursor: 'pointer', color: '#d97706' }}
                            title="Edit admin">
                            <Edit2 size={13} />
                          </button>
                          <button
                            onClick={() => handleDelete(u)}
                            style={{ background: '#fff1f1', border: 'none', borderRadius: '6px', padding: '5px 7px', cursor: 'pointer', color: '#dc2626' }}
                            title="Delete admin">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </Td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* Pagination */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 18px', borderTop: '1px solid #f3f4f6' }}>
              <span style={{ fontSize: '12px', color: '#6b7280' }}>
                {total === 0 ? 'No entries' : `Showing ${(page - 1) * PER + 1}–${Math.min(page * PER, total)} of ${total} admins`}
              </span>
              <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  style={{ background: 'none', border: '1px solid #e5e7eb', borderRadius: '6px', padding: '4px 8px', cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.4 : 1 }}>
                  <ChevronLeft size={14} />
                </button>
                <span style={{ fontSize: '12px', color: '#374151', padding: '0 8px' }}>{page} / {pages}</span>
                <button
                  onClick={() => setPage(p => Math.min(pages, p + 1))}
                  disabled={page === pages}
                  style={{ background: 'none', border: '1px solid #e5e7eb', borderRadius: '6px', padding: '4px 8px', cursor: page === pages ? 'not-allowed' : 'pointer', opacity: page === pages ? 0.4 : 1 }}>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ════ Roles tab ════ */}
      {tab === 'roles' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px,1fr))', gap: '14px' }}>
          {ROLES.map(r => (
            <div key={r.name} style={{ background: '#fff', border: `1px solid ${r.bd}`, borderRadius: '10px', padding: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: r.bg, border: `1px solid ${r.bd}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Shield size={16} style={{ color: r.color }} />
                </div>
                <div>
                  <p style={{ fontSize: '13px', fontWeight: 700, color: '#111827', margin: 0 }}>{r.name}</p>
                  <p style={{ fontSize: '11px', color: '#9ca3af', margin: 0 }}>
                    {users.filter(u => u.role === r.name).length} users
                  </p>
                </div>
              </div>
              <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 10px' }}>{r.desc}</p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '10px', borderTop: '1px solid #f3f4f6' }}>
                <span style={{ fontSize: '12px', color: '#374151', fontWeight: 500 }}>{r.perms} Permissions</span>
                <span style={{ fontSize: '11px', color: r.color, fontWeight: 600 }}>Built-in Role</span>
              </div>
            </div>
          ))}
          <div style={{ background: '#fff', border: '2px dashed #e5e7eb', borderRadius: '10px', padding: '18px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', minHeight: '120px' }}>
            <Plus size={20} color="#9ca3af" />
            <p style={{ fontSize: '13px', color: '#9ca3af', margin: 0, fontWeight: 500 }}>Custom roles coming soon</p>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      <UserModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditUser(null) }}
        onSaved={fetchUsers}
        editUser={editUser}
      />
    </div>
  )
}
