/* eslint-disable prettier/prettier */
import { useState, useEffect, useCallback } from 'react'
import { Search, Download, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react'
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

const TABS = ['Monthly Billing', 'Session Billing']

/* ════════════════════════════════════════════════════════ */
export default function Payments() {
  const [tab, setTab]         = useState('Monthly Billing')
  const [search, setSearch]   = useState('')
  const [statusF, setStatusF] = useState('All')
  const [page, setPage]       = useState(1)
  const PER = 12

  /* ── monthly billing state ── */
  const [monthlyBills, setMonthlyBills]   = useState([])
  const [monthlyTotal, setMonthlyTotal]   = useState(0)
  const [monthlyPages, setMonthlyPages]   = useState(1)
  const [monthlyLoading, setMonthlyLoading] = useState(false)

  /* ── session billing state ── */
  const [sessionBills, setSessionBills]   = useState([])
  const [sessionTotal, setSessionTotal]   = useState(0)
  const [sessionPages, setSessionPages]   = useState(1)
  const [sessionLoading, setSessionLoading] = useState(false)

  /* ─── fetch monthly bills ─── */
  const fetchMonthly = useCallback(() => {
    setMonthlyLoading(true)
    const params = new URLSearchParams({ page, limit: PER, isPagination: 'true' })
    if (search)          params.set('search', search)
    if (statusF !== 'All') params.set('status', statusF)

    getRequest(`monthly-billing?${params}`)
      .then((res) => {
        const d = res?.data?.data
        setMonthlyBills(d?.bills   || [])
        setMonthlyTotal(d?.total   || 0)
        setMonthlyPages(d?.totalPages || 1)
      })
      .catch(() => toast.error('Failed to load monthly bills'))
      .finally(() => setMonthlyLoading(false))
  }, [page, search, statusF])

  /* ─── fetch session bills ─── */
  const fetchSession = useCallback(() => {
    setSessionLoading(true)
    const params = new URLSearchParams({ page, limit: PER, isPagination: 'true' })
    if (search)          params.set('search', search)
    if (statusF !== 'All') params.set('status', statusF)

    getRequest(`session-billing?${params}`)
      .then((res) => {
        const d = res?.data?.data
        setSessionBills(d?.bills   || [])
        setSessionTotal(d?.total   || 0)
        setSessionPages(d?.totalPages || 1)
      })
      .catch(() => toast.error('Failed to load session bills'))
      .finally(() => setSessionLoading(false))
  }, [page, search, statusF])

  useEffect(() => {
    if (tab === 'Monthly Billing') fetchMonthly()
    else                           fetchSession()
  }, [tab, fetchMonthly, fetchSession])

  /* reset page on filter/tab change */
  const applyFilter = (fn) => { fn(); setPage(1) }
  const switchTab   = (t)  => { setTab(t); setPage(1); setSearch(''); setStatusF('All') }

  /* ─── summary stats ─── */
  const bills   = tab === 'Monthly Billing' ? monthlyBills  : sessionBills
  const total   = tab === 'Monthly Billing' ? monthlyTotal  : sessionTotal
  const pages   = tab === 'Monthly Billing' ? monthlyPages  : sessionPages
  const loading = tab === 'Monthly Billing' ? monthlyLoading : sessionLoading

  const paidCount    = bills.filter(b => ['PAID','FULLY_PAID'].includes(b.status || b.paidStatus)).length
  const overdueCount = bills.filter(b => ['OVERDUE','UNPAID'].includes(b.status || b.paidStatus)).length
  const totalRevenue = bills.reduce((s, b) => s + (b.totalPaid || b.paidAmount || 0), 0)

  /* monthly-specific status options */
  const monthlyStatuses = ['All', 'PENDING', 'PAID', 'OVERDUE', 'CANCELLED']
  /* session-specific status options */
  const sessionStatuses = ['All', 'ACTIVE', 'FULLY_PAID', 'OVERDUE']

  const statusOptions = tab === 'Monthly Billing' ? monthlyStatuses : sessionStatuses

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '16px' }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: 700, color: '#111827', margin: 0 }}>Payments &amp; Invoices</h1>
          <p style={{ fontSize: '12px', color: '#9ca3af', margin: '2px 0 0' }}>Home / Payments &amp; Invoices</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => tab === 'Monthly Billing' ? fetchMonthly() : fetchSession()}
            disabled={loading}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#fff', color: '#374151', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '9px 14px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', opacity: loading ? 0.6 : 1 }}>
            <RefreshCw size={13} /> Refresh
          </button>
          <button style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '8px', padding: '9px 16px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
            <Download size={14} /> Export
          </button>
        </div>
      </div>

      {/* ── Summary cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '14px' }}>
        {[
          { label: 'Total Bills',    val: total,        color: '#1a73e8', bg: '#e8f1ff', bd: '#c5d8ff' },
          { label: 'Paid',           val: paidCount,    color: '#16a34a', bg: '#e8f8f0', bd: '#bbf0d0' },
          { label: 'Overdue',        val: overdueCount, color: '#dc2626', bg: '#fff1f1', bd: '#ffc5c5' },
          { label: 'Total Collected',val: fmtCur(totalRevenue), color: '#7c3aed', bg: '#f0ecff', bd: '#d4c8ff' },
        ].map(s => (
          <div key={s.label} style={{ background: '#fff', border: `1px solid ${s.bd}`, borderRadius: '10px', padding: '14px 18px' }}>
            <p style={{ fontSize: '11px', fontWeight: 600, color: '#6b7280', margin: '0 0 6px', textTransform: 'uppercase' }}>{s.label}</p>
            <p style={{ fontSize: '22px', fontWeight: 700, color: s.color, margin: 0 }}>{loading ? '…' : s.val}</p>
          </div>
        ))}
      </div>

      {/* ── Tabs ── */}
      <div style={{ display: 'flex', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px', overflow: 'hidden', width: 'fit-content' }}>
        {TABS.map(t => (
          <button key={t} onClick={() => switchTab(t)}
            style={{ padding: '10px 24px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 600, background: tab === t ? '#1a73e8' : '#fff', color: tab === t ? '#fff' : '#6b7280', transition: 'all .15s' }}>
            {t}
          </button>
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
      {tab === 'Monthly Billing' && (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Invoice No.', 'Franchise Name', 'Billing Month', 'Students', 'Amount', 'Paid Amount', 'Status', 'Generated On'].map(h => <Th key={h} c={h} />)}
              </tr>
            </thead>
            <tbody>
              {monthlyLoading ? (
                <tr><td colSpan={8} style={{ padding: '60px', textAlign: 'center', color: '#9ca3af' }}>Loading…</td></tr>
              ) : monthlyBills.length === 0 ? (
                <tr><td colSpan={8} style={{ padding: '60px', textAlign: 'center', color: '#9ca3af' }}>No monthly bills found</td></tr>
              ) : (
                monthlyBills.map((b, i) => (
                  <tr key={b._id || i} onMouseEnter={e => e.currentTarget.style.background = '#fafafa'} onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
                    <Td c={<span style={{ fontFamily: 'monospace', fontSize: '12px', color: '#1a73e8', fontWeight: 600 }}>{b.invoiceNumber || '—'}</span>} />
                    <Td c={<span style={{ fontWeight: 600, color: '#111827' }}>{b.tenantDetails?.schoolName || '—'}</span>} />
                    <Td c={<span style={{ fontSize: '12px', color: '#6b7280' }}>{b.billingMonth || '—'}</span>} />
                    <Td c={b.studentCount ?? '—'} />
                    <Td c={<span style={{ fontWeight: 600 }}>{fmtCur(b.totalAmount)}</span>} />
                    <Td c={<span style={{ fontWeight: 600, color: '#16a34a' }}>{fmtCur(b.paidAmount)}</span>} />
                    <Td c={<Badge s={b.status} />} />
                    <Td c={<span style={{ fontSize: '12px', color: '#6b7280' }}>{fmtDate(b.createdAt)}</span>} />
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <PaginationBar page={page} pages={monthlyPages} total={monthlyTotal} PER={PER} setPage={setPage} />
        </div>
      )}

      {/* ══════════════ Session Billing Table ══════════════ */}
      {tab === 'Session Billing' && (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Franchise Name', 'Session Year', 'Students', 'Monthly Amt', 'Total Amount', 'Total Paid', 'Total Due', 'Status'].map(h => <Th key={h} c={h} />)}
              </tr>
            </thead>
            <tbody>
              {sessionLoading ? (
                <tr><td colSpan={8} style={{ padding: '60px', textAlign: 'center', color: '#9ca3af' }}>Loading…</td></tr>
              ) : sessionBills.length === 0 ? (
                <tr><td colSpan={8} style={{ padding: '60px', textAlign: 'center', color: '#9ca3af' }}>No session bills found</td></tr>
              ) : (
                sessionBills.map((b, i) => (
                  <tr key={b._id || i} onMouseEnter={e => e.currentTarget.style.background = '#fafafa'} onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
                    <Td c={<span style={{ fontWeight: 600, color: '#111827' }}>{b.tenantDetails?.schoolName || '—'}</span>} />
                    <Td c={<span style={{ fontSize: '12px', background: '#e8f1ff', color: '#1a73e8', padding: '2px 8px', borderRadius: '20px', fontWeight: 600 }}>{b.sessionYear || '—'}</span>} />
                    <Td c={b.studentCount ?? '—'} />
                    <Td c={<span style={{ fontWeight: 600 }}>{fmtCur(b.monthlyAmount)}</span>} />
                    <Td c={<span style={{ fontWeight: 600 }}>{fmtCur(b.totalSessionAmount)}</span>} />
                    <Td c={<span style={{ fontWeight: 600, color: '#16a34a' }}>{fmtCur(b.totalPaid)}</span>} />
                    <Td c={<span style={{ fontWeight: 600, color: (b.totalDue || 0) > 0 ? '#dc2626' : '#16a34a' }}>{fmtCur(b.totalDue)}</span>} />
                    <Td c={<Badge s={b.status} />} />
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <PaginationBar page={page} pages={sessionPages} total={sessionTotal} PER={PER} setPage={setPage} />
        </div>
      )}
    </div>
  )
}

/* ─── Reusable pagination bar ─── */
function PaginationBar({ page, pages, total, PER, setPage }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 18px', borderTop: '1px solid #f3f4f6' }}>
      <span style={{ fontSize: '12px', color: '#6b7280' }}>
        {total === 0
          ? 'No entries'
          : `Showing ${(page - 1) * PER + 1}–${Math.min(page * PER, total)} of ${total} entries`}
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
  )
}
