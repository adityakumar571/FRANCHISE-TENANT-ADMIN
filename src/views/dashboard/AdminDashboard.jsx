/* eslint-disable prettier/prettier */
import {
  Store, CheckCircle, XCircle, Users, IndianRupee, Clock,
  TrendingUp, ArrowRight, ArrowUpRight, CalendarDays,
} from 'lucide-react'
import { useState } from 'react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts'
import { useNavigate } from 'react-router-dom'

/* ── mock data ───────────────────────────────────────────────────────── */
const KPI = [
  { title: 'Total Franchises',   value: '1,256', trend: '+16.5%', up: true,  icon: Store,        theme: { bg: '#e8f1ff', ic: '#1a73e8', bd: '#c5d8ff' } },
  { title: 'Active Franchises',  value: '1,102', trend: '+15.3%', up: true,  icon: CheckCircle,  theme: { bg: '#e8f8f0', ic: '#16a34a', bd: '#bbf0d0' } },
  { title: 'Expired Franchises', value: '78',    trend: '-8.2%',  up: false, icon: XCircle,      theme: { bg: '#fff4e6', ic: '#ea7c1e', bd: '#ffd9a8' } },
  { title: 'Total Users',        value: '5,432', trend: '+22.1%', up: true,  icon: Users,        theme: { bg: '#f0ecff', ic: '#7c3aed', bd: '#d4c8ff' } },
  { title: 'Monthly Revenue',    value: '₹ 24,58,750', trend: '+30.8%', up: true,  icon: IndianRupee, theme: { bg: '#e8f8f0', ic: '#16a34a', bd: '#bbf0d0' } },
  { title: 'Pending Payments',   value: '₹ 3,25,640',  trend: '-12.4%', up: false, icon: Clock,       theme: { bg: '#fff1f1', ic: '#dc2626', bd: '#ffc5c5' } },
]

const REVENUE_DATA = [
  { d: '1 May', v: 180000 }, { d: '5 May', v: 220000 }, { d: '10 May', v: 195000 },
  { d: '12 May', v: 260000 }, { d: '15 May', v: 240000 }, { d: '18 May', v: 310000 },
  { d: '20 May', v: 2458750 },
]

const PIE_DATA = [
  { name: 'Active',  value: 1102, pct: '87.7%', color: '#10b981' },
  { name: 'Expired', value: 78,   pct: '6.2%',  color: '#f59e0b' },
  { name: 'Pending', value: 76,   pct: '6.1%',  color: '#f43f5e' },
]

const RECENT_REGS = [
  { name: 'Sharma Medical Store', time: '20 May 2025, 10:30 AM', active: true  },
  { name: 'Verma Pharmacy',        time: '20 May 2025, 09:45 AM', active: true  },
  { name: 'Patel Drug House',      time: '20 May 2025, 09:13 AM', active: false },
  { name: 'Gupta Medicals',        time: '20 May 2025, 08:50 AM', active: true  },
  { name: 'Khan Pharmacy',         time: '20 May 2025, 08:20 AM', active: true  },
]

const TOP_FRANCHISES = [
  { name: 'Sharma Medical Store', sales: '₹ 4,25,680', orders: 1258, users: 12, growth: '+24.5%' },
  { name: 'Verma Pharmacy',        sales: '₹ 3,85,420', orders: 1123, users: 10, growth: '+18.2%' },
  { name: 'Patel Drug House',      sales: '₹ 3,25,780', orders:  980, users:  8, growth: '+10.8%' },
  { name: 'Gupta Medicals',        sales: '₹ 2,95,640', orders:  875, users:  9, growth: '+11.3%' },
  { name: 'Khan Pharmacy',         sales: '₹ 2,45,210', orders:  765, users:  7, growth: '+10.1%' },
]

const SUB_PLANS = [
  { name: 'Basic Plan',         franchises: 425, revenue: '₹ 4,25,000', status: 'Active' },
  { name: 'Professional Plan',  franchises: 512, revenue: '₹ 10,24,000', status: 'Active' },
  { name: 'Enterprise Plan',    franchises: 210, revenue: '₹ 7,14,000', status: 'Active' },
  { name: 'Custom Plan',        franchises: 109, revenue: '₹ 97,750',   status: 'Active' },
]

