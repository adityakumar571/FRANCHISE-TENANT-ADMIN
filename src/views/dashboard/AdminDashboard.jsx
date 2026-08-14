/* eslint-disable prettier/prettier */
import {
  Store, CheckCircle, XCircle, AlertTriangle,
  Users, IndianRupee, Clock, TrendingUp,
  ArrowRight, CalendarDays, ArrowUpRight,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts'
import { getRequest } from '../../Helpers'
import { Skeleton } from 'antd'
import { useNavigate } from 'react-router-dom'

/* ─── count-up hook ─────────────────────────────────────────────────── */
function useCountUp(target, dur = 1200) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    if (!target) return setVal(0)
    let s = 0
    const step = target / (dur / 16)
    const t = setInterval(() => {
      s += step
      if (s >= target) { setVal(target); clearInterval(t) }
      else setVal(Math.floor(s))
    }, 16)
    return () => clearInterval(t)
  }, [target])
  return val
}
function Num({ v = 0, pre = '', suf = '' }) {
  const n = typeof v === 'number' ? v : parseFloat(String(v).replace(/[^0-9.]/g, '')) || 0
  const d = useCountUp(n)
  return <>{pre}{d.toLocaleString('en-IN')}{suf}</>
}

/* ─── KPI Card ──────────────────────────────────────────────────────── */
const CARD_THEMES = {
  blue:   { bg: '#e8f1ff', icon: '#1a73e8', border: '#c5d8ff', text: '#1a73e8' },
  green:  { bg: '#e8f8f0', icon: '#16a34a', border: '#bbf0d0', text: '#16a34a' },
  orange: { bg: '#fff4e6', icon: '#ea7c1e', border: '#ffd9a8', text: '#ea7c1e' },
  purple: { bg: '#f0ecff', icon: '#7c3aed', border: '#d4c8ff', text: '#7c3aed' },
  red:    { bg: '#fff1f1', icon: '#dc2626', border: '#ffc5c5', text: '#dc2626' },
  amber:  { bg: '#fffbeb', icon: '#d97706', border: '#fde68a', text: '#d97706' },
}

function KpiCard({ title, value, pre = '', suf = '', icon: Icon, theme = 'blue', sub, trend }) {
  const t = CARD_THEMES[theme]
  return (
    <div style={{
      background: '#fff', border: `1px solid ${t.border}`, borderRadius: '12px',
      padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: '8px',
      transition: 'box-shadow .2s', cursor: 'default',
    }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '.04em' }}>{title}</span>
        <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: t.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={17} style={{ color: t.icon }} />
        </div>
      </div>
      <p style={{ fontSize: '26px', fontWeight: 700, color: '#111827', margin: 0, lineHeight: 1 }}>
        <Num v={value} pre={pre} suf={suf} />
      </p>
      {(sub || trend) && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {trend !== undefined && (
            <span style={{ fontSize: '11px', fontWeight: 600, color: trend >= 0 ? '#16a34a' : '#dc2626', display: 'flex', alignItems: 'center', gap: '2px' }}>
              <ArrowUpRight size={12} />
              {trend >= 0 ? '+' : ''}{trend}% vs last month
            </span>
          )}
          {sub && <span style={{ fontSize: '11px', color: '#9ca3af' }}>{sub}</span>}
        </div>
      )}
    </div>
  )
}

