/* eslint-disable prettier/prettier */
import { useState, useEffect, useCallback } from 'react'
import { Search, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'
import { getRequest } from '../../../Helpers'

/* ─── helpers ────────────────────────────────────────── */
const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : '—'

const fmtCur = (n) => `₹ ${(n || 0).toLocaleString('en-IN')}`

const Badge = ({ s }) => {
  const m = {
    Paid:         ['#e8f8f0', '#16a34a', '#bbf0d0'],
    PAID:         ['#e8f8f0', '#16a34a', '#bbf0d0'],
    FULLY_PAID:   ['#e8f8f0', '#16a34a', '#bbf0d0'],
    Pending:      ['#fffbeb', '#d97706', '#fde68a'],
    PENDING:      ['#fffbeb', '#d97706', '#fde68a'],
    ACTIVE:       ['#e8f1ff', '#1a73e8', '#c5d8ff'],
    OVERDUE:      ['#fff1f1', '#dc2626', '#ffc5c5'],
    Failed:       ['#fff1f1', '#dc2626', '#ffc5c5'],
    UNPAID:       ['#fff1f1', '#dc2626', '#ffc5c5'],
  }
  const [bg, tx, bd] = m[s] || ['#f3f4f6', '#6b7280', '#e5e7eb']
  return (
    <span style={{ fontSize: '11px', fontWeight: 600, padding: '3px 10px', borderRadius: '20px', background: bg, color: tx, border: `1px solid ${bd}` }}>
      {s}
    </span>
  )
}

const Th = ({ c }) => (
  <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: '11px', color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', background: '#f9fafb', borderBottom: '1px solid #e5e7eb', whiteSpace: 'nowrap' }}>
    {c}
  </th>
)
const Td = ({ c, s = {} }) => (
  <td style={{ padding: '10px 12px', fontSize: '13px', color: '#374151', borderBottom: '1px solid #f3f4f6', ...s }}>
    {c}
  </td>
)

const statusOptions = ['All', 'PAID', 'PENDING', 'OVERDUE', 'UNPAID']

/* ════════════════════════════════════════════════════════ */
export default function Payments() {
  const [search, setSearch]   = useState('')
  const [statusF, setStatusF] = useState('All')
  const [page, setPage]       = useState(1)
  const PER = 12

  const [bills, setBills]     = useState([])
  const [total, setTotal]     = useState(0)
  const [pages, setPages]     = useState(1)
  const [loading, setLoading] = useState(false)

  /* ─── fetch monthly bills ─── */
  const fetchBills = useCallback(() => {
    setLoading(true)
    const params = new URLSearchParams({ page, limit: PER, isPagination: 'true' })
    if (search)          params.set('search', search)
    if (statusF !== 'All') params.set('status', statusF)

    getRequest(`monthly-billing?${params}`)
      .then((res) => {
        const d = res?.data?.data
        setBills(d?.bills   || [])
        setTotal(d?.total   || 0)
        setPages(d?.totalPages || 1)
      })
      .catch(() => toast.error('Failed to load monthly bills'))
      .finally(() => setLoading(false))
  }, [page, search, statusF])

  useEffect(() => {
    fetchBills()
  }, [fetchBills])

  /* reset page on filter change */
  const applyFilter = (fn) => { fn(); setPage(1) }

  /* ─── summary stats ─── */
  const paidCount    = bills.filter(b => ['PAID','FULLY_PAID'].includes(b.status || b.paidStatus)).length
  const overdueCount = bills.filter(b => ['OVERDUE','UNPAID'].includes(b.status || b.paidStatus)).length
  const totalRevenue = bills.reduce((sum, b) => sum + (b.paidAmount || 0), 0)

  return (
    <div style={{ padding: '24px', maxWidth: '1600px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '18px' }}>
      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 700, color: '#111827', margin: '0 0 4px' }}>Monthly Billing</h1>
          <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>Manage and track monthly franchise billing</p>
        </div>
        <button
          onClick={fetchBills}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px', border: '1px solid #e5e7eb', borderRadius: '7px', background: '#fff', color: '#374151', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* ── Summary cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '14px' }}>
        {[
          { label: 'Total Bills',     val: total,                color: '#1a73e8', bg: '#e8f1ff', bd: '#c5d8ff' },
          { label: 'Paid',            val: paidCount,            color: '#16a34a', bg: '#e8f8f0', bd: '#bbf0d0' },
          { label: 'Overdue',         val: overdueCount,         color: '#dc2626', bg: '#fff1f1', bd: '#ffc5c5' },
          { label: 'Total Collected', val: fmtCur(totalRevenue), color: '#7c3aed', bg: '#f0ecff', bd: '#d4c8ff' },
        ].map(s => (
          <div key={s.label} style={{ background: '#fff', border: `1px solid ${s.bd}`, borderRadius: '10px', padding: '14px 18px' }}>
            <p style={{ fontSize: '11px', fontWeight: 600, color: '#6b7280', margin: '0 0 6px', textTransform: 'uppercase' }}>{s.label}</p>
            <p style={{ fontSize: '22px', fontWeight: 700, color: s.color, margin: 0 }}>{loading ? '…' : s.val}</p>
          </div>
        ))}
      </div>

      {/* ── Filters ── */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '14px 18px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
          <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <input
            value={search}
            onChange={e => applyFilter(() => setSearch(e.target.value))}
            placeholder="Search franchise name…"
            style={{ width: '100%', padding: '8px 10px 8px 30px', border: '1px solid #e5e7eb', borderRadius: '7px', fontSize: '13px', outline: 'none', background: '#f9fafb' }}
          />
        </div>
        <select
          value={statusF}
          onChange={e => applyFilter(() => setStatusF(e.target.value))}
          style={{ padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: '7px', fontSize: '13px', background: '#f9fafb', color: '#374151', cursor: 'pointer' }}>
          {statusOptions.map(o => <option key={o}>{o}</option>)}
        </select>
      </div>

      {/* ══════════════ Monthly Billing Table ══════════════ */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['Invoice No.', 'Franchise Name', 'Billing Month', 'Amount', 'Paid Amount', 'Status', 'Generated On'].map(h => <Th key={h} c={h} />)}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ padding: '60px', textAlign: 'center', color: '#9ca3af' }}>Loading…</td></tr>
            ) : bills.length === 0 ? (
              <tr><td colSpan={7} style={{ padding: '60px', textAlign: 'center', color: '#9ca3af' }}>No monthly bills found</td></tr>
            ) : (
              bills.map((b, i) => (
                <tr key={b._id || i} onMouseEnter={e => e.currentTarget.style.background = '#fafafa'} onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
                  <Td c={<span style={{ fontSize: '12px', background: '#e8f1ff', color: '#1a73e8', padding: '3px 9px', borderRadius: '20px', fontWeight: 600 }}>{b.invoiceNo || '—'}</span>} />
                  <Td c={<span style={{ fontWeight: 600, color: '#111827' }}>{b.tenantDetails?.schoolName || '—'}</span>} />
                  <Td c={<span style={{ fontSize: '12px', background: '#f0ecff', color: '#7c3aed', padding: '2px 8px', borderRadius: '20px', fontWeight: 600 }}>{b.billingMonth || '—'}</span>} />
                  <Td c={<span style={{ fontWeight: 600 }}>{fmtCur(b.totalAmount)}</span>} />
                  <Td c={<span style={{ fontWeight: 600, color: '#16a34a' }}>{fmtCur(b.paidAmount)}</span>} />
                  <Td c={<Badge s={b.status} />} />
                  <Td c={<span style={{ fontSize: '12px', color: '#6b7280' }}>{fmtDate(b.createdAt)}</span>} />
                </tr>
              ))
            )}
          </tbody>
        </table>
        <PaginationBar page={page} pages={pages} total={total} PER={PER} setPage={setPage} />
      </div>
    </div>
  )
}