const RECENT_INVOICES = [
  { no: 'INV-2025-346', name: 'Sharma Medical Store', plan: 'Professional', amount: '₹ 2,999', status: 'Paid',    date: '20 May 2025' },
  { no: 'INV-2025-345', name: 'Verma Pharmacy',        plan: 'Basic',        amount: '₹ 999',   status: 'Paid',    date: '20 May 2025' },
  { no: 'INV-2025-344', name: 'Patel Drug House',      plan: 'Enterprise',   amount: '₹ 5,999', status: 'Pending', date: '18 May 2025' },
  { no: 'INV-2025-343', name: 'Gupta Medicals',        plan: 'Professional', amount: '₹ 2,999', status: 'Paid',    date: '16 May 2025' },
  { no: 'INV-2025-342', name: 'Khan Pharmacy',         plan: 'Basic',        amount: '₹ 999',   status: 'Paid',    date: '16 May 2025' },
]

const ACTIVITIES = [
  { text: 'New franchise "Sharma Medical Store" has been created', time: '20 May 2025, 1:30 PM',  color: '#10b981' },
  { text: 'Payment of ₹12,000 received from Verma Pharmacy',       time: '20 May 2025, 09:45 AM', color: '#3b82f6' },
  { text: 'Subscription of "Patel Drug House" is expiring in 5 days', time: '20 May 2025, 09:15 AM', color: '#f59e0b' },
  { text: 'New user "Amit Sharma" added by Sharma Medical Store',   time: '20 May 2025, 08:50 AM', color: '#8b5cf6' },
  { text: 'New support ticket received from Khan Pharmacy',         time: '20 May 2025, 08:20 AM', color: '#ef4444' },
]

/* ── helpers ──────────────────────────────────────────────────────────── */
const card = (extra = {}) => ({
  background: '#fff', borderRadius: '10px', border: '1px solid #e5e7eb',
  padding: '16px 18px', ...extra,
})

const RAD = Math.PI / 180
function PieLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }) {
  if (percent < 0.06) return null
  const r = innerRadius + (outerRadius - innerRadius) * 0.55
  const x = cx + r * Math.cos(-midAngle * RAD)
  const y = cy + r * Math.sin(-midAngle * RAD)
  return <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central" fontSize={10} fontWeight={600}>{`${(percent * 100).toFixed(0)}%`}</text>
}

const Badge = ({ status }) => {
  const map = { Active: ['#e8f8f0', '#16a34a', '#bbf0d0'], Paid: ['#e8f8f0', '#16a34a', '#bbf0d0'], Pending: ['#fffbeb', '#d97706', '#fde68a'], Inactive: ['#fff1f1', '#dc2626', '#ffc5c5'] }
  const [bg, tx, bd] = map[status] || ['#f3f4f6', '#6b7280', '#e5e7eb']
  return <span style={{ fontSize: '10px', fontWeight: 600, padding: '2px 8px', borderRadius: '20px', background: bg, color: tx, border: `1px solid ${bd}` }}>{status}</span>
}

