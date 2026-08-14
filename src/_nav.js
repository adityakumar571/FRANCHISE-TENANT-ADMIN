/* eslint-disable prettier/prettier */
/* eslint-disable react/react-in-jsx-scope */
import { useContext } from 'react'
import { CNavGroup, CNavItem } from '@coreui/react'
import {
  LayoutDashboard, Store, CreditCard, Receipt,
  Users, LifeBuoy, HelpCircle, MessageSquare,
  Bell, Gift, BarChart2, TrendingUp,
  Settings, FileText, CreditCard as PayIcon,
  UserCircle, Database,
} from 'lucide-react'
import { AppContext } from './Context/AppContext'

const SZ = { fontSize: '17px' }
const Y  = 'text-[#fabf22]'

const useNav = () => {
  const { user } = useContext(AppContext)
  const role = user?.role
  if (!role) return []

  return [
    {
      component: CNavItem,
      name: 'Dashboard',
      to: '/dashboard',
      icon: <LayoutDashboard className={`me-3 ${Y}`} style={SZ} />,
    },
    {
      component: CNavGroup,
      name: 'Franchise Management',
      icon: <Store className={`me-3 ${Y}`} style={SZ} />,
      items: [
        { component: CNavItem, name: 'All Franchises',   to: '/franchise-management' },
        { component: CNavItem, name: 'Add Franchise',    to: '/franchise-management' },
        { component: CNavItem, name: 'Leads & Requests', to: '/leads' },
      ],
    },
    {
      component: CNavItem,
      name: 'Subscription Plans',
      to: '/subscription-plans',
      icon: <CreditCard className={`me-3 ${Y}`} style={SZ} />,
    },
    {
      component: CNavItem,
      name: 'Payments & Invoices',
      to: '/payments',
      icon: <PayIcon className={`me-3 ${Y}`} style={SZ} />,
    },
    {
      component: CNavItem,
      name: 'Free Trial Packages',
      to: '/free-trial-packages',
      icon: <Gift className={`me-3 ${Y}`} style={SZ} />,
    },
    {
      component: CNavItem,
      name: 'Users & Roles',
      to: '/users',
      icon: <Users className={`me-3 ${Y}`} style={SZ} />,
    },
    {
      component: CNavItem,
      name: 'Clients',
      to: '/leads',
      icon: <UserCircle className={`me-3 ${Y}`} style={SZ} />,
    },
    {
      component: CNavItem,
      name: 'Support Tickets',
      to: '/support',
      icon: <LifeBuoy className={`me-3 ${Y}`} style={SZ} />,
    },
    {
      component: CNavItem,
      name: 'System Modules',
      to: '/settings',
      icon: <Database className={`me-3 ${Y}`} style={SZ} />,
    },
    {
      component: CNavGroup,
      name: 'Reports',
      icon: <BarChart2 className={`me-3 ${Y}`} style={SZ} />,
      items: [
        { component: CNavItem, name: 'Billing Report',          to: '/reports/billing'            },
        { component: CNavItem, name: 'Franchise-wise Report',   to: '/reports/school'             },
        { component: CNavItem, name: 'Overdue Payments',        to: '/reports/overdue'            },
        { component: CNavItem, name: 'Collection Summary',      to: '/reports/collection-summary' },
        { component: CNavItem, name: 'Plan Distribution',       to: '/reports/plan-distribution'  },
      ],
    },
    {
      component: CNavItem,
      name: 'Activity Logs',
      to: '/activity-logs',
      icon: <TrendingUp className={`me-3 ${Y}`} style={SZ} />,
    },
    {
      component: CNavItem,
      name: 'System Settings',
      to: '/settings',
      icon: <Settings className={`me-3 ${Y}`} style={SZ} />,
    },
    {
      component: CNavItem,
      name: 'Backup & Restore',
      to: '/settings',
      icon: <Database className={`me-3 ${Y}`} style={SZ} />,
    },
  ]
}

export default useNav
