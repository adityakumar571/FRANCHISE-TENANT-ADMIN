/* eslint-disable prettier/prettier */
/* eslint-disable react/react-in-jsx-scope */
import { useContext } from 'react'
import { CNavGroup, CNavItem } from '@coreui/react'
import {
  DashboardOutlined,
  CustomerServiceOutlined,
} from '@ant-design/icons'
import { MdOutlineDashboard } from 'react-icons/md'
import { AppContext } from './Context/AppContext'
import {
  FileText,
  School,
  UserPlus,
  BarChart2,
  HelpCircle,
  MessageSquare,
  Bell,
  Gift,
} from 'lucide-react'

const iconStyle = { fontSize: '20px' }
const yellow = 'text-[#fabf22]'

const useNav = () => {
  const { user } = useContext(AppContext)
  const role = user?.role

  /* ================= SUPER ADMIN NAV ================= */
  const superAdminNav = [
    {
      component: CNavItem,
      name: 'Admin Dashboard',
      to: '/dashboard',
      icon: <MdOutlineDashboard className={`me-3 ${yellow}`} style={iconStyle} />,
    },
    {
      component: CNavItem,
      name: 'School Management',
      to: '/school-management/listing',
      icon: <School className={`me-3 ${yellow}`} style={iconStyle} />,
    },
    {
      component: CNavItem,
      name: 'Leads & Registrations',
      to: '/leads',
      icon: <UserPlus className={`me-3 ${yellow}`} style={iconStyle} />,
    },
    {
      component: CNavItem,
      name: 'Subscription Plans',
      to: '/subscription-plans',
      icon: <MdOutlineDashboard className={`me-3 ${yellow}`} style={iconStyle} />,
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
      icon: <MdOutlineDashboard className={`me-3 ${yellow}`} style={iconStyle} />,
    },
    {
      component: CNavGroup,
      name: 'Reports',
      icon: <BarChart2 className={`me-3 ${yellow}`} style={iconStyle} />,
      items: [
        { component: CNavItem, name: 'Billing Report',        to: '/reports/billing'             },
        { component: CNavItem, name: 'School-wise Report',    to: '/reports/school'              },
        { component: CNavItem, name: 'Overdue Payments',      to: '/reports/overdue'             },
        { component: CNavItem, name: 'Session Billing',       to: '/reports/session-billing'     },
        { component: CNavItem, name: 'Collection Summary',    to: '/reports/collection-summary'  },
        { component: CNavItem, name: 'Plan Distribution',     to: '/reports/plan-distribution'   },
      ],
    },
    {
      component: CNavItem,
      name: 'Help & Support',
      to: '/support',
      icon: <CustomerServiceOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
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
  ]

  /* ================= ADMIN NAV ================= */
  const adminNav = [
    {
      component: CNavItem,
      name: 'Admin Dashboard',
      to: '/dashboard',
      icon: <DashboardOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
    },
    {
      component: CNavItem,
      name: 'School Management',
      to: '/school-management/listing',
      icon: <School className={`me-3 ${yellow}`} style={iconStyle} />,
    },
    {
      component: CNavItem,
      name: 'Leads & Registrations',
      to: '/leads',
      icon: <UserPlus className={`me-3 ${yellow}`} style={iconStyle} />,
    },
    {
      component: CNavItem,
      name: 'Subscription Plans',
      to: '/subscription-plans',
      icon: <MdOutlineDashboard className={`me-3 ${yellow}`} style={iconStyle} />,
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
      icon: <MdOutlineDashboard className={`me-3 ${yellow}`} style={iconStyle} />,
    },
    {
      component: CNavGroup,
      name: 'Reports',
      icon: <BarChart2 className={`me-3 ${yellow}`} style={iconStyle} />,
      items: [
        { component: CNavItem, name: 'Billing Report',        to: '/reports/billing'             },
        { component: CNavItem, name: 'School-wise Report',    to: '/reports/school'              },
        { component: CNavItem, name: 'Overdue Payments',      to: '/reports/overdue'             },
        { component: CNavItem, name: 'Session Billing',       to: '/reports/session-billing'     },
        { component: CNavItem, name: 'Collection Summary',    to: '/reports/collection-summary'  },
        { component: CNavItem, name: 'Plan Distribution',     to: '/reports/plan-distribution'   },
      ],
    },
    {
      component: CNavItem,
      name: 'Help & Support',
      to: '/support',
      icon: <CustomerServiceOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
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
      component: CNavGroup,
      name: 'Certificates',
      icon: <FileText className={`me-3 ${yellow}`} style={iconStyle} />,
      items: [
        { component: CNavItem, name: 'Transfer Certificate',  to: '/certificates/transfer'  },
        { component: CNavItem, name: 'Character Certificate', to: '/certificates/character' },
      ],
    },
  ]

  /* ================= ROLE SWITCH ================= */
  if (!role) return []
  if (role === 'SuperAdmin') return superAdminNav
  if (role === 'Admin') return adminNav

  return []
}

export default useNav