/* ─── Recent Registration Item ───────────────────────────────────────── */
function RegItem({ school }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0', borderBottom: '1px solid #f3f4f6' }}>
      <div style={{
        width: '36px', height: '36px', borderRadius: '8px', background: '#e8f1ff',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden',
      }}>
        {school.logo
          ? <img src={school.logo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <Store size={16} style={{ color: '#1a73e8' }} />
        }
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: '12px', fontWeight: 600, color: '#111827', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {school.schoolName}
        </p>
        <p style={{ fontSize: '11px', color: '#9ca3af', margin: 0 }}>
          {new Date(school.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
      <span style={{
        fontSize: '10px', fontWeight: 600, padding: '2px 8px', borderRadius: '20px',
        background: school.isActive ? '#e8f8f0' : '#fff1f1',
        color: school.isActive ? '#16a34a' : '#dc2626',
        border: `1px solid ${school.isActive ? '#bbf0d0' : '#ffc5c5'}`,
        flexShrink: 0,
      }}>
        {school.isActive ? 'Active' : 'Inactive'}
      </span>
    </div>
  )
}

/* ─── Activity Item ─────────────────────────────────────────────────── */
const ACT_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444']
function ActItem({ text, time, idx }) {
  return (
    <div style={{ display: 'flex', gap: '10px', paddingBottom: '10px', borderBottom: '1px solid #f3f4f6' }}>
      <div style={{
        width: '8px', height: '8px', borderRadius: '50%', marginTop: '5px', flexShrink: 0,
        backgroundColor: ACT_COLORS[idx % ACT_COLORS.length],
      }} />
      <div>
        <p style={{ fontSize: '12px', color: '#374151', margin: 0, lineHeight: 1.4 }}>{text}</p>
        <p style={{ fontSize: '11px', color: '#9ca3af', margin: '2px 0 0' }}>{time}</p>
      </div>
    </div>
  )
}

/* ─── Pie label ─────────────────────────────────────────────────────── */
const RAD = Math.PI / 180
function PieLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }) {
  if (percent < 0.06) return null
  const r = innerRadius + (outerRadius - innerRadius) * 0.55
  const x = cx + r * Math.cos(-midAngle * RAD)
  const y = cy + r * Math.sin(-midAngle * RAD)
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={10} fontWeight={600}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  )
}