const Th = ({ children }) => <th style={{ padding: '7px 10px', textAlign: 'left', fontSize: '10px', color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase', borderBottom: '1px solid #f3f4f6', whiteSpace: 'nowrap' }}>{children}</th>
const Td = ({ children, style = {} }) => <td style={{ padding: '8px 10px', fontSize: '12px', color: '#374151', borderBottom: '1px solid #f9fafb', ...style }}>{children}</td>

/* ══════════════════════════════════════════════════════════════════════ */
export default function AdminDashboard() {
  const navigate = useNavigate()

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '18px' }}>

      {/* ── 6 KPI cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: '14px' }}>
        {KPI.map((k) => (
          <div key={k.title} style={{ ...card(), display: 'flex', flexDirection: 'column', gap: '8px' }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 14px rgba(0,0,0,0.08)'}
            onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '11px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '.04em', lineHeight: 1.3 }}>{k.title}</span>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: k.theme.bg, border: `1px solid ${k.theme.bd}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <k.icon size={15} style={{ color: k.theme.ic }} />
              </div>
            </div>
            <p style={{ fontSize: '20px', fontWeight: 700, color: '#111827', margin: 0 }}>{k.value}</p>
            <span style={{ fontSize: '11px', fontWeight: 600, color: k.up ? '#16a34a' : '#dc2626', display: 'flex', alignItems: 'center', gap: '3px' }}>
              <ArrowUpRight size={12} /> {k.trend} vs last month
            </span>
          </div>
        ))}
      </div>

      {/* ── Revenue chart + Pie + Recent Registrations ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px 240px', gap: '14px' }}>

        {/* Revenue Area Chart */}
        <div style={card()}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <div>
              <p style={{ fontSize: '13px', fontWeight: 700, color: '#111827', margin: 0 }}>Revenue Overview</p>
              <p style={{ fontSize: '20px', fontWeight: 700, color: '#111827', margin: '4px 0 0' }}>
                ₹ 24,58,750 <span style={{ fontSize: '11px', color: '#16a34a', fontWeight: 600 }}>↑ 30.8% vs last month</span>
              </p>
            </div>
            <select style={{ fontSize: '11px', border: '1px solid #e5e7eb', borderRadius: '6px', padding: '4px 8px', color: '#374151', background: '#f9fafb' }}>
              <option>This Month</option><option>Last Month</option><option>This Year</option>
            </select>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={REVENUE_DATA} margin={{ top: 5, right: 5, left: -22, bottom: 0 }}>
              <defs>
                <linearGradient id="gRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#1a73e8" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#1a73e8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="d" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 9, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}K`} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '11px' }} formatter={v => [`₹${v.toLocaleString('en-IN')}`, 'Revenue']} />
              <Area type="monotone" dataKey="v" stroke="#1a73e8" strokeWidth={2} fill="url(#gRev)" dot={false} activeDot={{ r: 4 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Franchise Status Pie */}
        <div style={card({ display: 'flex', flexDirection: 'column' })}>
          <p style={{ fontSize: '13px', fontWeight: 700, color: '#111827', margin: '0 0 8px' }}>Franchise Status</p>
          <div style={{ position: 'relative', flex: 1 }}>
            <ResponsiveContainer width="100%" height={140}>
              <PieChart>
                <Pie data={PIE_DATA} cx="50%" cy="50%" innerRadius={42} outerRadius={60}
                  dataKey="value" paddingAngle={2} strokeWidth={0} labelLine={false} label={PieLabel}>
                  {PIE_DATA.map((p, i) => <Cell key={i} fill={p.color} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', textAlign: 'center', pointerEvents: 'none' }}>
              <p style={{ fontSize: '18px', fontWeight: 700, color: '#111827', margin: 0 }}>1,256</p>
              <p style={{ fontSize: '10px', color: '#9ca3af', margin: 0 }}>Total</p>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginTop: '6px' }}>
            {PIE_DATA.map(p => (
              <div key={p.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: p.color, display: 'inline-block' }} />
                  <span style={{ fontSize: '11px', color: '#374151' }}>{p.name}</span>
                </div>
                <span style={{ fontSize: '11px', fontWeight: 600, color: '#111827' }}>{p.value} <span style={{ color: p.color }}>({p.pct})</span></span>
              </div>
            ))}
          </div>
          <button onClick={() => navigate('/franchise-management')}
            style={{ marginTop: '10px', fontSize: '11px', color: '#1a73e8', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
            View All Franchises <ArrowRight size={12} />
          </button>
        </div>

        {/* Recent Registrations */}
        <div style={card({ display: 'flex', flexDirection: 'column' })}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <p style={{ fontSize: '13px', fontWeight: 700, color: '#111827', margin: 0 }}>Recent Registrations</p>
            <button onClick={() => navigate('/franchise-management')}
              style={{ fontSize: '11px', color: '#1a73e8', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>View All →</button>
          </div>
          {RECENT_REGS.map((r, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '7px 0', borderBottom: i < RECENT_REGS.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#e8f1ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Store size={14} style={{ color: '#1a73e8' }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: '12px', fontWeight: 600, color: '#111827', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.name}</p>
                <p style={{ fontSize: '10px', color: '#9ca3af', margin: 0 }}>{r.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Top Performing + Sub Plans Overview + Recent Activities ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>

        {/* Top Performing Franchises */}
        <div style={card()}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <p style={{ fontSize: '13px', fontWeight: 700, color: '#111827', margin: 0 }}>Top Performing Franchises</p>
            <button style={{ fontSize: '11px', color: '#1a73e8', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>View Full Report →</button>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr><Th>Franchise Name</Th><Th>Total Sales (₹)</Th><Th>Orders</Th><Th>Users</Th><Th>Growth</Th></tr></thead>
            <tbody>
              {TOP_FRANCHISES.map((f, i) => (
                <tr key={i}>
                  <Td style={{ fontWeight: 600, color: '#111827' }}>{f.name}</Td>
                  <Td>{f.sales}</Td>
                  <Td>{f.orders}</Td>
                  <Td>{f.users}</Td>
                  <Td><span style={{ color: '#16a34a', fontWeight: 600, fontSize: '12px' }}>{f.growth}</span></Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Subscription Plans Overview */}
        <div style={card()}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <p style={{ fontSize: '13px', fontWeight: 700, color: '#111827', margin: 0 }}>Subscription Plans Overview</p>
            <button onClick={() => navigate('/subscription-plans')} style={{ fontSize: '11px', color: '#1a73e8', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Manage Plans →</button>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr><Th>Plan Name</Th><Th>Franchises</Th><Th>Revenue (₹)</Th><Th>Status</Th></tr></thead>
            <tbody>
              {SUB_PLANS.map((p, i) => (
                <tr key={i}>
                  <Td style={{ fontWeight: 600, color: '#111827' }}>{p.name}</Td>
                  <Td>{p.franchises}</Td>
                  <Td>{p.revenue}</Td>
                  <Td><Badge status={p.status} /></Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Recent System Activities */}
        <div style={card()}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <p style={{ fontSize: '13px', fontWeight: 700, color: '#111827', margin: 0 }}>Recent System Activities</p>
            <button style={{ fontSize: '11px', color: '#1a73e8', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>View All Activities →</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {ACTIVITIES.map((a, i) => (
              <div key={i} style={{ display: 'flex', gap: '10px', padding: '8px 0', borderBottom: i < ACTIVITIES.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: a.color, marginTop: '4px', flexShrink: 0 }} />
                <div>
                  <p style={{ fontSize: '12px', color: '#374151', margin: 0, lineHeight: 1.4 }}>{a.text}</p>
                  <p style={{ fontSize: '10px', color: '#9ca3af', margin: '2px 0 0' }}>{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Recent Invoices ── */}
      <div style={card()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <p style={{ fontSize: '13px', fontWeight: 700, color: '#111827', margin: 0 }}>Recent Invoices</p>
          <button onClick={() => navigate('/payments')} style={{ fontSize: '11px', color: '#1a73e8', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>View All Invoices →</button>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr><Th>Invoice No.</Th><Th>Franchise Name</Th><Th>Plan</Th><Th>Invoice Date</Th><Th>Amount (₹)</Th><Th>Status</Th><Th>Payment Date</Th><Th>Action</Th></tr></thead>
          <tbody>
            {RECENT_INVOICES.map((inv, i) => (
              <tr key={i}>
                <Td style={{ fontFamily: 'monospace', fontSize: '11px' }}>{inv.no}</Td>
                <Td style={{ fontWeight: 600, color: '#111827' }}>{inv.name}</Td>
                <Td>{inv.plan}</Td>
                <Td>20 May 2025</Td>
                <Td style={{ fontWeight: 600 }}>{inv.amount}</Td>
                <Td><Badge status={inv.status} /></Td>
                <Td style={{ color: '#9ca3af' }}>{inv.status === 'Paid' ? '20 May 2025' : '—'}</Td>
                <Td>
                  <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#1a73e8', fontSize: '13px', padding: '2px 6px' }}>👁</button>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  )
}
