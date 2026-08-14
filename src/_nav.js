/* eslint-disable prettier/prettier */
/* eslint-disable react/react-in-jsx-scope */
import { useContext } from 'react'
import { CNavGroup, CNavItem } from '@coreui/react'
import {
  LayoutDashboard, Store, CreditCard, Receipt,
  Users, LifeBuoy, HelpCircle, MessageSquare,
  Bell, Gift, BarChart2, TrendingUp,
  AlertCircle, FileText,
} from 'lucide-react'
import { AppContext } from './Context/AppContext'

const iconStyle = { fontSize: '18px' }
const yellow = 'text-[#fabf22]'

const useNav = () => {
  const { user } = useContext(AppContext)
  const role = user?.role

  const franchiseNav = [
    {
      component: CNavItem,
      name: 'Dashboard',
      to: '/dashboard',
      icon: <LayoutDashboard className={`me-3 ${yellow}`} style={iconStyle} />,
    },
    {
      component: CNavGroup,
      name: 'Franchise Management',
      icon: <Store className={`me-3 ${yellow}`} style={iconStyle} />,
      items: [
        { component: CNavItem, name: 'All Franchises',    to: '/school-management/listing' },
        { component: CNavItem, name: 'Leads & Requests',  to: '/leads'                     },
      ],
    },
    {
      component: CNavItem,
      name: 'Subscription Plans',
      to: '/subscription-plans',
      icon: <CreditCard className={`me-3 ${yellow}`} style={iconStyle} />,
    },
    {
      component: CNavItem,
      name: 'Free Trial Packages',
      to: '/free-trial-packages',
      icon: <Gift className={`me-3 ${yellow}`} style={iconStyle} />,
    },
    {
      component: CNavItem,
      name: 'Subscription History',
      to: '/subscription-history',
      icon: <Receipt className={`me-3 ${yellow}`} style={iconStyle} />,
    },
    {
      component: CNavGroup,
      name: 'Payments & Invoices',
      icon: <FileText className={`me-3 ${yellow}`} style={iconStyle} />,
      items: [
        { component: CNavItem, name: 'Billing Report',         to: '/reports/billing'            },
        { component: CNavItem, name: 'Franchise-wise Report',  to: '/reports/school'             },
        { component: CNavItem, name: 'Overdue Payments',       to: '/reports/overdue'            },
        { component: CNavItem, name: 'Session Billing',        to: '/reports/session-billing'    },
        { component: CNavItem, name: 'Collection Summary',     to: '/reports/collection-summary' },
        { component: CNavItem, name: 'Plan Distribution',      to: '/reports/plan-distribution'  },
      ],
    },
    {
      component: CNavItem,
      name: 'Users & Roles',
      to: '/users',
      icon: <Users className={`me-3 ${yellow}`} style={iconStyle} />,
    },
    {
      component: CNavGroup,
      name: 'Reports',
      icon: <BarChart2 className={`me-3 ${yellow}`} style={iconStyle} />,
      items: [
        { component: CNavItem, name: 'Reports',       to: '/reports/billing' },
        { component: CNavItem, name: 'Activity Logs', to: '/activity-logs'   },
      ],
    },
    {
      component: CNavItem,
      name: 'Support Tickets',
      to: '/support',
      icon: <LifeBuoy className={`me-3 ${yellow}`} style={iconStyle} />,
    },
    {
      component: CNavItem,
      name: 'FAQ',
      to: '/faq',
      icon: <HelpCircle className={`me-3 ${yellow}`} style={iconStyle} />,
    },
    {
      component: CNavItem,
      name: 'Contact Inquiries',
      to: '/contact-inquiries',
      icon: <MessageSquare className={`me-3 ${yellow}`} style={iconStyle} />,
    },
    {
      component: CNavItem,
      name: 'Newsletter',
      to: '/newsletter',
      icon: <Bell className={`me-3 ${yellow}`} style={iconStyle} />,
    },
    {
      component: CNavItem,
      name: 'System Settings',
      to: '/settings',
      icon: <AlertCircle className={`me-3 ${yellow}`} style={iconStyle} />,
    },
  ]

  if (!role) return []
  // Both SuperAdmin and Admin see same nav
  return franchiseNav
}

export default useNav
