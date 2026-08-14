/* eslint-disable prettier/prettier */
import { useState } from 'react'
import { Search, Plus, Eye, Edit2, ToggleLeft, ToggleRight, ChevronLeft, ChevronRight } from 'lucide-react'
import AddFranchiseModal from './AddFranchiseModal'

const MOCK = [
  { id: 1, name: 'Sharma Medical Store', owner: 'Rahul Sharma',    phone: '9876543210', plan: 'Professional', status: 'Active',   expiry: '31 Dec 2025', created: '01 Jan 2025' },
  { id: 2, name: 'Verma Pharmacy',        owner: 'Suresh Verma',   phone: '9876543211', plan: 'Basic',        status: 'Active',   expiry: '30 Nov 2025', created: '15 Jan 2025' },
  { id: 3, name: 'Patel Drug House',      owner: 'Nilesh Patel',   phone: '9876543212', plan: 'Enterprise',   status: 'Pending',  expiry: '28 Feb 2026', created: '20 Jan 2025' },
  { id: 4, name: 'Gupta Medicals',        owner: 'Bharat Gupta',   phone: '9876543213', plan: 'Professional', status: 'Pending',  expiry: '31 Mar 2026', created: '01 Feb 2025' },
  { id: 5, name: 'Life Line Pharmacy',    owner: 'Rakesh Mehta',   phone: '9876543214', plan: 'Basic',        status: 'Active',   expiry: '31 Oct 2025', created: '10 Feb 2025' },
  { id: 6, name: 'Khan Pharmacy',         owner: 'Imran Khan',     phone: '9876543215', plan: 'Basic',        status: 'Inactive', expiry: '30 Sep 2025', created: '15 Feb 2025' },
  { id: 7, name: 'City Medical Centre',   owner: 'Anand Rao',      phone: '9876543216', plan: 'Enterprise',   status: 'Active',   expiry: '31 Dec 2025', created: '20 Feb 2025' },
  { id: 8, name: 'Apollo Pharma Hub',     owner: 'Deepak Singh',   phone: '9876543217', plan: 'Professional', status: 'Active',   expiry: '31 Jan 2026', created: '01 Mar 2025' },
]

const PLAN_OPTS   = ['All Plans', 'Basic', 'Professional', 'Enterprise', 'Custom']
const STATUS_OPTS = ['All Status', 'Active', 'Inactive', 'Pending']

