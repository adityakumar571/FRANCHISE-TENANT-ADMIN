/* eslint-disable prettier/prettier */
import { useState, useEffect } from 'react'
import {
  Headphones, Ticket, HelpCircle, BookOpen, Info,
  Phone, Mail, MessageSquare, ChevronRight, Plus,
  CheckCircle, Clock, AlertCircle, XCircle,
  Star, Download, ChevronDown, ChevronUp, RefreshCw,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { getRequest } from '../../../Helpers'

/* ─── static guides ─────────────────────────────────── */
const GUIDES = [
  { title: 'Getting Started Guide',          tag: 'PDF' },
  { title: 'Franchise Management Guide',      tag: 'PDF' },
  { title: 'Subscription & Billing Guide',    tag: 'PDF' },
  { title: 'Reports & Analytics Guide',       tag: 'PDF' },
  { title: 'User Roles & Permissions Guide',  tag: 'PDF' },
]

/* ─── helpers ─────────────────────────────────────── */
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

const card = (extra = {}) => ({
  background: '#fff',
  border: '1px solid #e5e7eb',
  borderRadius: '12px',
  padding: '20px',
  ...extra,
})

/* ════════════════════════════════════════════════════ */
export default function HelpCenter() {
  const navigate = useNavigate()
  const [activeSection, setActiveSection] = useState('support')

  /* ── FAQ state ── */
  const [faqs, setFaqs]               = useState([])
  const [faqCategories, setFaqCategories] = useState([])
  const [faqLoading, setFaqLoading]   = useState(false)
  const [expandedFaq, setExpandedFaq] = useState(null)
  const [activeCat, setActiveCat]     = useState('All')

  const fetchFaqs = (category = 'All') => {
    setFaqLoading(true)
    const params = new URLSearchParams({ isActive: 'true', limit: '50', isPagination: 'false' })
    if (category !== 'All') params.set('category', category)

    getRequest(`faq?${params}`)
      .then((res) => {
        const d = res?.data?.data
        setFaqs(d?.faqs || [])
        if (d?.categories?.length) {
          setFaqCategories(['All', ...d.categories])
        }
      })
      .catch(() => toast.error('Failed to load FAQs'))
      .finally(() => setFaqLoading(false))
  }

  useEffect(() => { fetchFaqs() }, [])

  const handleCatChange = (cat) => {
    setActiveCat(cat)
    setExpandedFaq(null)
    fetchFaqs(cat)
  }

  const SECTIONS = [
    { id: 'support', label: '1. Support',    icon: Headphones, desc: 'Get help from our support team.' },
    { id: 'tickets', label: '2. Tickets',    icon: Ticket,     desc: 'View and manage support tickets.' },
    { id: 'faq',     label: '3. FAQs',       icon: HelpCircle, desc: 'Quick answers to common questions.' },
    { id: 'guide',   label: '4. User Guide', icon: BookOpen,   desc: 'Step-by-step system guides.' },
    { id: 'about',   label: '5. About',      icon: Info,       desc: 'About Franchise Management System.' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '18px' }}>

      {/* ── Header with section tabs ── */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '20px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#111827', margin: 0 }}>Help Center</h1>
            <p style={{ fontSize: '13px', color: '#9ca3af', margin: '4px 0 0' }}>We're here to help. Get support and find answers.</p>
          </div>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>
            {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: '12px', marginTop: '20px' }}>
          {SECTIONS.map(s => {
            const Icon   = s.icon
            const active = activeSection === s.id
            return (
              <button key={s.id} onClick={() => setActiveSection(s.id)}
                style={{ border: `2px solid ${active ? '#1a73e8' : '#e5e7eb'}`, borderRadius: '10px', padding: '16px 12px', background: active ? '#e8f1ff' : '#fff', cursor: 'pointer', textAlign: 'center', transition: 'all .15s' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: active ? '#1a73e8' : '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px' }}>
                  <Icon size={18} color={active ? '#fff' : '#6b7280'} />
                </div>
                <p style={{ fontSize: '12px', fontWeight: 700, color: active ? '#1a73e8' : '#374151', margin: '0 0 4px' }}>{s.label}</p>
                <p style={{ fontSize: '10px', color: '#9ca3af', margin: 0, lineHeight: 1.4 }}>{s.desc}</p>
              </button>
            )
          })}
        </div>
      </div>

      {/* ══════ Support section ══════ */}
      {activeSection === 'support' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
          <div style={card()}>
            <SectionTitle icon={Headphones} text="Contact Support" />
            <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 16px' }}>Our support team is available to help you.</p>
            {[
              { icon: Mail,          label: 'Email Support',    val: 'support@franchiseall.com', tag: '24/7',    color: '#1a73e8', bg: '#e8f1ff' },
              { icon: Phone,         label: 'Phone Support',    val: '+91 9876543210',            tag: '9AM–7PM', color: '#16a34a', bg: '#e8f8f0' },
              { icon: MessageSquare, label: 'WhatsApp Support', val: '+91 9876543210',            tag: '9AM–7PM', color: '#16a34a', bg: '#e8f8f0' },
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

          {/* System info */}
          <div style={card()}>
            <SectionTitle icon={Info} text="System Information" />
            {[
              { label: 'Product Name',  val: 'Franchise Management System' },
              { label: 'Version',       val: 'v2.5.1' },
              { label: 'License Type',  val: 'Enterprise SaaS' },
              { label: 'System Status', val: 'All Systems Operational', green: true },
            ].map(r => (
              <div key={r.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f9fafb' }}>
                <span style={{ fontSize: '12px', color: '#6b7280' }}>{r.label}</span>
                {r.green
                  ? <span style={{ fontSize: '11px', background: '#e8f8f0', color: '#16a34a', padding: '2px 10px', borderRadius: '20px', fontWeight: 600 }}>{r.val}</span>
                  : <span style={{ fontSize: '12px', fontWeight: 600, color: '#111827' }}>{r.val}</span>}
              </div>
            ))}
          </div>

          {/* Quick navigation */}
          <div style={card()}>
            <SectionTitle icon={HelpCircle} text="Quick Navigation" />
            {[
              { label: 'View All FAQs',         path: '/faq',           color: '#1a73e8' },
              { label: 'Support Tickets',        path: '/support',       color: '#7c3aed' },
              { label: 'System Settings',        path: '/settings',      color: '#16a34a' },
              { label: 'Subscription Plans',     path: '/subscription-plans', color: '#d97706' },
              { label: 'Activity Logs',          path: '/activity-logs', color: '#0891b2' },
            ].map(l => (
              <div key={l.label} onClick={() => navigate(l.path)}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f3f4f6', cursor: 'pointer' }}>
                <span style={{ fontSize: '12px', fontWeight: 500, color: '#374151' }}>{l.label}</span>
                <ChevronRight size={14} color={l.color} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══════ Tickets section ══════ */}
      {activeSection === 'tickets' && (
        <div style={card()}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <SectionTitle icon={Ticket} text="Support Tickets" />
            <button onClick={() => navigate('/support')} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#1a73e8', color: '#fff', border: 'none', borderRadius: '8px', padding: '8px 14px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
              <Plus size={13} /> Create Ticket
            </button>
          </div>
          <div style={{ padding: '60px', textAlign: 'center', color: '#9ca3af' }}>
            <Ticket size={40} style={{ marginBottom: '12px', opacity: 0.4 }} />
            <p style={{ fontSize: '14px', fontWeight: 600, color: '#374151', margin: '0 0 8px' }}>Manage Support Tickets</p>
            <p style={{ fontSize: '13px', margin: '0 0 16px' }}>View and manage all your support tickets from the dedicated tickets page.</p>
            <button onClick={() => navigate('/support')} style={{ background: '#1a73e8', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 20px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
              Go to Support Tickets →
            </button>
          </div>
        </div>
      )}

      {/* ══════ FAQ section — REAL DATA ══════ */}
      {activeSection === 'faq' && (
        <div style={card()}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <SectionTitle icon={HelpCircle} text="Frequently Asked Questions" />
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button
                onClick={() => fetchFaqs(activeCat)}
                disabled={faqLoading}
                style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'none', border: '1px solid #e5e7eb', borderRadius: '7px', padding: '6px 12px', fontSize: '12px', color: '#6b7280', cursor: 'pointer', opacity: faqLoading ? 0.6 : 1 }}>
                <RefreshCw size={12} /> Refresh
              </button>
              <button onClick={() => navigate('/faq')} style={{ fontSize: '11px', color: '#1a73e8', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                Manage FAQs →
              </button>
            </div>
          </div>

          {/* Category filter pills */}
          {faqCategories.length > 1 && (
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
              {faqCategories.map(cat => (
                <button key={cat} onClick={() => handleCatChange(cat)}
                  style={{ padding: '5px 12px', borderRadius: '20px', border: `1px solid ${activeCat === cat ? '#1a73e8' : '#e5e7eb'}`, background: activeCat === cat ? '#1a73e8' : '#fff', color: activeCat === cat ? '#fff' : '#374151', fontSize: '12px', fontWeight: 600, cursor: 'pointer', transition: 'all .15s' }}>
                  {cat}
                </button>
              ))}
            </div>
          )}

          {/* FAQ accordion */}
          {faqLoading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#9ca3af', fontSize: '13px' }}>Loading FAQs…</div>
          ) : faqs.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#9ca3af' }}>
              <HelpCircle size={36} style={{ marginBottom: '10px', opacity: 0.4 }} />
              <p style={{ fontSize: '13px', margin: 0 }}>No FAQs found{activeCat !== 'All' ? ` in category "${activeCat}"` : ''}.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {faqs.map((faq) => {
                const open = expandedFaq === faq._id
                return (
                  <div key={faq._id} style={{ border: `1px solid ${open ? '#1a73e8' : '#e5e7eb'}`, borderRadius: '10px', overflow: 'hidden', transition: 'border-color .15s' }}>
                    <button
                      onClick={() => setExpandedFaq(open ? null : faq._id)}
                      style={{ width: '100%', padding: '14px 16px', background: open ? '#e8f1ff' : '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', textAlign: 'left' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                        <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: open ? '#1a73e8' : '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <HelpCircle size={12} color={open ? '#fff' : '#9ca3af'} />
                        </div>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: open ? '#1a73e8' : '#111827' }}>
                          {faq.question}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                        {faq.category && (
                          <span style={{ fontSize: '10px', background: '#f3f4f6', color: '#6b7280', padding: '2px 8px', borderRadius: '20px', fontWeight: 600 }}>
                            {faq.category}
                          </span>
                        )}
                        {open ? <ChevronUp size={15} color="#1a73e8" /> : <ChevronDown size={15} color="#9ca3af" />}
                      </div>
                    </button>
                    {open && (
                      <div style={{ padding: '14px 16px 16px', borderTop: '1px solid #e8f1ff', background: '#f9fbff' }}>
                        <p style={{ fontSize: '13px', color: '#374151', margin: 0, lineHeight: 1.7 }}>
                          {faq.answer}
                        </p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          <p style={{ fontSize: '12px', color: '#9ca3af', margin: '14px 0 0', textAlign: 'center' }}>
            {faqs.length > 0 && `Showing ${faqs.length} FAQ${faqs.length !== 1 ? 's' : ''}${activeCat !== 'All' ? ` in "${activeCat}"` : ''} · `}
            <button onClick={() => navigate('/faq')} style={{ background: 'none', border: 'none', color: '#1a73e8', cursor: 'pointer', fontSize: '12px', fontWeight: 600, padding: 0 }}>
              View & manage all FAQs →
            </button>
          </p>
        </div>
      )}

      {/* ══════ User Guide section ══════ */}
      {activeSection === 'guide' && (
        <div style={card()}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <SectionTitle icon={BookOpen} text="User Guide" />
          </div>
          <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 16px' }}>Step-by-step guides to help you use the system.</p>
          {GUIDES.map((g, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 0', borderBottom: i < GUIDES.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '30px', height: '30px', borderRadius: '7px', background: '#fff1f1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <BookOpen size={13} color="#dc2626" />
                </div>
                <span style={{ fontSize: '13px', color: '#374151', fontWeight: 500 }}>{g.title}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '10px', background: '#fff1f1', color: '#dc2626', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>{g.tag}</span>
                <button style={{ background: '#e8f1ff', border: 'none', borderRadius: '6px', padding: '5px 8px', cursor: 'pointer', color: '#1a73e8', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 600 }}>
                  <Download size={12} /> Download
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ══════ About section ══════ */}
      {activeSection === 'about' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div style={card()}>
            <SectionTitle icon={Info} text="About Franchise Management System" />
            <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 16px', lineHeight: 1.7 }}>
              Franchise Management System is an all-in-one SaaS solution for managing franchises, subscriptions, billing, and analytics — built for enterprise-scale operations.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {[
                { icon: Star,         val: '100+',   label: 'Features' },
                { icon: CheckCircle,  val: '5000+',  label: 'Happy Users' },
                { icon: Headphones,   val: '24/7',   label: 'Support' },
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
          </div>
          <div style={card()}>
            <SectionTitle icon={Info} text="Version & License" />
            {[
              { l: 'Version',      v: 'v2.5.1' },
              { l: 'License Type', v: 'Enterprise SaaS' },
              { l: 'Build Date',   v: 'Sep 2026' },
              { l: 'Framework',    v: 'React + Node.js' },
              { l: 'Database',     v: 'MongoDB' },
            ].map(r => (
              <div key={r.l} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f3f4f6' }}>
                <span style={{ fontSize: '12px', color: '#6b7280' }}>{r.l}</span>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#111827' }}>{r.v}</span>
              </div>
            ))}
            <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid #f3f4f6', textAlign: 'center' }}>
              <p style={{ fontSize: '11px', color: '#9ca3af', margin: 0 }}>© 2026 FranchiseAll. All Rights Reserved.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