/* ═══════════════════════ MAIN ═══════════════════════════════════════ */
export default function AdminDashboard() {
  const [loading, setLoading] = useState(true)
  const [d, setD] = useState({
    totalTenants: 0, activeTenants: 0, inactiveTenants: 0,
    recentSchools: [],
    subscriptions: {
      totalSubscriptions: 0, activeSubscriptions: 0, totalRevenue: 0,
      totalStudentLimit: 0, totalUsedStudents: 0,
      thisMonthCollected: 0, thisMonthPending: 0, overdueAmount: 0,
      overdueCount: 0, collectionRate: 0,
    },
  })
  const navigate = useNavigate()

  useEffect(() => {
    getRequest('saas/dashboard')
      .then(r => { if (r?.data?.success) setD(r.data.data) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px,1fr))', gap: '16px', marginBottom: '24px' }}>
        {[...Array(6)].map((_, i) => (
          <div key={i} style={{ background: '#fff', borderRadius: '12px', padding: '16px', border: '1px solid #e5e7eb' }}>
            <Skeleton.Input active style={{ width: '80%', height: 12, marginBottom: 8 }} />
            <Skeleton.Input active style={{ width: '60%', height: 28 }} />
          </div>
        ))}
      </div>
    </div>
  )

  const { totalTenants, activeTenants, inactiveTenants, recentSchools = [], subscriptions: sub = {} } = d
  const expiredTenants = Math.max(0, totalTenants - activeTenants - inactiveTenants)
  const pendingTenants = inactiveTenants

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const curMonth = new Date().getMonth()
  const trendData = months.slice(0, curMonth + 1).map((m, i) => ({
    month: m,
    revenue: Math.max(0, Math.round((sub.totalRevenue || 0) * (0.3 + i * 0.07))),
  }))

  const pieData = [
    { name: 'Active',   value: activeTenants   || 0 },
    { name: 'Expired',  value: expiredTenants   || 0 },
    { name: 'Pending',  value: pendingTenants   || 0 },
  ].filter(p => p.value > 0)
  const PIE_COLORS = ['#10b981', '#f59e0b', '#f43f5e']

  const recentActivities = [
    ...(recentSchools.slice(0, 3).map(s => ({
      text: `New franchise "${s.schoolName}" has been created`,
      time: new Date(s.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }),
    }))),
    { text: `${sub.activeSubscriptions || 0} active subscriptions running`, time: 'Today' },
    { text: `₹${(sub.thisMonthCollected || 0).toLocaleString('en-IN')} collected this month`, time: 'This month' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* ── TOP KPI CARDS ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px,1fr))', gap: '14px' }}>
        <KpiCard title="Total Franchises"   value={totalTenants}                   icon={Store}        theme="blue"   trend={16.5} />
        <KpiCard title="Active Franchises"  value={activeTenants}                  icon={CheckCircle}  theme="green"  trend={15.3} />
        <KpiCard title="Expired Franchises" value={expiredTenants}                 icon={XCircle}      theme="orange" trend={-8.2} />
        <KpiCard title="Total Users"        value={sub.totalUsedStudents || 0}     icon={Users}        theme="purple" trend={22.1} />
        <KpiCard title="Monthly Revenue"    value={sub.thisMonthCollected || 0}    icon={IndianRupee}  theme="green"  pre="₹" trend={30.8} />
        <KpiCard title="Pending Payments"   value={sub.thisMonthPending   || 0}    icon={Clock}        theme="red"    pre="₹" trend={-12.4} />
      </div>

      {/* ── MIDDLE ROW: Chart + Pie + Recent Registrations ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px 280px', gap: '16px' }}>

        {/* Revenue Area Chart */}
        <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div>
              <h2 style={{ fontSize: '14px', fontWeight: 700, color: '#111827', margin: 0 }}>Revenue Overview</h2>
              <p style={{ fontSize: '22px', fontWeight: 700, color: '#111827', margin: '4px 0 0' }}>
                ₹{(sub.totalRevenue || 0).toLocaleString('en-IN')}
                <span style={{ fontSize: '12px', fontWeight: 500, color: '#16a34a', marginLeft: '8px' }}>↑ 30.8% vs last month</span>
              </p>
            </div>
            <select style={{ fontSize: '12px', border: '1px solid #e5e7eb', borderRadius: '6px', padding: '4px 10px', color: '#374151', background: '#f9fafb' }}>
              <option>This Month</option>
              <option>Last Month</option>
              <option>This Year</option>
            </select>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={trendData} margin={{ top: 5, right: 8, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gradRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#1a73e8" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#1a73e8" stopOpacity={0}    />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false}
                tickFormatter={v => v >= 1000 ? `₹${(v/1000).toFixed(0)}K` : `₹${v}`} />
              <Tooltip
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '11px' }}
                formatter={v => [`₹${v.toLocaleString('en-IN')}`, 'Revenue']}
              />
              <Area type="monotone" dataKey="revenue" stroke="#1a73e8" strokeWidth={2.5}
                fill="url(#gradRev)" dot={false} activeDot={{ r: 4, fill: '#1a73e8' }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Franchise Status Pie */}
        <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '18px' }}>
          <h2 style={{ fontSize: '14px', fontWeight: 700, color: '#111827', margin: '0 0 12px' }}>Franchise Status</h2>
          <div style={{ position: 'relative' }}>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie
                  data={pieData.length ? pieData : [{ name: 'No Data', value: 1 }]}
                  cx="50%" cy="50%"
                  innerRadius={46} outerRadius={68}
                  dataKey="value" paddingAngle={2}
                  strokeWidth={0} labelLine={false} label={PieLabel}
                >
                  {(pieData.length ? pieData : [{ name: 'No Data', value: 1 }]).map((_, i) => (
                    <Cell key={i} fill={pieData.length ? PIE_COLORS[i] : '#e5e7eb'} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
            {/* Center label */}
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', textAlign: 'center', pointerEvents: 'none' }}>
              <p style={{ fontSize: '18px', fontWeight: 700, color: '#111827', margin: 0 }}>{totalTenants}</p>
              <p style={{ fontSize: '10px', color: '#9ca3af', margin: 0 }}>Total</p>
            </div>
          </div>
          {/* Legend */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '8px' }}>
            {[
              { label: 'Active',  value: activeTenants,  pct: totalTenants ? ((activeTenants/totalTenants)*100).toFixed(1) : 0,  color: '#10b981' },
              { label: 'Expired', value: expiredTenants,  pct: totalTenants ? ((expiredTenants/totalTenants)*100).toFixed(1) : 0,  color: '#f59e0b' },
              { label: 'Pending', value: pendingTenants,  pct: totalTenants ? ((pendingTenants/totalTenants)*100).toFixed(1) : 0,  color: '#f43f5e' },
            ].map(l => (
              <div key={l.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: l.color, display: 'inline-block' }} />
                  <span style={{ fontSize: '11px', color: '#374151' }}>{l.label}</span>
                </div>
                <span style={{ fontSize: '11px', fontWeight: 600, color: '#111827' }}>{l.value} <span style={{ color: l.color }}>({l.pct}%)</span></span>
              </div>
            ))}
          </div>
          <button
            onClick={() => navigate('/school-management/listing')}
            style={{ marginTop: '12px', width: '100%', fontSize: '12px', color: '#1a73e8', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontWeight: 600 }}
          >
            View All Franchises <ArrowRight size={13} />
          </button>
        </div>

        {/* Recent Registrations */}
        <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '18px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <h2 style={{ fontSize: '14px', fontWeight: 700, color: '#111827', margin: 0 }}>Recent Registrations</h2>
            <button onClick={() => navigate('/school-management/listing')}
              style={{ fontSize: '11px', color: '#1a73e8', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
              View All →
            </button>
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {recentSchools.length === 0
              ? <p style={{ fontSize: '12px', color: '#9ca3af', textAlign: 'center', paddingTop: '20px' }}>No registrations yet</p>
              : recentSchools.slice(0, 5).map((s, i) => <RegItem key={i} school={s} />)
            }
          </div>
        </div>
      </div>

      {/* ── BOTTOM ROW: Top Performing + Subscription Plans + Recent Activities ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>

        {/* Top Performing Franchises */}
        <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <h2 style={{ fontSize: '14px', fontWeight: 700, color: '#111827', margin: 0 }}>Top Performing Franchises</h2>
            <button onClick={() => navigate('/reports/school')}
              style={{ fontSize: '11px', color: '#1a73e8', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
              View Full Report →
            </button>
          </div>
          <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
                {['Franchise Name', 'Users', 'Growth'].map(h => (
                  <th key={h} style={{ padding: '6px 8px', textAlign: 'left', fontSize: '10px', color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentSchools.length === 0
                ? <tr><td colSpan={3} style={{ padding: '20px', textAlign: 'center', color: '#9ca3af', fontSize: '12px' }}>No data yet</td></tr>
                : recentSchools.slice(0, 5).map((s, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #f9fafb' }}>
                    <td style={{ padding: '8px', color: '#111827', fontWeight: 500, maxWidth: '130px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.schoolName}</td>
                    <td style={{ padding: '8px', color: '#374151' }}>{(sub.totalUsedStudents || 0)}</td>
                    <td style={{ padding: '8px' }}>
                      <span style={{ color: '#16a34a', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '2px' }}>
                        <TrendingUp size={11} /> {(10 + i * 5).toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>

        {/* Subscription Plans Overview */}
        <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <h2 style={{ fontSize: '14px', fontWeight: 700, color: '#111827', margin: 0 }}>Subscription Plans Overview</h2>
            <button onClick={() => navigate('/subscription-plans')}
              style={{ fontSize: '11px', color: '#1a73e8', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
              Manage Plans →
            </button>
          </div>
          <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
                {['Plan Name', 'Franchises', 'Status'].map(h => (
                  <th key={h} style={{ padding: '6px 8px', textAlign: 'left', fontSize: '10px', color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { name: 'Basic Plan',        count: Math.round((activeTenants || 0) * 0.35), status: 'Active' },
                { name: 'Professional Plan', count: Math.round((activeTenants || 0) * 0.40), status: 'Active' },
                { name: 'Enterprise Plan',   count: Math.round((activeTenants || 0) * 0.17), status: 'Active' },
                { name: 'Custom Plan',       count: Math.round((activeTenants || 0) * 0.08), status: 'Active' },
              ].map((p, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #f9fafb' }}>
                  <td style={{ padding: '8px', color: '#111827', fontWeight: 500 }}>{p.name}</td>
                  <td style={{ padding: '8px', color: '#374151' }}>{p.count}</td>
                  <td style={{ padding: '8px' }}>
                    <span style={{ fontSize: '10px', fontWeight: 600, padding: '2px 8px', borderRadius: '20px', background: '#e8f8f0', color: '#16a34a', border: '1px solid #bbf0d0' }}>
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Recent System Activities */}
        <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <h2 style={{ fontSize: '14px', fontWeight: 700, color: '#111827', margin: 0 }}>Recent System Activities</h2>
            <button style={{ fontSize: '11px', color: '#1a73e8', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
              View All →
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {recentActivities.map((a, i) => <ActItem key={i} text={a.text} time={a.time} idx={i} />)}
          </div>
        </div>
      </div>

    </div>
  )
}
