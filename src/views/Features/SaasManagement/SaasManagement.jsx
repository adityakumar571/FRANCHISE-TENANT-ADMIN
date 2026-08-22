/* eslint-disable prettier/prettier */
import { useState } from 'react'
import {
  CreditCard, Calendar, TrendingUp, Users, Shield,
  ChevronRight, RefreshCw, Plus, Eye,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts'

/* ─── mock data ──────────────────────────────── */
const KPI = [
  { title: 'Active Subscriptions', val: '248',         trend: '+18 this month', up: true,  color: '#1a73e8', bg: '#e8f1ff', bd: '#c5d8ff' },
  { title: 'Expiring Soon',        val: '32',          trend: 'Within 30 days', up: false, color: '#d97706', bg: '#fffbeb', bd: '#fde68a' },
  { title: 'Total Revenue (MTD)',  val: '₹12,45,600',  trend: '+12.5% from last month', up: true, color: '#16a34a', bg: '#e8f8f0', bd: '#bbf0d0' },
  { title: 'Total Franchises',     val: '512',         trend: '+23 this month', up: true,  color: '#7c3aed', bg: '#f0ecff', bd: '#d4c8ff' },
  { title: 'Active Licenses',      val: '298',         trend: 'Across all plans', up: true, color: '#0891b2', bg: '#e0f7fa', bd: '#b2ebf2' },
]

const SUB_OVERVIEW = [
  { name: 'Basic Plan',      count: 72,  pct: '29.03%', color: '#1a73e8' },
  { name: 'Standard Plan',   count: 98,  pct: '39.52%', color: '#16a34a' },
  { name: 'Premium Plan',    count: 56,  pct: '22.58%', color: '#f59e0b' },
  { name: 'Enterprise Plan', count: 22,  pct: '8.87%',  color: '#7c3aed' },
]
const TOTAL_SUBS = SUB_OVERVIEW.reduce((a, b) => a + b.count, 0)

const PLAN_UPGRADES = [
  { customer: 'City Care Pharmacy',   from: 'Basic',    to: 'Standard',   date: '18 May 2025', status: 'Completed' },
  { customer: 'HealthPlus Pharmacy',  from: 'Standard', to: 'Premium',    date: '17 May 2025', status: 'Completed' },
  { customer: 'Medico Store',         from: 'Basic',    to: 'Standard',   date: '16 May 2025', status: 'Completed' },
  { customer: 'Wellness Pharmacy',    from: 'Standard', to: 'Premium',    date: '15 May 2025', status: 'Completed' },
  { customer: 'LifeCare Pharmacy',    from: 'Premium',  to: 'Enterprise', date: '14 May 2025', status: 'Completed' },
]

const RENEWALS = [
  { customer: 'Sunrise Pharmacy',    plan: 'Standard',   renewal: '28 May 2025', daysLeft: 8,  amount: '₹4,999' },
  { customer: 'MediCare Store',      plan: 'Premium',    renewal: '29 May 2025', daysLeft: 9,  amount: '₹9,999' },
  { customer: 'Apna Pharmacy',       plan: 'Basic',      renewal: '02 Jun 2025', daysLeft: 13, amount: '₹2,999' },
  { customer: 'Care & Cure',         plan: 'Standard',   renewal: '05 Jun 2025', daysLeft: 16, amount: '₹4,999' },
  { customer: 'Wellness 24x7',       plan: 'Premium',    renewal: '07 Jun 2025', daysLeft: 18, amount: '₹9,999' },
]

const PAYMENTS = [
  { invoice: 'INV-2025-0518', customer: 'City Care Pharmacy',  plan: 'Standard',   amount: '₹4,999',  date: '18 May 2025', mode: 'Razorpay', status: 'Paid' },
  { invoice: 'INV-2025-0517', customer: 'HealthPlus Pharmacy', plan: 'Premium',    amount: '₹9,999',  date: '17 May 2025', mode: 'UPI',      status: 'Paid' },
  { invoice: 'INV-2025-0516', customer: 'Medico Store',        plan: 'Standard',   amount: '₹4,999',  date: '16 May 2025', mode: 'Card',     status: 'Paid' },
  { invoice: 'INV-2025-0515', customer: 'LifeCare Pharmacy',   plan: 'Enterprise', amount: '₹19,999', date: '15 May 2025', mode: 'Net Banking', status: 'Paid' },
  { invoice: 'INV-2025-0514', customer: 'Apna Pharmacy',       plan: 'Basic',      amount: '₹2,999',  date: '14 May 2025', mode: 'UPI',      status: 'Paid' },
]

const REVENUE_CHART = [
  { m: 'Dec', v: 680000 }, { m: 'Jan', v: 820000 }, { m: 'Feb', v: 750000 },
  { m: 'Mar', v: 940000 }, { m: 'Apr', v: 1080000 }, { m: 'May', v: 1245600 },
]

/* ─── LICENSE mock ───────────────────────────── */
const LICENSE = {
  key: 'FA-SAAS-8F3G-7H2J-K9L1',
  customer: 'FranchiseAll Admin',
  type: 'Enterprise Plan',
  validFrom: '18 May 2025',
  validUpto: '18 May 2026',
  status: 'Active',
  usage: { users: [12, 20], devices: [8, 15], storage: [24, 50], api: [45000, 100000] },
  modules: ['Franchise Management', 'Subscription Plans', 'Reports & Analytics', 'User Roles & Permissions', 'Billing & Invoices', 'Support & Help'],
}

/* ─── helpers ────────────────────────────────── */
const card = (extra = {}) => ({
  background: '#fff',
  border: '1px solid #e5e7eb',
  borderRadius: '12px',
  padding: '18px 20px',
  ...extra,
})

const Badge = ({ s }) => {
  const map = { Completed: ['#e8f8f0', '#16a34a'], Active: ['#e8f8f0', '#16a34a'], Paid: ['#e8f8f0', '#16a34a'], Pending: ['#fffbeb', '#d97706'], Failed: ['#fff1f1', '#dc2626'] }
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

/* ═══════════════════════════════════════════════ */
export default function SaasManagement() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('subscription')

  const TABS = [
    { id: 'subscription', label: 'Subscription Overview' },
    { id: 'upgrades',     label: 'Plan Upgrade' },
    { id: 'renewals',     label: 'Renewal' },
    { id: 'payments',     label: 'Payment History' },
    { id: 'license',      label: 'License' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '16px' }}>

      {/* ── Page header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#111827', margin: 0 }}>SaaS Management</h1>
          <p style={{ fontSize: '12px', color: '#9ca3af', margin: '2px 0 0' }}>Manage your subscription, plans, renewals and licenses</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#fff', color: '#374151', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '8px 14px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
            <RefreshCw size={13} /> Refresh
          </button>
          <button onClick={() => navigate('/subscription-plans')} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#1a73e8', color: '#fff', border: 'none', borderRadius: '8px', padding: '8px 14px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
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
              <p style={{ fontSize: '18px', fontWeight: 700, color: '#111827', margin: '2px 0' }}>{k.val}</p>
              <p style={{ fontSize: '10px', fontWeight: 600, color: k.up ? '#16a34a' : '#d97706', margin: 0 }}>{k.up ? '↑' : '⚠'} {k.trend}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Tabs ── */}
      <div style={{ display: 'flex', gap: '0', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px', overflow: 'hidden', width: 'fit-content' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            style={{ padding: '10px 20px', border: 'none', borderRight: '1px solid #e5e7eb', cursor: 'pointer', fontSize: '12px', fontWeight: 600, background: activeTab === t.id ? '#1a73e8' : '#fff', color: activeTab === t.id ? '#fff' : '#6b7280', transition: 'all .15s' }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Tab: Subscription Overview ── */}
      {activeTab === 'subscription' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '16px', alignItems: 'start' }}>

          {/* Revenue chart */}
          <div style={card()}>
            <SHead n="Monthly Revenue" sub="Last 6 months subscription revenue" />
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={REVENUE_CHART} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="m" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v / 1000).toFixed(0)}K`} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '11px' }} formatter={v => [`₹${v.toLocaleString('en-IN')}`, 'Revenue']} />
                <Bar dataKey="v" fill="#1a73e8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Subscription plan pie */}
          <div style={card()}>
            <SHead n="Subscription Overview" />
            <div style={{ position: 'relative' }}>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={SUB_OVERVIEW} cx="50%" cy="50%" innerRadius={45} outerRadius={65} dataKey="count" paddingAngle={2} strokeWidth={0}>
                    {SUB_OVERVIEW.map((p, i) => <Cell key={i} fill={p.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', textAlign: 'center', pointerEvents: 'none' }}>
                <p style={{ fontSize: '20px', fontWeight: 700, color: '#111827', margin: 0 }}>{TOTAL_SUBS}</p>
                <p style={{ fontSize: '10px', color: '#9ca3af', margin: 0 }}>Total</p>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '8px' }}>
              {SUB_OVERVIEW.map(p => (
                <div key={p.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: p.color, display: 'inline-block' }} />
                    <span style={{ fontSize: '11px', color: '#374151' }}>{p.name}</span>
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: '#111827' }}>{p.count} <span style={{ color: '#9ca3af' }}>({p.pct})</span></span>
                </div>
              ))}
            </div>
            {/* Active / Cancelled / Suspended / Trial counts */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '14px', paddingTop: '12px', borderTop: '1px solid #f3f4f6' }}>
              {[{ l: 'Active', v: 248, c: '#16a34a' }, { l: 'Cancelled', v: 18, c: '#dc2626' }, { l: 'Suspended', v: 6, c: '#d97706' }, { l: 'Trial', v: 12, c: '#1a73e8' }].map(x => (
                <div key={x.l} style={{ textAlign: 'center', padding: '6px', background: '#f9fafb', borderRadius: '6px' }}>
                  <p style={{ fontSize: '16px', fontWeight: 700, color: x.c, margin: 0 }}>{x.v}</p>
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

      {/* ── Tab: Plan Upgrades ── */}
      {activeTab === 'upgrades' && (
        <div style={card()}>
          <SHead n="Plan Upgrade" sub="Recent plan upgrades by franchises" />
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr>{['Customer Name', 'From Plan', 'To Plan', 'Upgrade Date', 'Status'].map(h => <Th key={h} c={h} />)}</tr></thead>
            <tbody>
              {PLAN_UPGRADES.map((r, i) => (
                <tr key={i} onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'} onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
                  <Td c={<span style={{ fontWeight: 600, color: '#111827' }}>{r.customer}</span>} />
                  <Td c={<span style={{ fontSize: '11px', background: '#f3f4f6', color: '#6b7280', padding: '2px 8px', borderRadius: '20px' }}>{r.from}</span>} />
                  <Td c={<span style={{ fontSize: '11px', background: '#e8f1ff', color: '#1a73e8', padding: '2px 8px', borderRadius: '20px', fontWeight: 600 }}>{r.to}</span>} />
                  <Td c={<span style={{ color: '#6b7280' }}>{r.date}</span>} />
                  <Td c={<Badge s={r.status} />} />
                </tr>
              ))}
            </tbody>
          </table>
          <button onClick={() => navigate('/subscription-history')} style={{ marginTop: '14px', fontSize: '12px', color: '#1a73e8', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
            View All Plan Upgrades <ChevronRight size={13} />
          </button>
        </div>
      )}

      {/* ── Tab: Renewals ── */}
      {activeTab === 'renewals' && (
        <div style={card()}>
          <SHead n="Renewal" sub="Upcoming subscription renewals" />
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr>{['Customer Name', 'Plan', 'Renewal Date', 'Days Left', 'Amount (₹)', 'Action'].map(h => <Th key={h} c={h} />)}</tr></thead>
            <tbody>
              {RENEWALS.map((r, i) => (
                <tr key={i} onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'} onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
                  <Td c={<span style={{ fontWeight: 600, color: '#111827' }}>{r.customer}</span>} />
                  <Td c={r.plan} />
                  <Td c={r.renewal} />
                  <Td c={
                    <span style={{ fontSize: '11px', fontWeight: 700, color: r.daysLeft <= 10 ? '#dc2626' : r.daysLeft <= 15 ? '#d97706' : '#16a34a' }}>
                      {r.daysLeft} days
                    </span>
                  } />
                  <Td c={<span style={{ fontWeight: 600 }}>{r.amount}</span>} />
                  <Td c={
                    <button style={{ fontSize: '11px', background: '#e8f1ff', color: '#1a73e8', border: 'none', borderRadius: '6px', padding: '4px 10px', cursor: 'pointer', fontWeight: 600 }}>
                      Send Reminder
                    </button>
                  } />
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Tab: Payment History ── */}
      {activeTab === 'payments' && (
        <div style={card()}>
          <SHead n="Payment History" sub="Recent payment transactions" />
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr>{['Invoice ID', 'Customer Name', 'Plan', 'Amount (₹)', 'Payment Date', 'Mode', 'Status', 'Action'].map(h => <Th key={h} c={h} />)}</tr></thead>
            <tbody>
              {PAYMENTS.map((r, i) => (
                <tr key={i} onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'} onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
                  <Td c={<span style={{ fontFamily: 'monospace', fontSize: '11px', color: '#1a73e8', fontWeight: 600 }}>{r.invoice}</span>} />
                  <Td c={<span style={{ fontWeight: 600, color: '#111827' }}>{r.customer}</span>} />
                  <Td c={r.plan} />
                  <Td c={<span style={{ fontWeight: 600 }}>{r.amount}</span>} />
                  <Td c={<span style={{ color: '#6b7280' }}>{r.date}</span>} />
                  <Td c={<span style={{ fontSize: '11px', background: '#f3f4f6', color: '#374151', padding: '2px 8px', borderRadius: '20px' }}>{r.mode}</span>} />
                  <Td c={<Badge s={r.status} />} />
                  <Td c={<button style={{ background: '#e8f1ff', border: 'none', borderRadius: '6px', padding: '4px 8px', cursor: 'pointer', color: '#1a73e8' }}><Eye size={13} /></button>} />
                </tr>
              ))}
            </tbody>
          </table>
          <button onClick={() => navigate('/payments')} style={{ marginTop: '14px', fontSize: '12px', color: '#1a73e8', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
            View All Payments <ChevronRight size={13} />
          </button>
        </div>
      )}

      {/* ── Tab: License ── */}
      {activeTab === 'license' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', alignItems: 'start' }}>
          {/* License info */}
          <div style={card()}>
            <SHead n="License" sub="License information" />
            <div style={{ background: 'linear-gradient(135deg, #0f1f3d, #1a3a6b)', borderRadius: '10px', padding: '18px', color: '#fff', marginBottom: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div>
                  <p style={{ fontSize: '14px', fontWeight: 700, margin: 0 }}>FranchiseAll SaaS License</p>
                  <span style={{ fontSize: '10px', background: '#16a34a', padding: '2px 8px', borderRadius: '20px', fontWeight: 600 }}>Active</span>
                </div>
                <Shield size={24} color="#fabf22" />
              </div>
              {[
                { l: 'License Key',    v: LICENSE.key,      mono: true },
                { l: 'Customer Name',  v: LICENSE.customer  },
                { l: 'License Type',   v: LICENSE.type       },
                { l: 'Valid From',     v: LICENSE.validFrom  },
                { l: 'Valid Upto',     v: LICENSE.validUpto  },
              ].map(r => (
                <div key={r.l} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '11px', color: 'rgba(255,255,255,.6)' }}>{r.l}</span>
                  <span style={{ fontSize: '11px', fontWeight: 600, fontFamily: r.mono ? 'monospace' : undefined }}>{r.v}</span>
                </div>
              ))}
            </div>

            {/* Usage bars */}
            <p style={{ fontSize: '12px', fontWeight: 700, color: '#111827', margin: '0 0 12px' }}>License Usage</p>
            {[
              { l: 'Users',        u: LICENSE.usage.users,   color: '#1a73e8' },
              { l: 'Devices',      u: LICENSE.usage.devices, color: '#16a34a' },
              { l: 'Data Storage', u: LICENSE.usage.storage, color: '#f59e0b', suffix: ' GB' },
              { l: 'API Calls',    u: LICENSE.usage.api,     color: '#7c3aed' },
            ].map(r => {
              const pct = Math.round((r.u[0] / r.u[1]) * 100)
              return (
                <div key={r.l} style={{ marginBottom: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                    <span style={{ fontSize: '11px', color: '#374151', fontWeight: 500 }}>{r.l}</span>
                    <span style={{ fontSize: '11px', color: '#6b7280' }}>{r.u[0].toLocaleString()}{r.suffix || ''} / {r.u[1].toLocaleString()}{r.suffix || ''}</span>
                  </div>
                  <div style={{ height: '6px', background: '#f3f4f6', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: r.color, borderRadius: '3px', transition: 'width .3s' }} />
                  </div>
                </div>
              )
            })}
          </div>

          {/* Licensed modules */}
          <div style={card()}>
            <SHead n="Licensed Modules" sub="Modules included in your plan" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {LICENSE.modules.map(m => (
                <div key={m} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f8fafc', borderRadius: '8px', padding: '10px 12px' }}>
                  <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#e8f8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontSize: '10px', color: '#16a34a', fontWeight: 700 }}>✓</span>
                  </div>
                  <span style={{ fontSize: '12px', color: '#374151', fontWeight: 500 }}>{m}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: '16px', padding: '14px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e5e7eb' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', color: '#6b7280' }}>Subscription Status</span>
                <Badge s="Active" />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', color: '#6b7280' }}>Days Remaining</span>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#111827' }}>363 days</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '12px', color: '#6b7280' }}>Auto Renewal</span>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#16a34a' }}>Enabled</span>
              </div>
            </div>
            <button style={{ marginTop: '14px', width: '100%', padding: '10px', background: '#1a73e8', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
              Upgrade Plan
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
