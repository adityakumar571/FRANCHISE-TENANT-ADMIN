/* eslint-disable prettier/prettier */
import { useState } from 'react'
import {
  Headphones, Ticket, HelpCircle, BookOpen, Info,
  Phone, Mail, MessageSquare, ChevronRight, Plus,
  ExternalLink, CheckCircle, Clock, AlertCircle, XCircle,
  Star, Download, Search,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

/* ─── mock data ─────────────────────────────── */
const RECENT_TICKETS = [
  { id: '#TK-2025-1058', subject: 'Franchise login issue',        status: 'Open',        priority: 'High',   updated: '20 May 2025, 10:15 AM' },
  { id: '#TK-2025-1057', subject: 'Subscription not activating',  status: 'In Progress', priority: 'Medium', updated: '19 May 2025, 04:30 PM' },
  { id: '#TK-2025-1056', subject: 'Invoice download error',        status: 'Open',        priority: 'Medium', updated: '19 May 2025, 11:20 AM' },
  { id: '#TK-2025-1055', subject: 'Billing amount mismatch',       status: 'Resolved',    priority: 'Low',    updated: '18 May 2025, 05:45 PM' },
  { id: '#TK-2025-1054', subject: 'Unable to add new user',        status: 'Closed',      priority: 'High',   updated: '18 May 2025, 09:30 AM' },
]

const FAQS = [
  'How do I add a new franchise?',
  'How to assign a subscription plan?',
  'How to generate billing report?',
  'How to manage user roles?',
  'How to reset franchise password?',
  'How to view payment history?',
]

const GUIDES = [
  { title: 'Getting Started Guide',            tag: 'PDF' },
  { title: 'Franchise Management Guide',        tag: 'PDF' },
  { title: 'Subscription & Billing Guide',      tag: 'PDF' },
  { title: 'Reports & Analytics Guide',         tag: 'PDF' },
  { title: 'User Roles & Permissions Guide',    tag: 'PDF' },
]

/* ─── helpers ────────────────────────────────── */
const STAT_COLOR = {
  Open:        ['#fff1f1', '#dc2626'],
  'In Progress':['#fffbeb', '#d97706'],
  Resolved:    ['#e8f8f0', '#16a34a'],
  Closed:      ['#f3f4f6', '#6b7280'],
}
const PRI_COLOR = {
  High:   ['#fff1f1', '#dc2626'],
  Medium: ['#fffbeb', '#d97706'],
  Low:    ['#e8f8f0', '#16a34a'],
}

const Badge = ({ label, colors }) => (
  <span style={{ fontSize: '10px', fontWeight: 600, padding: '2px 8px', borderRadius: '20px', background: colors[0], color: colors[1] }}>
    {label}
  </span>
)

const SectionTitle = ({ icon: Icon, text }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#e8f1ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Icon size={16} color="#1a73e8" />
    </div>
    <p style={{ fontSize: '14px', fontWeight: 700, color: '#111827', margin: 0 }}>{text}</p>
  </div>
)

/* ─── card style ─────────────────────────────── */
const card = (extra = {}) => ({
  background: '#fff',
  border: '1px solid #e5e7eb',
  borderRadius: '12px',
  padding: '20px',
  ...extra,
})

/* ═══════════════════════════════════════════════ */
export default function HelpCenter() {
  const navigate = useNavigate()
  const [activeSection, setActiveSection] = useState('support')

  const SECTIONS = [
    { id: 'support', label: '1. Support',    icon: Headphones, desc: 'Get help from our support team for any issues.' },
    { id: 'tickets', label: '2. Tickets',    icon: Ticket,     desc: 'View and manage your support tickets.' },
    { id: 'faq',     label: '3. FAQs',       icon: HelpCircle, desc: 'Find quick answers to common questions.' },
    { id: 'guide',   label: '4. User Guide', icon: BookOpen,   desc: 'Step-by-step guides to help you use the system.' },
    { id: 'about',   label: '5. About',      icon: Info,       desc: 'Learn more about Franchise Management System.' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '18px' }}>

      {/* ── Header ── */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '20px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#111827', margin: 0 }}>Help Center</h1>
            <p style={{ fontSize: '13px', color: '#9ca3af', margin: '4px 0 0' }}>We are here to help you. Get support and find answers.</p>
          </div>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>20 May 2025</div>
        </div>

        {/* Section cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: '12px', marginTop: '20px' }}>
          {SECTIONS.map(s => {
            const Icon = s.icon
            const active = activeSection === s.id
            return (
              <button key={s.id} onClick={() => setActiveSection(s.id)}
                style={{ border: `2px solid ${active ? '#1a73e8' : '#e5e7eb'}`, borderRadius: '10px', padding: '16px 12px', background: active ? '#e8f1ff' : '#fff', cursor: 'pointer', textAlign: 'center', transition: 'all .15s' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: active ? '#1a73e8' : '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px' }}>
                  <Icon size={18} color={active ? '#fff' : '#6b7280'} />
                </div>
                <p style={{ fontSize: '12px', fontWeight: 700, color: active ? '#1a73e8' : '#374151', margin: '0 0 4px' }}>{s.label}</p>
                <p style={{ fontSize: '10px', color: '#9ca3af', margin: 0, lineHeight: 1.4 }}>{s.desc}</p>
                <div style={{ marginTop: '10px' }}>
                  <span style={{ fontSize: '11px', background: active ? '#1a73e8' : '#f3f4f6', color: active ? '#fff' : '#6b7280', padding: '4px 12px', borderRadius: '6px', fontWeight: 600 }}>
                    {s.id === 'support' ? 'Contact Support' : s.id === 'tickets' ? 'View My Tickets' : s.id === 'faq' ? 'Browse FAQs' : s.id === 'guide' ? 'View Guides' : 'About System'}
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Main content grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>

        {/* ── Contact Support ── */}
        <div style={card()}>
          <SectionTitle icon={Headphones} text="Contact Support" />
          <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 16px' }}>Our support team is available to help you.</p>

          {[
            { icon: Mail,         label: 'Email Support',    val: 'support@franchiseall.com', tag: '24/7',             color: '#1a73e8', bg: '#e8f1ff' },
            { icon: Phone,        label: 'Phone Support',    val: '+91 9876543210',            tag: '9AM–7PM',          color: '#16a34a', bg: '#e8f8f0' },
            { icon: MessageSquare,label: 'WhatsApp Support', val: '+91 9876543210',            tag: '9AM–7PM',          color: '#16a34a', bg: '#e8f8f0' },
          ].map(c => {
            const Icon = c.icon
            return (
              <div key={c.label} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderBottom: '1px solid #f3f4f6' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={16} color={c.color} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '12px', fontWeight: 600, color: '#374151', margin: 0 }}>{c.label}</p>
                  <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>{c.val}</p>
                </div>
                <span style={{ fontSize: '10px', background: '#e8f8f0', color: '#16a34a', padding: '2px 8px', borderRadius: '20px', fontWeight: 600 }}>{c.tag}</span>
              </div>
            )
          })}

          <button style={{ marginTop: '14px', width: '100%', padding: '10px', background: '#111827', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            <MessageSquare size={14} /> Start Live Chat
          </button>
        </div>

        {/* ── Recent Tickets ── */}
        <div style={card()}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <SectionTitle icon={Ticket} text="My Recent Tickets" />
            <button onClick={() => navigate('/support')} style={{ fontSize: '11px', color: '#1a73e8', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>View All Tickets →</button>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Ticket ID', 'Subject', 'Status', 'Priority', 'Last Updated'].map(h => (
                  <th key={h} style={{ padding: '6px 8px', textAlign: 'left', fontSize: '10px', color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase', borderBottom: '1px solid #f3f4f6' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {RECENT_TICKETS.map(t => (
                <tr key={t.id} style={{ cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '7px 8px', fontSize: '11px', color: '#1a73e8', fontWeight: 600, fontFamily: 'monospace' }}>{t.id}</td>
                  <td style={{ padding: '7px 8px', fontSize: '12px', color: '#111827', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.subject}</td>
                  <td style={{ padding: '7px 8px' }}><Badge label={t.status} colors={STAT_COLOR[t.status] || ['#f3f4f6', '#6b7280']} /></td>
                  <td style={{ padding: '7px 8px' }}><Badge label={t.priority} colors={PRI_COLOR[t.priority] || ['#f3f4f6', '#6b7280']} /></td>
                  <td style={{ padding: '7px 8px', fontSize: '10px', color: '#9ca3af' }}>{t.updated.split(',')[0]}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <button onClick={() => navigate('/support')} style={{ marginTop: '14px', width: '100%', padding: '9px', background: '#e8f1ff', color: '#1a73e8', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            <Plus size={14} /> Create New Ticket
          </button>
        </div>

        {/* ── Popular FAQs ── */}
        <div style={card()}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <SectionTitle icon={HelpCircle} text="Popular FAQs" />
            <button onClick={() => navigate('/faq')} style={{ fontSize: '11px', color: '#1a73e8', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>View All FAQs →</button>
          </div>
          <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 12px' }}>Quick answers to the most common questions.</p>
          {FAQS.map((q, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 0', borderBottom: i < FAQS.length - 1 ? '1px solid #f3f4f6' : 'none', cursor: 'pointer' }}>
              <span style={{ fontSize: '12px', color: '#374151', fontWeight: 500 }}>{q}</span>
              <ChevronRight size={14} color="#9ca3af" />
            </div>
          ))}
        </div>
      </div>

      {/* ── Second row: User Guide + System Info + About ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>

        {/* User Guide */}
        <div style={card()}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <SectionTitle icon={BookOpen} text="User Guide" />
            <button style={{ fontSize: '11px', color: '#1a73e8', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>View All Guides →</button>
          </div>
          <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 12px' }}>Step-by-step guides to help you.</p>
          {GUIDES.map((g, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 0', borderBottom: i < GUIDES.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#fff1f1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <BookOpen size={12} color="#dc2626" />
                </div>
                <span style={{ fontSize: '12px', color: '#374151', fontWeight: 500 }}>{g.title}</span>
              </div>
              <span style={{ fontSize: '10px', background: '#fff1f1', color: '#dc2626', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>{g.tag}</span>
            </div>
          ))}
        </div>

        {/* System Information */}
        <div style={card()}>
          <SectionTitle icon={Info} text="System Information" />
          <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 16px' }}>Details about your system and subscription.</p>
          {[
            { label: 'Product Name',    val: 'Franchise Management System' },
            { label: 'Version',         val: 'v2.5.1' },
            { label: 'License Type',    val: 'Enterprise' },
            { label: 'License Validity',val: '31 Dec 2025' },
            { label: 'Registered To',   val: 'FranchiseAll Admin' },
            { label: 'System Status',   val: 'All Systems Operational', green: true },
          ].map(r => (
            <div key={r.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid #f9fafb' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '20px', height: '20px', borderRadius: '4px', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Info size={10} color="#9ca3af" />
                </div>
                <span style={{ fontSize: '12px', color: '#6b7280' }}>{r.label}</span>
              </div>
              {r.green
                ? <span style={{ fontSize: '11px', background: '#e8f8f0', color: '#16a34a', padding: '2px 10px', borderRadius: '20px', fontWeight: 600 }}>{r.val}</span>
                : <span style={{ fontSize: '12px', fontWeight: 600, color: '#111827' }}>{r.val}</span>}
            </div>
          ))}
        </div>

        {/* About */}
        <div style={card()}>
          <SectionTitle icon={Info} text="About Franchise Management System" />
          <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 16px', lineHeight: 1.6 }}>
            Franchise Management System is an all-in-one solution for managing franchises, subscriptions, billing, and analytics — built for enterprise-scale operations.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
            {[
              { icon: Star,         val: '100+',   label: 'Features'     },
              { icon: CheckCircle,  val: '5000+',  label: 'Happy Users'  },
              { icon: Headphones,   val: '24/7',   label: 'Support'      },
              { icon: AlertCircle,  val: 'Secure', label: 'Data Protection' },
            ].map(s => {
              const Icon = s.icon
              return (
                <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f8fafc', borderRadius: '8px', padding: '10px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#e8f1ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={13} color="#1a73e8" />
                  </div>
                  <div>
                    <p style={{ fontSize: '13px', fontWeight: 700, color: '#111827', margin: 0 }}>{s.val}</p>
                    <p style={{ fontSize: '10px', color: '#9ca3af', margin: 0 }}>{s.label}</p>
                  </div>
                </div>
              )
            })}
          </div>
          <div style={{ paddingTop: '14px', borderTop: '1px solid #f3f4f6', textAlign: 'center' }}>
            <p style={{ fontSize: '11px', color: '#9ca3af', margin: 0 }}>© 2025 FranchiseAll. All Rights Reserved.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
