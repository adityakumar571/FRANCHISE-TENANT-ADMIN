/* eslint-disable prettier/prettier */
import { useState, useEffect, useCallback } from 'react'
import { Search, ChevronLeft, ChevronRight, RefreshCw, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { getRequest, deleteRequest } from '../../../Helpers'

const TYPE_COLOR = {
  Create: ['#e8f8f0', '#16a34a'],
  Login:  ['#e8f1ff', '#1a73e8'],
  Logout: ['#f0ecff', '#7c3aed'],
  Update: ['#fffbeb', '#d97706'],
  Delete: ['#fff1f1', '#dc2626'],
  System: ['#f0ecff', '#7c3aed'],
  Other:  ['#f3f4f6', '#6b7280'],
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

const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: true,
      })
    : '—'

export default function ActivityLogs() {
  const [logs, setLogs]       = useState([])
  const [total, setTotal]     = useState(0)
  const [loading, setLoading] = useState(false)

  // filters
  const [search, setSearch] = useState('')
  const [from, setFrom]     = useState('')
  const [to, setTo]         = useState('')
  const [type, setType]     = useState('All')
  const [page, setPage]     = useState(1)
  const PER = 20

  const fetchLogs = useCallback(() => {
    setLoading(true)
    const params = new URLSearchParams({ page, limit: PER })
    if (search)         params.set('search', search)
    if (type !== 'All') params.set('type', type)
    if (from)           params.set('from', from)
    if (to)             params.set('to', to)

    getRequest(`activity-logs?${params.toString()}`)
      .then((res) => {
        const d = res?.data?.data
        setLogs(d?.data  || [])
        setTotal(d?.total || 0)
      })
      .catch(() => toast.error('Failed to load activity logs'))
      .finally(() => setLoading(false))
  }, [page, search, type, from, to])

  useEffect(() => { fetchLogs() }, [fetchLogs])

  // reset page when filters change
  const applyFilter = (fn) => { fn(); setPage(1) }

  const handleDelete = (id) => {
    if (!window.confirm('Delete this log entry?')) return
    deleteRequest(`activity-logs/${id}`)
      .then(() => { toast.success('Log deleted'); fetchLogs() })
      .catch(() => toast.error('Failed to delete log'))
  }

  const totalPages = Math.max(1, Math.ceil(total / PER))

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '16px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: 700, color: '#111827', margin: 0 }}>Activity Logs</h1>
          <p style={{ fontSize: '12px', color: '#9ca3af', margin: '2px 0 0' }}>Home / Activity Logs</p>
        </div>
        <button
          onClick={fetchLogs}
          disabled={loading}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#fff', color: '#374151', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '8px 14px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', opacity: loading ? 0.6 : 1 }}>
          <RefreshCw size={13} />
          {loading ? 'Loading…' : 'Refresh'}
        </button>
      </div>

      {/* Filters */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '14px 18px', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
          <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <input
            value={search}
            onChange={e => applyFilter(() => setSearch(e.target.value))}
            placeholder="Search user, action, target…"
            style={{ width: '100%', padding: '8px 10px 8px 30px', border: '1px solid #e5e7eb', borderRadius: '7px', fontSize: '13px', outline: 'none', background: '#f9fafb' }}
          />
        </div>

        {/* Date range */}
        <input
          type="date"
          value={from}
          onChange={e => applyFilter(() => setFrom(e.target.value))}
          style={{ padding: '8px 10px', border: '1px solid #e5e7eb', borderRadius: '7px', fontSize: '13px', background: '#f9fafb', color: '#374151' }}
        />
        <input
          type="date"
          value={to}
          onChange={e => applyFilter(() => setTo(e.target.value))}
          style={{ padding: '8px 10px', border: '1px solid #e5e7eb', borderRadius: '7px', fontSize: '13px', background: '#f9fafb', color: '#374151' }}
        />

        {/* Type filter */}
        <select
          value={type}
          onChange={e => applyFilter(() => setType(e.target.value))}
          style={{ padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: '7px', fontSize: '13px', background: '#f9fafb', color: '#374151', cursor: 'pointer' }}>
          {['All', 'Create', 'Update', 'Delete', 'Login', 'Logout', 'System', 'Other'].map(t => (
            <option key={t}>{t}</option>
          ))}
        </select>

        {/* Clear */}
        {(search || from || to || type !== 'All') && (
          <button
            onClick={() => { setSearch(''); setFrom(''); setTo(''); setType('All'); setPage(1) }}
            style={{ padding: '8px 12px', background: '#fff1f1', color: '#dc2626', border: 'none', borderRadius: '7px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
            Clear Filters
          </button>
        )}
      </div>

      {/* Table */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['Date & Time', 'User', 'Action', 'Target', 'IP Address', 'Module', 'Type', ''].map(h => (
                <Th key={h} c={h} />
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} style={{ padding: '60px', textAlign: 'center', color: '#9ca3af', fontSize: '13px' }}>
                  Loading logs…
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ padding: '60px', textAlign: 'center', color: '#9ca3af', fontSize: '13px' }}>
                  No activity logs found
                </td>
              </tr>
            ) : (
              logs.map((l) => {
                const [bg, tx] = TYPE_COLOR[l.type] || TYPE_COLOR.Other
                return (
                  <tr
                    key={l._id}
                    onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                    onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
                    <Td c={<span style={{ fontSize: '12px', color: '#6b7280', whiteSpace: 'nowrap' }}>{fmtDate(l.createdAt)}</span>} />
                    <Td c={<span style={{ fontWeight: 600, color: '#111827' }}>{l.user}</span>} />
                    <Td c={l.action} />
                    <Td c={<span style={{ color: '#374151' }}>{l.target}</span>} />
                    <Td c={<span style={{ fontFamily: 'monospace', fontSize: '12px' }}>{l.ip}</span>} />
                    <Td c={<span style={{ fontSize: '11px', background: '#f3f4f6', color: '#6b7280', padding: '2px 7px', borderRadius: '20px' }}>{l.module}</span>} />
                    <Td c={
                      <span style={{ fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '20px', background: bg, color: tx }}>
                        {l.type}
                      </span>
                    } />
                    <Td c={
                      <button
                        onClick={() => handleDelete(l._id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', padding: '4px', borderRadius: '4px', display: 'flex', alignItems: 'center' }}
                        title="Delete log">
                        <Trash2 size={13} />
                      </button>
                    } />
                  </tr>
                )
              })
            )}
          </tbody>
        </table>

        {/* Pagination */}
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
            <span style={{ fontSize: '12px', color: '#374151', padding: '0 8px' }}>
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              style={{ background: 'none', border: '1px solid #e5e7eb', borderRadius: '6px', padding: '4px 8px', cursor: page === totalPages ? 'not-allowed' : 'pointer', opacity: page === totalPages ? 0.4 : 1 }}>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
