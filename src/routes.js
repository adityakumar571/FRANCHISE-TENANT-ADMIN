import React from 'react'

// Dashboard
import DashboardRouter        from './views/dashboard/DashboardRouter'

// Franchise Management
import FranchiseManagement    from './views/Features/SchoolManagement/SchoolListing'
import SchoolDashboard        from './views/Features/SchoolManagement/SchoolDetails/schoolDetails'
import LeadsListing           from './views/Features/Leads/LeadsListing'


// Subscription
import SubscriptionListing    from './views/Features/SubscriptionPlan/SubscriptionPlan'
import AddOnListing           from './views/Features/Add-on-Plans/Add-on-Plans'
import FreeTrialPackages      from './views/Features/FreeTrialPackages/FreeTrialPackages'
import SubscriptionHistory    from './views/Features/SubscriptionHistory/SubscriptionHistory'

// Payments
import Payments               from './views/Features/Payments/Payments'

// Users & Roles
import UsersRoles             from './views/Features/UsersRoles/UsersRoles'

// Reports
import BillingReport          from './views/Features/Reports/BillingReport'
import SchoolBillingReport    from './views/Features/Reports/SchoolBillingReport'
import OverdueReport          from './views/Features/Reports/OverdueReport'
import SessionBillingReport   from './views/Features/Reports/SessionBillingReport'
import CollectionSummaryReport from './views/Features/Reports/CollectionSummaryReport'
import PlanDistributionReport from './views/Features/Reports/PlanDistributionReport'

// Support
import SupportTickets         from './views/Features/SupportTickets/SupportTickets'

// System
import SystemSettings         from './views/Features/SystemSettings/SystemSettings'
import ActivityLogs           from './views/Features/ActivityLogs/ActivityLogs'

// Other
import FAQListing             from './views/Features/FAQ/FAQListing'
import ContactInquiries       from './views/Features/ContactInquiries/ContactInquiries'
import NewsletterSubscribers  from './views/Features/Newsletter/NewsletterSubscribers'
import Profile                from './views/Features/Profile/Profile'

const routes = [
  // Dashboard
  { path: '/dashboard',                    element: DashboardRouter,          roles: ['SuperAdmin', 'Admin'] },

  // Franchise Management
  { path: '/franchise-management',              element: FranchiseManagement,      roles: ['SuperAdmin', 'Admin'] },
  { path: '/franchise-management/listing',      element: FranchiseManagement,      roles: ['SuperAdmin', 'Admin'] },
  { path: '/franchise-management/details/:id',  element: SchoolDashboard,          roles: ['SuperAdmin', 'Admin'] },
  { path: '/leads',                             element: LeadsListing,             roles: ['SuperAdmin', 'Admin'] },

  // Subscription
  { path: '/subscription-plans',           element: SubscriptionListing,      roles: ['SuperAdmin', 'Admin'] },
  { path: '/addon-plans',                  element: AddOnListing,             roles: ['SuperAdmin', 'Admin'] },
  { path: '/free-trial-packages',          element: FreeTrialPackages,        roles: ['SuperAdmin', 'Admin'] },
  { path: '/subscription-history',         element: SubscriptionHistory,      roles: ['SuperAdmin', 'Admin'] },

  // Payments & Invoices
  { path: '/payments',                     element: Payments,                 roles: ['SuperAdmin', 'Admin'] },

  // Users & Roles
  { path: '/users',                        element: UsersRoles,               roles: ['SuperAdmin', 'Admin'] },

  // Reports
  { path: '/reports/billing',              element: BillingReport,            roles: ['SuperAdmin', 'Admin'] },
  { path: '/reports/school',               element: SchoolBillingReport,      roles: ['SuperAdmin', 'Admin'] },
  { path: '/reports/overdue',              element: OverdueReport,            roles: ['SuperAdmin', 'Admin'] },
  { path: '/reports/session-billing',      element: SessionBillingReport,     roles: ['SuperAdmin', 'Admin'] },
  { path: '/reports/collection-summary',   element: CollectionSummaryReport,  roles: ['SuperAdmin', 'Admin'] },
  { path: '/reports/plan-distribution',    element: PlanDistributionReport,   roles: ['SuperAdmin', 'Admin'] },

  // Support
  { path: '/support',                      element: SupportTickets,           roles: ['SuperAdmin', 'Admin'] },

  // System
  { path: '/settings',                     element: SystemSettings,           roles: ['SuperAdmin', 'Admin'] },
  { path: '/activity-logs',               element: ActivityLogs,             roles: ['SuperAdmin', 'Admin'] },

  // Other
  { path: '/faq',                          element: FAQListing,               roles: ['SuperAdmin', 'Admin'] },
  { path: '/contact-inquiries',            element: ContactInquiries,         roles: ['SuperAdmin', 'Admin'] },
  { path: '/newsletter',                   element: NewsletterSubscribers,    roles: ['SuperAdmin', 'Admin'] },
  { path: '/profile',                      element: Profile,                  roles: ['SuperAdmin', 'Admin'] },
]

export default routes