/* ─── Pagination ─── */
const PaginationBar = ({ page, pages, total, PER, setPage }) => (
  <div style={{ padding: '14px 18px', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fafafa' }}>
    <span style={{ fontSize: '12px', color: '#6b7280' }}>
      Showing {(page - 1) * PER + 1}–{Math.min(page * PER, total)} of {total} bills
    </span>
    <div style={{ display: 'flex', gap: '6px' }}>
      <button
        disabled={page <= 1}
        onClick={() => setPage(p => Math.max(1, p - 1))}
        style={{ padding: '6px 10px', border: '1px solid #e5e7eb', borderRadius: '6px', background: page <= 1 ? '#f9fafb' : '#fff', cursor: page <= 1 ? 'not-allowed' : 'pointer', fontSize: '12px', fontWeight: 600, color: page <= 1 ? '#d1d5db' : '#374151' }}>
        <ChevronLeft size={14} />
      </button>
      <span style={{ padding: '6px 12px', fontSize: '12px', fontWeight: 600, color: '#6b7280' }}>
        {page} / {pages}
      </span>
      <button
        disabled={page >= pages}
        onClick={() => setPage(p => Math.min(pages, p + 1))}
        style={{ padding: '6px 10px', border: '1px solid #e5e7eb', borderRadius: '6px', background: page >= pages ? '#f9fafb' : '#fff', cursor: page >= pages ? 'not-allowed' : 'pointer', fontSize: '12px', fontWeight: 600, color: page >= pages ? '#d1d5db' : '#374151' }}>
        <ChevronRight size={14} />
      </button>
    </div>
  </div>
)
