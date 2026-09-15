/* eslint-disable prettier/prettier */
import { useState, useEffect, useCallback } from 'react'
import {
  CreditCard, TrendingUp, Users, Shield,
  ChevronRight, RefreshCw, Plus, Eye, AlertTriangle,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts'
import toast from 'react-hot-toast'
import { getRequest } from '../../../Helpers'

/* ─── helpers ────────────────────────────────── */
const card = (extra = {}) => ({
  background: '#fff',
  border: '1px solid #e5e7eb',
  borderRadius: '12px',
  padding: '18px 20px',
  ...extra,
})

const Badge = ({ s }) => {
  const map = {
    Completed: ['#e8f8f0', '#16a34a'],
    ACTIVE:    ['#e8f8f0', '#16a34a'],
    Active:    ['#e8f8f0', '#16a34a'],
    Paid:      ['#e8f8f0', '#16a34a'],
    PAID:      ['#e8f8f0', '#16a34a'],
    Pending:   ['#fffbeb', '#d97706'],
    PENDING:   ['#fffbeb', '#d97706'],
    OVERDUE:   ['#fff1f1', '#dc2626'],
    Failed:    ['#fff1f1', '#dc2626'],
    EXPIRED:   ['#f3f4f6', '#6b7280'],
    CANCELLED: ['#f3f4f6', '#6b7280'],
  }
  const [bg, tx] = map[s] || ['#f3f4f6', '#6b7280']
  return <span style={{ fontSize: '10px', fontWeight: 600, padding: '2px 8px', borderRadius: '20px', background: bg, color: tx }}>{s}</span>
}

const Th = ({ c }) => <th style={{ padding: '8px 10px', textAlign: 'left', fontSize: '10px', color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase', background: '#f9fafb', borderBottom: '1px solid #e5e7eb', whiteSpace: 'nowrap' }}>{c}</th>
const Td = ({ c, s = {} }) => <td style={{ padding: '8px 10px', fontSize: '12px', color: '#374151', borderBottom: '1px solid #f9fafb', ...s }}>{c}</td>

const SHead = ({ n, sub }) => (
  <div style={{ marginBottom: '14px' }}>
    <p style={{ fontSize: '14px', fontWeight: 700, color: '#111827', margin: 0 }}>{n}</p>
    {sub && <p style={{ fontSize: '11px', color: '#9ca3af', margin: '2px 0 0' }}>{sub}</p>}
  </div>
)

const fmt = (n) => (n || 0).toLocaleString('en-IN')
const fmtCur = (n) => `₹${fmt(n)}`
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

const PIE_COLORS = ['#1a73e8', '#16a34a', '#f59e0b', '#7c3aed', '#0891b2', '#dc2626']

/* ═══════════════════════════════════════════════ */
export default function SaasManagement() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('subscription')

  // ── data states ──
  const [dashboard, setDashboard]         = useState(null)
  const [subscriptions, setSubscriptions] = useState([])
  const [sessionReport, setSessionReport] = useState(null)
  const [loading, setLoading]             = useState(false)

  const fetchAll = useCallback(() => {
    setLoading(true)

    Promise.allSettled([
      getRequest('saas/dashboard'),
      getRequest('subscription?limit=200'),
      getRequest('session-billing/report'),
    ]).then(([dashRes, subRes, sessionRes]) => {
      if (dashRes.status === 'fulfilled') {
        setDashboard(dashRes.value?.data?.data || null)
      } else {
        toast.error('Dashboard data load failed')
      }

      if (subRes.status === 'fulfilled') {
        const raw = subRes.value?.data?.data
        setSubscriptions(Array.isArray(raw?.data) ? raw.data : Array.isArray(raw) ? raw : [])
      }

      if (sessionRes.status === 'fulfilled') {
        setSessionReport(sessionRes.value?.data?.data || null)
      }
    }).finally(() => setLoading(false))
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  // ── derived KPIs from real data ──
  const activeSubs   = subscriptions.filter(s => s.status === 'ACTIVE').length
  const expiringSoon = dashboard?.alerts?.expiringSoonCount || 0
  const totalRevenue = dashboard?.subscriptions?.totalRevenue || 0
  const totalFranchises = dashboard?.franchises?.total || 0

  const KPI = [
    { title: 'Active Subscriptions', val: fmt(activeSubs),          trend: `${fmt(dashboard?.subscriptions?.trial || 0)} on trial`, up: true,  color: '#1a73e8', bg: '#e8f1ff', bd: '#c5d8ff' },
    { title: 'Expiring Soon',        val: fmt(expiringSoon),         trend: 'Within 30 days',               up: false, color: '#d97706', bg: '#fffbeb', bd: '#fde68a' },
    { title: 'Total Revenue (MTD)',  val: fmtCur(totalRevenue),      trend: `${fmt(dashboard?.subscriptions?.total || 0)} total plans`, up: true, color: '#16a34a', bg: '#e8f8f0', bd: '#bbf0d0' },
    { title: 'Total Franchises',     val: fmt(totalFranchises),      trend: `+${fmt(dashboard?.franchises?.thisMonth || 0)} this month`, up: true, color: '#7c3aed', bg: '#f0ecff', bd: '#d4c8ff' },
    { title: 'Active Franchises',    val: fmt(dashboard?.franchises?.active || 0), trend: `${fmt(dashboard?.franchises?.inactive || 0)} inactive`, up: true, color: '#0891b2', bg: '#e0f7fa', bd: '#b2ebf2' },
  ]

  // ── pie chart: plan distribution ──
  const planDist = (dashboard?.planDistribution || []).map((p, i) => ({
    name:  p._id || 'Unknown',
    count: p.count,
    color: PIE_COLORS[i % PIE_COLORS.length],
  }))
  const totalPlanSubs = planDist.reduce((a, b) => a + b.count, 0)

  // ── revenue bar chart from session report ──
  const revenueChart = sessionReport?.monthlyBreakdown
    ? sessionReport.monthlyBreakdown.slice(-6).map(m => ({
        m: new Date(m.month + '-01').toLocaleString('en-IN', { month: 'short' }),
        v: m.collected || 0,
      }))
    : []

  // ── upcoming renewals from expiring list ──
  const renewals = (dashboard?.alerts?.expiringSoon || []).slice(0, 8)

  // ── recent subscriptions as "payments" ──
  const recentSubs = subscriptions.slice(0, 10)

  const TABS = [
    { id: 'subscription', label: 'Subscription Overview' },
    { id: 'renewals',     label: 'Renewal Alerts' },
    { id: 'payments',     label: 'Recent Subscriptions' },
    { id: 'license',      label: 'System License' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '16px' }}>

      {/* ── Page header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#111827', margin: 0 }}>SaaS Management</h1>
          <p style={{ fontSize: '12px', color: '#9ca3af', margin: '2px 0 0' }}>Manage subscriptions, plans, renewals and licenses</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={fetchAll}
            disabled={loading}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#fff', color: '#374151', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '8px 14px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', opacity: loading ? 0.6 : 1 }}>
            <RefreshCw size={13} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            {loading ? 'Loading...' : 'Refresh'}
          </button>
          <button
            onClick={() => navigate('/subscription-plans')}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#1a73e8', color: '#fff', border: 'none', borderRadius: '8px', padding: '8px 14px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
            <Plus size={13} /> Add Plan
          </button>
        </div>
      </div>

      {/* ── KPI row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: '12px' }}>
        {KPI.map(k => (
          <div key={k.title} style={{ ...card(), display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: k.bg, border: `1px solid ${k.bd}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <CreditCard size={18} style={{ color: k.color }} />
            </div>
            <div>
              <p style={{ fontSize: '10px', fontWeight: 600, color: '#9ca3af', margin: 0, textTransform: 'uppercase', lineHeight: 1.3 }}>{k.title}</p>
              <p style={{ fontSize: '18px', fontWeight: 700, color: '#111827', margin: '2px 0' }}>{loading ? '...' : k.val}</p>
              <p style={{ fontSize: '10px', fontWeight: 600, color: k.up ? '#16a34a' : '#d97706', margin: 0 }}>{k.up ? '↑' : '⚠'} {k.trend}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Tabs ── */}
      <div style={{ display: 'flex', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px', overflow: 'hidden', width: 'fit-content' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            style={{ padding: '10px 20px', border: 'none', borderRight: '1px solid #e5e7eb', cursor: 'pointer', fontSize: '12px', fontWeight: 600, background: activeTab === t.id ? '#1a73e8' : '#fff', color: activeTab === t.id ? '#fff' : '#6b7280', transition: 'all .15s' }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ════ Tab: Subscription Overview ════ */}
      {activeTab === 'subscription' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '16px', alignItems: 'start' }}>

          {/* Revenue bar chart */}
          <div style={card()}>
            <SHead n="Monthly Revenue" sub="Last 6 months collected revenue from session billing" />
            {revenueChart.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={revenueChart} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="m" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v / 1000).toFixed(0)}K`} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '11px' }} formatter={v => [fmtCur(v), 'Revenue']} />
                  <Bar dataKey="v" fill="#1a73e8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: '13px' }}>
                {loading ? 'Loading chart...' : 'No billing data available yet'}
              </div>
            )}
          </div>

          {/* Plan distribution pie */}
          <div style={card()}>
            <SHead n="Plan Distribution" />
            {planDist.length > 0 ? (
              <>
                <div style={{ position: 'relative' }}>
                  <ResponsiveContainer width="100%" height={160}>
                    <PieChart>
                      <Pie data={planDist} cx="50%" cy="50%" innerRadius={45} outerRadius={65} dataKey="count" paddingAngle={2} strokeWidth={0}>
                        {planDist.map((p, i) => <Cell key={i} fill={p.color} />)}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', fontSize: '11px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', textAlign: 'center', pointerEvents: 'none' }}>
                    <p style={{ fontSize: '20px', fontWeight: 700, color: '#111827', margin: 0 }}>{totalPlanSubs}</p>
                    <p style={{ fontSize: '10px', color: '#9ca3af', margin: 0 }}>Total</p>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '8px' }}>
                  {planDist.map(p => (
                    <div key={p.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: p.color, display: 'inline-block' }} />
                        <span style={{ fontSize: '11px', color: '#374151' }}>{p.name}</span>
                      </div>
                      <span style={{ fontSize: '11px', fontWeight: 600, color: '#111827' }}>
                        {p.count} <span style={{ color: '#9ca3af' }}>({totalPlanSubs > 0 ? ((p.count / totalPlanSubs) * 100).toFixed(1) : 0}%)</span>
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: '13px' }}>
                {loading ? 'Loading...' : 'No plan data'}
              </div>
            )}

            {/* Status breakdown */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '14px', paddingTop: '12px', borderTop: '1px solid #f3f4f6' }}>
              {[
                { l: 'Active',    v: subscriptions.filter(s => s.status === 'ACTIVE').length,    c: '#16a34a' },
                { l: 'Expired',   v: subscriptions.filter(s => s.status === 'EXPIRED').length,   c: '#dc2626' },
                { l: 'Cancelled', v: subscriptions.filter(s => s.status === 'CANCELLED').length, c: '#d97706' },
                { l: 'Trial',     v: subscriptions.filter(s => s.isTrial).length,                c: '#1a73e8' },
              ].map(x => (
                <div key={x.l} style={{ textAlign: 'center', padding: '6px', background: '#f9fafb', borderRadius: '6px' }}>
                  <p style={{ fontSize: '16px', fontWeight: 700, color: x.c, margin: 0 }}>{loading ? '…' : x.v}</p>
                  <p style={{ fontSize: '10px', color: '#9ca3af', margin: 0 }}>{x.l}</p>
                </div>
              ))}
            </div>
            <button onClick={() => navigate('/subscription-history')} style={{ marginTop: '12px', width: '100%', padding: '8px', background: 'none', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '12px', fontWeight: 600, color: '#1a73e8', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
              View All Subscriptions <ChevronRight size={13} />
            </button>
          </div>
        </div>
      )}

      {/* ════ Tab: Renewal Alerts ════ */}
      {activeTab === 'renewals' && (
        <div style={card()}>
          <SHead n="Renewal Alerts" sub="Subscriptions expiring within the next 30 days" />
          {renewals.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#9ca3af', fontSize: '13px' }}>
              {loading ? 'Loading...' : '✅ No subscriptions expiring soon'}
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr>{['Franchise Name', 'Plan', 'Expiry Date', 'Days Left', 'Action'].map(h => <Th key={h} c={h} />)}</tr></thead>
              <tbody>
                {renewals.map((r, i) => (
                  <tr key={i} onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'} onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
                    <Td c={<span style={{ fontWeight: 600, color: '#111827' }}>{r.franchiseName || '—'}</span>} />
                    <Td c={r.planName || '—'} />
                    <Td c={<span style={{ color: '#6b7280', fontSize: '11px' }}>{fmtDate(r.endDate)}</span>} />
                    <Td c={
                      <span style={{ fontSize: '11px', fontWeight: 700, color: (r.daysLeft || 0) <= 7 ? '#dc2626' : (r.daysLeft || 0) <= 15 ? '#d97706' : '#16a34a' }}>
                        {r.daysLeft ?? '—'} days
                      </span>
                    } />
                    <Td c={
                      <button
                        onClick={() => navigate('/subscription-history')}
                        style={{ fontSize: '11px', background: '#e8f1ff', color: '#1a73e8', border: 'none', borderRadius: '6px', padding: '4px 10px', cursor: 'pointer', fontWeight: 600 }}>
                        View
                      </button>
                    } />
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {expiringSoon > renewals.length && (
            <p style={{ fontSize: '11px', color: '#9ca3af', margin: '12px 0 0', textAlign: 'center' }}>
              <AlertTriangle size={11} style={{ verticalAlign: 'middle', marginRight: 4 }} />
              {expiringSoon - renewals.length} more expiring soon — <button onClick={() => navigate('/subscription-history')} style={{ background: 'none', border: 'none', color: '#1a73e8', cursor: 'pointer', fontSize: '11px', fontWeight: 600, padding: 0 }}>View all →</button>
            </p>
          )}
        </div>
      )}

      {/* ════ Tab: Recent Subscriptions ════ */}
      {activeTab === 'payments' && (
        <div style={card()}>
          <SHead n="Recent Subscriptions" sub="Latest subscription records across all franchises" />
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr>{['Franchise', 'Plan', 'Start Date', 'End Date', 'Paid Status', 'Status', 'Action'].map(h => <Th key={h} c={h} />)}</tr></thead>
            <tbody>
              {recentSubs.length === 0 ? (
                <tr><td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: '#9ca3af', fontSize: '13px' }}>{loading ? 'Loading...' : 'No subscriptions found'}</td></tr>
              ) : recentSubs.map((s, i) => (
                <tr key={i} onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'} onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
                  <Td c={<span style={{ fontWeight: 600, color: '#111827' }}>{s.tenantId?.schoolName || s.tenantId || '—'}</span>} />
                  <Td c={s.currentPlan?.name || '—'} />
                  <Td c={<span style={{ fontSize: '11px', color: '#6b7280' }}>{fmtDate(s.currentPlan?.startDate)}</span>} />
                  <Td c={<span style={{ fontSize: '11px', color: '#6b7280' }}>{fmtDate(s.currentPlan?.endDate)}</span>} />
                  <Td c={<Badge s={s.paidStatus || '—'} />} />
                  <Td c={<Badge s={s.status} />} />
                  <Td c={
                    <button
                      onClick={() => navigate('/subscription-history')}
                      style={{ background: '#e8f1ff', border: 'none', borderRadius: '6px', padding: '4px 8px', cursor: 'pointer', color: '#1a73e8' }}>
                      <Eye size={13} />
                    </button>
                  } />
                </tr>
              ))}
            </tbody>
          </table>
          <button onClick={() => navigate('/subscription-history')} style={{ marginTop: '14px', fontSize: '12px', color: '#1a73e8', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
            View All Subscriptions <ChevronRight size={13} />
          </button>
        </div>
      )}

      {/* ════ Tab: System License ════ */}
      {activeTab === 'license' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', alignItems: 'start' }}>
          {/* License info — static (no license API exists, display system info) */}
          <div style={card()}>
            <SHead n="License" sub="System license information" />
            <div style={{ background: 'linear-gradient(135deg, #0f1f3d, #1a3a6b)', borderRadius: '10px', padding: '18px', color: '#fff', marginBottom: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div>
                  <p style={{ fontSize: '14px', fontWeight: 700, margin: 0 }}>FranchiseAll SaaS License</p>
                  <span style={{ fontSize: '10px', background: '#16a34a', padding: '2px 8px', borderRadius: '20px', fontWeight: 600 }}>Active</span>
                </div>
                <Shield size={24} color="#fabf22" />
              </div>
              {[
                { l: 'Product',       v: 'Franchise Management System' },
                { l: 'License Type',  v: 'Enterprise SaaS' },
                { l: 'Total Tenants', v: fmt(dashboard?.franchises?.total || 0) },
                { l: 'Active Tenants',v: fmt(dashboard?.franchises?.active || 0) },
                { l: 'Distributors',  v: fmt(dashboard?.distributors?.total || 0) },
              ].map(r => (
                <div key={r.l} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '11px', color: 'rgba(255,255,255,.6)' }}>{r.l}</span>
                  <span style={{ fontSize: '11px', fontWeight: 600 }}>{loading ? '…' : r.v}</span>
                </div>
              ))}
            </div>

            {/* Usage stats */}
            <p style={{ fontSize: '12px', fontWeight: 700, color: '#111827', margin: '0 0 12px' }}>Platform Usage</p>
            {[
              { l: 'Total Admins',    u: [dashboard?.admins?.active  || 0, dashboard?.admins?.total  || 1],  color: '#1a73e8' },
              { l: 'Active Tenants',  u: [dashboard?.franchises?.active || 0, dashboard?.franchises?.total || 1], color: '#16a34a' },
              { l: 'Active Subs',     u: [dashboard?.subscriptions?.active || 0, dashboard?.subscriptions?.total || 1], color: '#f59e0b' },
              { l: 'Distributors',    u: [dashboard?.distributors?.active || 0, dashboard?.distributors?.total || 1], color: '#7c3aed' },
            ].map(r => {
              const pct = r.u[1] > 0 ? Math.round((r.u[0] / r.u[1]) * 100) : 0
              return (
                <div key={r.l} style={{ marginBottom: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                    <span style={{ fontSize: '11px', color: '#374151', fontWeight: 500 }}>{r.l}</span>
                    <span style={{ fontSize: '11px', color: '#6b7280' }}>{r.u[0]} / {r.u[1]}</span>
                  </div>
                  <div style={{ height: '6px', background: '#f3f4f6', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: r.color, borderRadius: '3px', transition: 'width .3s' }} />
                  </div>
                </div>
              )
            })}
          </div>

          {/* State distribution */}
          <div style={card()}>
            <SHead n="State Distribution" sub="Franchises by state" />
            {(dashboard?.stateDistribution || []).length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#9ca3af', fontSize: '13px' }}>{loading ? 'Loading...' : 'No data'}</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {dashboard.stateDistribution.map((s, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: '#f9fafb', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: PIE_COLORS[i % PIE_COLORS.length] }} />
                      <span style={{ fontSize: '12px', color: '#374151', fontWeight: 500 }}>{s.state}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', fontSize: '11px' }}>
                      <span style={{ color: '#16a34a', fontWeight: 600 }}>{s.active} active</span>
                      <span style={{ color: '#6b7280' }}>/ {s.total} total</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div style={{ marginTop: '16px', padding: '14px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e5e7eb' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', color: '#6b7280' }}>Total Admins</span>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#111827' }}>{loading ? '…' : fmt(dashboard?.admins?.total || 0)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', color: '#6b7280' }}>Distributors</span>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#111827' }}>{loading ? '…' : fmt(dashboard?.distributors?.total || 0)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '12px', color: '#6b7280' }}>Wholesalers</span>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#16a34a' }}>{loading ? '…' : fmt(dashboard?.distributors?.wholesalers || 0)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
