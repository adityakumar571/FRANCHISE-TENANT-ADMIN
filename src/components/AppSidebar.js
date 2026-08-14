import React, { useContext } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { NavLink, useLocation } from 'react-router-dom'
import {
  CSidebar,
  CSidebarBrand,
  CSidebarHeader,
} from '@coreui/react'
import {
  LayoutDashboard,
  Store,
  CreditCard,
  FileText,
  Users,
  LifeBuoy,
  HelpCircle,
  MessageSquare,
  Bell,
  Gift,
  ChevronDown,
  ChevronRight,
  BarChart2,
  Receipt,
  TrendingUp,
  AlertCircle,
  CalendarDays,
  PieChart,
} from 'lucide-react'
import { AppContext } from '../Context/AppContext'

import logo from '../assets/auctech-logo.png'

/* ── nav config ─────────────────────────────────────────────────────────── */
const NAV_ITEMS = [
  {
    section: 'MANAGEMENT',
    items: [
      { label: 'Dashboard',           to: '/dashboard',                      icon: LayoutDashboard },
      {
        label: 'Franchise Management', icon: Store, children: [
          { label: 'All Franchises',   to: '/school-management/listing' },
          { label: 'Leads & Requests', to: '/leads' },
        ],
      },
      { label: 'Subscription Plans',  to: '/subscription-plans',             icon: CreditCard },
      { label: 'Free Trial Packages', to: '/free-trial-packages',            icon: Gift },
      { label: 'Subscription History',to: '/subscription-history',           icon: Receipt },
      {
        label: 'Payments & Invoices',  icon: FileText, children: [
          { label: 'Billing Report',       to: '/reports/billing' },
          { label: 'Franchise-wise Report',to: '/reports/school' },
          { label: 'Overdue Payments',     to: '/reports/overdue' },
          { label: 'Session Billing',      to: '/reports/session-billing' },
          { label: 'Collection Summary',   to: '/reports/collection-summary' },
          { label: 'Plan Distribution',    to: '/reports/plan-distribution' },
        ],
      },
      { label: 'Users & Roles',       to: '/users',                          icon: Users },
    ],
  },
  {
    section: 'REPORTS',
    items: [
      { label: 'Reports',       to: '/reports/billing',  icon: BarChart2 },
      { label: 'Activity Logs', to: '/activity-logs',    icon: TrendingUp },
    ],
  },
  {
    section: 'SYSTEM',
    items: [
      { label: 'Support Tickets',     to: '/support',           icon: LifeBuoy },
      { label: 'FAQ',                 to: '/faq',               icon: HelpCircle },
      { label: 'Contact Inquiries',   to: '/contact-inquiries', icon: MessageSquare },
      { label: 'Newsletter',          to: '/newsletter',        icon: Bell },
      { label: 'System Settings',     to: '/settings',          icon: AlertCircle },
    ],
  },
]

/* ── single nav link ──────────────────────────────────────────────────────── */
function NavItem({ icon: Icon, label, to, depth = 0 }) {
  const location = useLocation()
  const active = location.pathname === to || location.pathname.startsWith(to + '/')
  return (
    <NavLink
      to={to}
      className="flex items-center gap-2.5 px-3 py-2 rounded-lg mx-2 text-[13px] font-medium transition-all duration-150 no-underline"
      style={{
        paddingLeft: depth === 1 ? '2.5rem' : undefined,
        backgroundColor: active ? 'rgba(250,191,34,0.15)' : 'transparent',
        color: active ? '#fabf22' : 'rgba(255,255,255,0.72)',
      }}
    >
      {Icon && <Icon size={16} style={{ flexShrink: 0 }} />}
      <span className="truncate">{label}</span>
      {active && <span className="ms-auto w-1.5 h-1.5 rounded-full bg-[#fabf22] flex-shrink-0" />}
    </NavLink>
  )
}

/* ── collapsible group ───────────────────────────────────────────────────── */
function NavGroup({ icon: Icon, label, children }) {
  const location = useLocation()
  const isAnyChildActive = children.some(
    (c) => location.pathname === c.to || location.pathname.startsWith(c.to + '/')
  )
  const [open, setOpen] = React.useState(isAnyChildActive)

  return (
    <div>
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg mx-2 text-[13px] font-medium transition-all duration-150 border-0 outline-none"
        style={{
          width: 'calc(100% - 1rem)',
          backgroundColor: isAnyChildActive ? 'rgba(250,191,34,0.12)' : 'transparent',
          color: isAnyChildActive ? '#fabf22' : 'rgba(255,255,255,0.72)',
          cursor: 'pointer',
        }}
      >
        {Icon && <Icon size={16} style={{ flexShrink: 0 }} />}
        <span className="flex-1 text-left truncate">{label}</span>
        {open ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
      </button>
      {open && (
        <div className="mt-0.5 mb-1">
          {children.map((c) => (
            <NavItem key={c.to} label={c.label} to={c.to} depth={1} />
          ))}
        </div>
      )}
    </div>
  )
}

/* ── main sidebar ─────────────────────────────────────────────────────────── */
const AppSidebar = () => {
  const dispatch = useDispatch()
  const sidebarShow = useSelector((state) => state.sidebarShow)

  return (
    <CSidebar
      position="fixed"
      visible={sidebarShow}
      style={{
        zIndex: 3,
        backgroundColor: '#0f1f3d',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        overflowY: 'auto',
      }}
    >
      {/* Brand */}
      <CSidebarHeader style={{ backgroundColor: '#0f1f3d', borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '1rem' }}>
        <CSidebarBrand to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <img src={logo} alt="logo" style={{ width: '38px', height: '38px', borderRadius: '8px', objectFit: 'contain' }} />
          <div>
            <p style={{ color: '#fff', fontWeight: 700, fontSize: '14px', margin: 0, lineHeight: 1.2 }}>FranchizeAll</p>
            <p style={{ color: '#fabf22', fontSize: '10px', margin: 0, fontWeight: 500 }}>Super Admin</p>
          </div>
        </CSidebarBrand>
      </CSidebarHeader>

      {/* Nav */}
      <div style={{ padding: '0.75rem 0', overflowY: 'auto', flex: 1 }}>
        {NAV_ITEMS.map((section) => (
          <div key={section.section} className="mb-3">
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', padding: '0 1rem', marginBottom: '0.4rem', marginTop: '0.75rem' }}>
              {section.section}
            </p>
            {section.items.map((item) =>
              item.children ? (
                <NavGroup key={item.label} icon={item.icon} label={item.label}>
                  {item.children}
                </NavGroup>
              ) : (
                <NavItem key={item.to} icon={item.icon} label={item.label} to={item.to} />
              )
            )}
          </div>
        ))}
      </div>

      {/* Collapse toggle */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '0.75rem 1rem' }}>
        <button
          onClick={() => dispatch({ type: 'set', sidebarShow: !sidebarShow })}
          style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <ChevronRight size={14} /> Collapse
        </button>
      </div>
    </CSidebar>
  )
}

export default React.memo(AppSidebar)