const Badge = ({ status }) => {
  const m = { Active: ['#e8f8f0', '#16a34a', '#bbf0d0'], Inactive: ['#fff1f1', '#dc2626', '#ffc5c5'], Pending: ['#fffbeb', '#d97706', '#fde68a'] }
  const [bg, tx, bd] = m[status] || ['#f3f4f6', '#6b7280', '#e5e7eb']
  return <span style={{ fontSize: '11px', fontWeight: 600, padding: '3px 10px', borderRadius: '20px', background: bg, color: tx, border: `1px solid ${bd}` }}>{status}</span>
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

export default function FranchiseManagement() {
  const [search, setSearch]   = useState('')
  const [plan, setPlan]       = useState('All Plans')
  const [status, setStatus]   = useState('All Status')
  const [addOpen, setAddOpen] = useState(false)
  const [page, setPage]       = useState(1)
  const PER = 10

  const filtered = MOCK.filter(f =>
    (search === '' || f.name.toLowerCase().includes(search.toLowerCase()) || f.owner.toLowerCase().includes(search.toLowerCase())) &&
    (plan   === 'All Plans'   || f.plan   === plan) &&
    (status === 'All Status'  || f.status === status)
  )

  const total = filtered.length
  const pages = Math.max(1, Math.ceil(total / PER))
  const rows  = filtered.slice((page - 1) * PER, page * PER)

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '0' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: 700, color: '#111827', margin: 0 }}>Franchise Management</h1>
          <p style={{ fontSize: '12px', color: '#9ca3af', margin: '2px 0 0' }}>Home / Franchise Management</p>
        </div>
        <button onClick={() => setAddOpen(true)}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#1a73e8', color: '#fff', border: 'none', borderRadius: '8px', padding: '9px 16px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
          <Plus size={15} /> Add Franchise
        </button>
      </div>

      {/* Filters */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '14px 18px', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1', minWidth: '200px' }}>
          <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
            placeholder="Search franchises..."
            style={{ width: '100%', paddingLeft: '30px', padding: '8px 10px 8px 30px', border: '1px solid #e5e7eb', borderRadius: '7px', fontSize: '13px', outline: 'none', background: '#f9fafb' }} />
        </div>
        {[
          { val: plan,   set: setPlan,   opts: PLAN_OPTS },
          { val: status, set: setStatus, opts: STATUS_OPTS },
        ].map((s, i) => (
          <select key={i} value={s.val} onChange={e => { s.set(e.target.value); setPage(1) }}
            style={{ padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: '7px', fontSize: '13px', color: '#374151', background: '#f9fafb', cursor: 'pointer' }}>
            {s.opts.map(o => <option key={o}>{o}</option>)}
          </select>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr><Th>Franchise Name</Th><Th>Owner Name</Th><Th>Phone</Th><Th>Plan</Th><Th>Status</Th><Th>Expiry Date</Th><Th>Created On</Th><Th>Action</Th></tr>
            </thead>
            <tbody>
              {rows.length === 0
                ? <tr><td colSpan={8} style={{ padding: '40px', textAlign: 'center', color: '#9ca3af', fontSize: '13px' }}>No franchises found</td></tr>
                : rows.map(f => (
                  <tr key={f.id} style={{ cursor: 'pointer' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                    onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                  >
                    <Td style={{ fontWeight: 600, color: '#111827' }}>{f.name}</Td>
                    <Td>{f.owner}</Td>
                    <Td>{f.phone}</Td>
                    <Td>
                      <span style={{ fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '20px', background: '#e8f1ff', color: '#1a73e8', border: '1px solid #c5d8ff' }}>{f.plan}</span>
                    </Td>
                    <Td><Badge status={f.status} /></Td>
                    <Td>{f.expiry}</Td>
                    <Td>{f.created}</Td>
                    <Td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <button title="View" style={{ background: '#e8f1ff', border: 'none', borderRadius: '6px', padding: '5px 7px', cursor: 'pointer', color: '#1a73e8' }}><Eye size={13} /></button>
                        <button title="Edit" style={{ background: '#fffbeb', border: 'none', borderRadius: '6px', padding: '5px 7px', cursor: 'pointer', color: '#d97706' }}><Edit2 size={13} /></button>
                        <button title="Toggle" style={{ background: f.status === 'Active' ? '#fff1f1' : '#e8f8f0', border: 'none', borderRadius: '6px', padding: '5px 7px', cursor: 'pointer', color: f.status === 'Active' ? '#dc2626' : '#16a34a' }}>
                          {f.status === 'Active' ? <ToggleRight size={13} /> : <ToggleLeft size={13} />}
                        </button>
                      </div>
                    </Td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 18px', borderTop: '1px solid #f3f4f6' }}>
          <span style={{ fontSize: '12px', color: '#6b7280' }}>Showing {Math.min((page - 1) * PER + 1, total)}–{Math.min(page * PER, total)} of {total} entries</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              style={{ background: 'none', border: '1px solid #e5e7eb', borderRadius: '6px', padding: '4px 8px', cursor: page === 1 ? 'not-allowed' : 'pointer', color: page === 1 ? '#d1d5db' : '#374151' }}>
              <ChevronLeft size={14} />
            </button>
            {[...Array(pages)].map((_, i) => (
              <button key={i} onClick={() => setPage(i + 1)}
                style={{ background: page === i + 1 ? '#1a73e8' : 'none', color: page === i + 1 ? '#fff' : '#374151', border: `1px solid ${page === i + 1 ? '#1a73e8' : '#e5e7eb'}`, borderRadius: '6px', padding: '4px 10px', fontSize: '12px', cursor: 'pointer', fontWeight: page === i + 1 ? 700 : 400 }}>
                {i + 1}
              </button>
            ))}
            <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages}
              style={{ background: 'none', border: '1px solid #e5e7eb', borderRadius: '6px', padding: '4px 8px', cursor: page === pages ? 'not-allowed' : 'pointer', color: page === pages ? '#d1d5db' : '#374151' }}>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {addOpen && <AddFranchiseModal onClose={() => setAddOpen(false)} />}
    </div>
  )
}
