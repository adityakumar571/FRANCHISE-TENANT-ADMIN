/* eslint-disable prettier/prettier */
import { useState } from 'react'
import { Search, ChevronLeft, ChevronRight } from 'lucide-react'

const LOGS = [
  { time: '20 May 2025, 09:30 AM', user: 'Rajesh Kumar',  action: 'Created Franchise',  target: 'Sharma Medical Store', ip: '192.168.1.10', module: 'Franchise', type: 'Create' },
  { time: '20 May 2025, 09:15 AM', user: 'Priya Sharma',  action: 'Login',               target: 'System',               ip: '192.168.1.11', module: 'Auth',      type: 'Login'  },
  { time: '20 May 2025, 08:50 AM', user: 'Rajesh Kumar',  action: 'Updated Subscription',target: 'Verma Pharmacy',        ip: '192.168.1.10', module: 'Billing',   type: 'Update' },
  { time: '20 May 2025, 08:20 AM', user: 'System',        action: 'Auto Expired',        target: 'Patel Drug House',      ip: 'System',       module: 'Billing',   type: 'System' },
  { time: '19 May 2025, 05:45 PM', user: 'Suresh Verma',  action: 'Changed Password',    target: 'Profile',               ip: '192.168.1.15', module: 'Auth',      type: 'Update' },
  { time: '19 May 2025, 03:30 PM', user: 'Priya Sharma',  action: 'Deleted User',        target: 'Demo Account',          ip: '192.168.1.11', module: 'Users',     type: 'Delete' },
  { time: '18 May 2025, 02:10 PM', user: 'Rajesh Kumar',  action: 'Activated Franchise', target: 'Gupta Medicals',        ip: '192.168.1.10', module: 'Franchise', type: 'Update' },
  { time: '17 May 2025, 11:00 AM', user: 'System',        action: 'Backup Completed',    target: 'Database',              ip: 'System',       module: 'System',    type: 'System' },
]

const TYPE_COLOR = { Create: ['#e8f8f0', '#16a34a'], Login: ['#e8f1ff', '#1a73e8'], Update: ['#fffbeb', '#d97706'], Delete: ['#fff1f1', '#dc2626'], System: ['#f0ecff', '#7c3aed'] }

const Th = ({ c }) => <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: '11px', color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', background: '#f9fafb', borderBottom: '1px solid #e5e7eb', whiteSpace: 'nowrap' }}>{c}</th>
const Td = ({ c, s = {} }) => <td style={{ padding: '10px 12px', fontSize: '13px', color: '#374151', borderBottom: '1px solid #f3f4f6', ...s }}>{c}</td>

export default function ActivityLogs() {
  const [search, setSearch]   = useState('')
  const [from, setFrom]       = useState('')
  const [to, setTo]           = useState('')
  const [type, setType]       = useState('All')
  const [page, setPage]       = useState(1)
  const PER = 10

  const filtered = LOGS.filter(l =>
    (search === '' || l.user.toLowerCase().includes(search.toLowerCase()) || l.action.toLowerCase().includes(search.toLowerCase())) &&
    (type === 'All' || l.type === type)
  )
  const rows = filtered.slice((page - 1) * PER, page * PER)

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div>
        <h1 style={{ fontSize: '18px', fontWeight: 700, color: '#111827', margin: 0 }}>Activity Logs</h1>
        <p style={{ fontSize: '12px', color: '#9ca3af', margin: '2px 0 0' }}>Home / Activity Logs</p>
      </div>

      {/* Filters */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '14px 18px', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
          <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} placeholder="Search logs..."
            style={{ width: '100%', padding: '8px 10px 8px 30px', border: '1px solid #e5e7eb', borderRadius: '7px', fontSize: '13px', outline: 'none', background: '#f9fafb' }} />
        </div>
        <input type="date" value={from} onChange={e => setFrom(e.target.value)} style={{ padding: '8px 10px', border: '1px solid #e5e7eb', borderRadius: '7px', fontSize: '13px', background: '#f9fafb', color: '#374151' }} />
        <input type="date" value={to} onChange={e => setTo(e.target.value)} style={{ padding: '8px 10px', border: '1px solid #e5e7eb', borderRadius: '7px', fontSize: '13px', background: '#f9fafb', color: '#374151' }} />
        <select value={type} onChange={e => { setType(e.target.value); setPage(1) }}
          style={{ padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: '7px', fontSize: '13px', background: '#f9fafb', color: '#374151', cursor: 'pointer' }}>
          {['All', 'Create', 'Update', 'Delete', 'Login', 'System'].map(t => <option key={t}>{t}</option>)}
        </select>
      </div>

      {/* Table */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr>{['Date & Time', 'User', 'Action', 'Target', 'IP Address', 'Module', 'Type'].map(h => <Th key={h} c={h} />)}</tr></thead>
          <tbody>
            {rows.length === 0
              ? <tr><td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: '#9ca3af', fontSize: '13px' }}>No logs found</td></tr>
              : rows.map((l, i) => {
                  const [bg, tx] = TYPE_COLOR[l.type] || ['#f3f4f6', '#6b7280']
                  return (
                    <tr key={i} onMouseEnter={e => e.currentTarget.style.background = '#fafafa'} onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
                      <Td c={<span style={{ fontSize: '12px', color: '#6b7280' }}>{l.time}</span>} />
                      <Td c={<span style={{ fontWeight: 600, color: '#111827' }}>{l.user}</span>} />
                      <Td c={l.action} />
                      <Td c={l.target} />
                      <Td c={<span style={{ fontFamily: 'monospace', fontSize: '12px' }}>{l.ip}</span>} />
                      <Td c={l.module} />
                      <Td c={<span style={{ fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '20px', background: bg, color: tx }}>{l.type}</span>} />
                    </tr>
                  )
                })
            }
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
