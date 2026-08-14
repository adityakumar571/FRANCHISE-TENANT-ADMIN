/* eslint-disable prettier/prettier */
import { useState } from 'react'
import { Search, Plus, Eye, ChevronLeft, ChevronRight, MessageCircle } from 'lucide-react'

const TICKETS = [
  { id: 'TK-1001', subject: 'Unable to login',            franchise: 'Sharma Medical Store', priority: 'High',   status: 'Open',        created: '20 May 2025, 09:00', agent: 'Rajesh Kumar' },
  { id: 'TK-1002', subject: 'Payment gateway error',       franchise: 'Verma Pharmacy',        priority: 'Medium', status: 'In Progress', created: '20 May 2025, 08:30', agent: 'Priya Sharma' },
  { id: 'TK-1003', subject: 'Report not generating',       franchise: 'Khan Pharmacy',         priority: 'Low',    status: 'Resolved',    created: '19 May 2025, 05:15', agent: 'Vikram Singh' },
  { id: 'TK-1004', subject: 'User access issue',           franchise: 'Gupta Medicals',        priority: 'High',   status: 'Open',        created: '19 May 2025, 03:45', agent: 'Unassigned' },
  { id: 'TK-1005', subject: 'Subscription plan not updating', franchise: 'Patel Drug House',   priority: 'Medium', status: 'In Progress', created: '18 May 2025, 02:00', agent: 'Rajesh Kumar' },
  { id: 'TK-1006', subject: 'Billing amount mismatch',     franchise: 'Life Line Pharmacy',    priority: 'High',   status: 'Resolved',    created: '17 May 2025, 11:30', agent: 'Priya Sharma' },
]

const StatusBadge = ({ s }) => {
  const m = { Open: ['#fff1f1', '#dc2626', '#ffc5c5'], 'In Progress': ['#fffbeb', '#d97706', '#fde68a'], Resolved: ['#e8f8f0', '#16a34a', '#bbf0d0'] }
  const [bg, tx, bd] = m[s] || ['#f3f4f6', '#6b7280', '#e5e7eb']
  return <span style={{ fontSize: '11px', fontWeight: 600, padding: '3px 10px', borderRadius: '20px', background: bg, color: tx, border: `1px solid ${bd}` }}>{s}</span>
}
const PriBadge = ({ p }) => {
  const m = { High: ['#fff1f1', '#dc2626'], Medium: ['#fffbeb', '#d97706'], Low: ['#e8f8f0', '#16a34a'] }
  const [bg, tx] = m[p] || ['#f3f4f6', '#6b7280']
  return <span style={{ fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '20px', background: bg, color: tx }}>{p}</span>
}

const Th = ({ c }) => <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: '11px', color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', background: '#f9fafb', borderBottom: '1px solid #e5e7eb', whiteSpace: 'nowrap' }}>{c}</th>
const Td = ({ c, s = {} }) => <td style={{ padding: '10px 12px', fontSize: '13px', color: '#374151', borderBottom: '1px solid #f3f4f6', ...s }}>{c}</td>

export default function SupportTickets() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const PER = 10

  const totalOpen       = TICKETS.filter(t => t.status === 'Open').length
  const totalProgress   = TICKETS.filter(t => t.status === 'In Progress').length
  const totalResolved   = TICKETS.filter(t => t.status === 'Resolved').length

  const filtered = TICKETS.filter(t =>
    search === '' || t.subject.toLowerCase().includes(search.toLowerCase()) || t.franchise.toLowerCase().includes(search.toLowerCase())
  )
  const rows = filtered.slice((page - 1) * PER, page * PER)

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '16px' }}>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: 700, color: '#111827', margin: 0 }}>Support Tickets</h1>
          <p style={{ fontSize: '12px', color: '#9ca3af', margin: '2px 0 0' }}>Home / Support Tickets</p>
        </div>
        <button style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#1a73e8', color: '#fff', border: 'none', borderRadius: '8px', padding: '9px 16px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
          <Plus size={15} /> New Ticket
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '14px' }}>
        {[
          { label: 'All Tickets',  val: TICKETS.length, color: '#1a73e8', bg: '#e8f1ff', bd: '#c5d8ff' },
          { label: 'Open',         val: totalOpen,       color: '#dc2626', bg: '#fff1f1', bd: '#ffc5c5' },
          { label: 'In Progress',  val: totalProgress,   color: '#d97706', bg: '#fffbeb', bd: '#fde68a' },
          { label: 'Resolved',     val: totalResolved,   color: '#16a34a', bg: '#e8f8f0', bd: '#bbf0d0' },
        ].map(s => (
          <div key={s.label} style={{ background: '#fff', border: `1px solid ${s.bd}`, borderRadius: '10px', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MessageCircle size={18} style={{ color: s.color }} />
            </div>
            <div>
              <p style={{ fontSize: '11px', fontWeight: 600, color: '#6b7280', margin: 0, textTransform: 'uppercase' }}>{s.label}</p>
              <p style={{ fontSize: '22px', fontWeight: 700, color: '#111827', margin: 0 }}>{s.val}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '14px 18px', display: 'flex', gap: '12px' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} placeholder="Search tickets..."
            style={{ width: '100%', paddingLeft: '30px', padding: '8px 10px 8px 30px', border: '1px solid #e5e7eb', borderRadius: '7px', fontSize: '13px', outline: 'none', background: '#f9fafb' }} />
        </div>
      </div>

      {/* Table */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr>{['Ticket ID', 'Subject', 'Franchise Name', 'Priority', 'Created At', 'Status', 'Assigned To', 'Action'].map(h => <Th key={h} c={h} />)}</tr></thead>
          <tbody>
            {rows.map(t => (
              <tr key={t.id} onMouseEnter={e => e.currentTarget.style.background = '#fafafa'} onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
                <Td c={<span style={{ fontFamily: 'monospace', fontSize: '12px', color: '#1a73e8', fontWeight: 600 }}>{t.id}</span>} />
                <Td c={<span style={{ fontWeight: 600, color: '#111827' }}>{t.subject}</span>} />
                <Td c={t.franchise} />
                <Td c={<PriBadge p={t.priority} />} />
                <Td c={<span style={{ fontSize: '12px', color: '#6b7280' }}>{t.created}</span>} />
                <Td c={<StatusBadge s={t.status} />} />
                <Td c={t.agent} />
                <Td c={<button style={{ background: '#e8f1ff', border: 'none', borderRadius: '6px', padding: '5px 7px', cursor: 'pointer', color: '#1a73e8' }}><Eye size={13} /></button>} />
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 18px', borderTop: '1px solid #f3f4f6' }}>
          <span style={{ fontSize: '12px', color: '#6b7280' }}>Showing {rows.length} of {filtered.length} entries</span>
          <div style={{ display: 'flex', gap: '4px' }}>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} style={{ background: 'none', border: '1px solid #e5e7eb', borderRadius: '6px', padding: '4px 8px', cursor: 'pointer' }}><ChevronLeft size={14} /></button>
            <button onClick={() => setPage(p => Math.min(Math.ceil(filtered.length / PER), p + 1))} style={{ background: 'none', border: '1px solid #e5e7eb', borderRadius: '6px', padding: '4px 8px', cursor: 'pointer' }}><ChevronRight size={14} /></button>
          </div>
        </div>
      </div>
    </div>
  )
}
