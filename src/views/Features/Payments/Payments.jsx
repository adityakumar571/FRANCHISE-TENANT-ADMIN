/* eslint-disable prettier/prettier */
import { useState } from 'react'
import { Search, Download, ChevronLeft, ChevronRight } from 'lucide-react'

const INVOICES = [
  { no: 'INV-2025-346', franchise: 'Sharma Medical Store', plan: 'Professional', amount: '₹ 2,999', method: 'Online', status: 'Paid',    date: '20 May 2025', paidDate: '20 May 2025' },
  { no: 'INV-2025-345', franchise: 'Verma Pharmacy',        plan: 'Basic',        amount: '₹ 999',   method: 'Online', status: 'Paid',    date: '20 May 2025', paidDate: '20 May 2025' },
  { no: 'INV-2025-344', franchise: 'Patel Drug House',      plan: 'Enterprise',   amount: '₹ 5,999', method: 'Offline',status: 'Pending', date: '18 May 2025', paidDate: '—' },
  { no: 'INV-2025-343', franchise: 'Gupta Medicals',        plan: 'Professional', amount: '₹ 2,999', method: 'Online', status: 'Paid',    date: '16 May 2025', paidDate: '18 May 2025' },
  { no: 'INV-2025-342', franchise: 'Khan Pharmacy',         plan: 'Basic',        amount: '₹ 999',   method: 'Online', status: 'Paid',    date: '16 May 2025', paidDate: '16 May 2025' },
  { no: 'INV-2025-341', franchise: 'Life Line Pharmacy',    plan: 'Basic',        amount: '₹ 999',   method: 'Offline',status: 'Pending', date: '14 May 2025', paidDate: '—' },
  { no: 'INV-2025-340', franchise: 'City Medical Centre',   plan: 'Enterprise',   amount: '₹ 5,999', method: 'Online', status: 'Paid',    date: '12 May 2025', paidDate: '12 May 2025' },
]

const TABS = ['Invoices', 'Payments']

const Badge = ({ s }) => {
  const m = { Paid: ['#e8f8f0', '#16a34a', '#bbf0d0'], Pending: ['#fffbeb', '#d97706', '#fde68a'], Failed: ['#fff1f1', '#dc2626', '#ffc5c5'] }
  const [bg, tx, bd] = m[s] || ['#f3f4f6', '#6b7280', '#e5e7eb']
  return <span style={{ fontSize: '11px', fontWeight: 600, padding: '3px 10px', borderRadius: '20px', background: bg, color: tx, border: `1px solid ${bd}` }}>{s}</span>
}
const Th = ({ c }) => <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: '11px', color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', background: '#f9fafb', borderBottom: '1px solid #e5e7eb', whiteSpace: 'nowrap' }}>{c}</th>
const Td = ({ c, s = {} }) => <td style={{ padding: '10px 12px', fontSize: '13px', color: '#374151', borderBottom: '1px solid #f3f4f6', ...s }}>{c}</td>

export default function Payments() {
  const [tab, setTab] = useState('Invoices')
  const [search, setSearch] = useState('')
  const [statusF, setStatusF] = useState('All')
  const [page, setPage] = useState(1)
  const PER = 10

  const filtered = INVOICES.filter(i =>
    (search === '' || i.franchise.toLowerCase().includes(search.toLowerCase()) || i.no.toLowerCase().includes(search.toLowerCase())) &&
    (statusF === 'All' || i.status === statusF)
  )
  const rows = filtered.slice((page - 1) * PER, page * PER)

  const totalCollected = INVOICES.filter(i => i.status === 'Paid').length
  const totalPending   = INVOICES.filter(i => i.status === 'Pending').length

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: 700, color: '#111827', margin: 0 }}>Payments &amp; Invoices</h1>
          <p style={{ fontSize: '12px', color: '#9ca3af', margin: '2px 0 0' }}>Home / Payments &amp; Invoices</p>
        </div>
        <button style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '8px', padding: '9px 16px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
          <Download size={14} /> Export
        </button>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '14px' }}>
        {[
          { label: 'Total Invoices',  val: INVOICES.length,   color: '#1a73e8', bg: '#e8f1ff', bd: '#c5d8ff' },
          { label: 'Paid',            val: totalCollected,     color: '#16a34a', bg: '#e8f8f0', bd: '#bbf0d0' },
          { label: 'Pending',         val: totalPending,       color: '#d97706', bg: '#fffbeb', bd: '#fde68a' },
          { label: 'Total Revenue',   val: '₹ 24,58,750',     color: '#7c3aed', bg: '#f0ecff', bd: '#d4c8ff' },
        ].map(s => (
          <div key={s.label} style={{ background: '#fff', border: `1px solid ${s.bd}`, borderRadius: '10px', padding: '14px 18px' }}>
            <p style={{ fontSize: '11px', fontWeight: 600, color: '#6b7280', margin: '0 0 6px', textTransform: 'uppercase' }}>{s.label}</p>
            <p style={{ fontSize: '22px', fontWeight: 700, color: s.color, margin: 0 }}>{s.val}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px', overflow: 'hidden', width: 'fit-content' }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{ padding: '10px 24px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 600, background: tab === t ? '#1a73e8' : '#fff', color: tab === t ? '#fff' : '#6b7280' }}>
            {t}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '14px 18px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
          <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} placeholder="Search invoices..."
            style={{ width: '100%', padding: '8px 10px 8px 30px', border: '1px solid #e5e7eb', borderRadius: '7px', fontSize: '13px', outline: 'none', background: '#f9fafb' }} />
        </div>
        <select value={statusF} onChange={e => { setStatusF(e.target.value); setPage(1) }}
          style={{ padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: '7px', fontSize: '13px', background: '#f9fafb', color: '#374151', cursor: 'pointer' }}>
          {['All', 'Paid', 'Pending', 'Failed'].map(o => <option key={o}>{o}</option>)}
        </select>
      </div>

      {/* Table */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr>{['Invoice No.', 'Franchise Name', 'Plan', 'Amount (₹)', 'Method', 'Invoice Date', 'Status', 'Paid Date', 'Action'].map(h => <Th key={h} c={h} />)}</tr></thead>
          <tbody>
            {rows.length === 0
              ? <tr><td colSpan={9} style={{ padding: '40px', textAlign: 'center', color: '#9ca3af', fontSize: '13px' }}>No invoices found</td></tr>
              : rows.map((inv, i) => (
                <tr key={i} onMouseEnter={e => e.currentTarget.style.background = '#fafafa'} onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
                  <Td c={<span style={{ fontFamily: 'monospace', fontSize: '12px', color: '#1a73e8', fontWeight: 600 }}>{inv.no}</span>} />
                  <Td c={<span style={{ fontWeight: 600, color: '#111827' }}>{inv.franchise}</span>} />
                  <Td c={inv.plan} />
                  <Td c={<span style={{ fontWeight: 600 }}>{inv.amount}</span>} />
                  <Td c={<span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '20px', background: inv.method === 'Online' ? '#e8f1ff' : '#f0ecff', color: inv.method === 'Online' ? '#1a73e8' : '#7c3aed' }}>{inv.method}</span>} />
                  <Td c={<span style={{ fontSize: '12px', color: '#6b7280' }}>{inv.date}</span>} />
                  <Td c={<Badge s={inv.status} />} />
                  <Td c={<span style={{ fontSize: '12px', color: '#6b7280' }}>{inv.paidDate}</span>} />
                  <Td c={
                    <button style={{ background: '#e8f1ff', border: 'none', borderRadius: '6px', padding: '5px 10px', cursor: 'pointer', fontSize: '11px', color: '#1a73e8', fontWeight: 600 }}>
                      View
                    </button>
                  } />
                </tr>
              ))
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
