/* eslint-disable prettier/prettier */
/**
 * routes.js — All components LAZY LOADED via React.lazy()
 * Per-route code splitting for faster initial load.
 */
import { lazy } from 'react'

const l = (fn) => lazy(fn)

// Dashboard
const DashboardRouter         = l(() => import('./views/dashboard/DashboardRouter'))

// Franchise Management
const FranchiseManagement     = l(() => import('./views/Features/SchoolManagement/SchoolListing'))
const SchoolDashboard         = l(() => import('./views/Features/SchoolManagement/SchoolDetails/schoolDetails'))
const LeadsListing            = l(() => import('./views/Features/Leads/LeadsListing'))

// Subscription
const SubscriptionListing     = l(() => import('./views/Features/SubscriptionPlan/SubscriptionPlan'))
const AddOnListing            = l(() => import('./views/Features/Add-on-Plans/Add-on-Plans'))
const FreeTrialPackages       = l(() => import('./views/Features/FreeTrialPackages/FreeTrialPackages'))
const SubscriptionHistory     = l(() => import('./views/Features/SubscriptionHistory/SubscriptionHistory'))

// Payments
const Payments                = l(() => import('./views/Features/Payments/Payments'))

// Users & Roles
const UsersRoles              = l(() => import('./views/Features/UsersRoles/UsersRoles'))

// Reports
const BillingReport           = l(() => import('./views/Features/Reports/BillingReport'))
const SchoolBillingReport     = l(() => import('./views/Features/Reports/SchoolBillingReport'))
const OverdueReport           = l(() => import('./views/Features/Reports/OverdueReport'))
const PlanDistributionReport  = l(() => import('./views/Features/Reports/PlanDistributionReport'))

// Support / Help
const SupportTickets          = l(() => import('./views/Features/SupportTickets/SupportTickets'))
const HelpCenter              = l(() => import('./views/Features/SupportTickets/HelpCenter'))

// SaaS Management
const SaasManagement          = l(() => import('./views/Features/SaasManagement/SaasManagement'))

// System
const SystemSettings          = l(() => import('./views/Features/SystemSettings/SystemSettings'))
const ActivityLogs            = l(() => import('./views/Features/ActivityLogs/ActivityLogs'))

// Other
const FAQListing              = l(() => import('./views/Features/FAQ/FAQListing'))
const ContactInquiries        = l(() => import('./views/Features/ContactInquiries/ContactInquiries'))
const NewsletterSubscribers   = l(() => import('./views/Features/Newsletter/NewsletterSubscribers'))
const Profile                 = l(() => import('./views/Features/Profile/Profile'))

const routes = [
  // Dashboard
  { path: '/dashboard',                          element: DashboardRouter,          roles: ['SuperAdmin', 'Admin'] },

  // Franchise Management
  { path: '/franchise-management',               element: FranchiseManagement,      roles: ['SuperAdmin', 'Admin'] },
  { path: '/franchise-management/listing',       element: FranchiseManagement,      roles: ['SuperAdmin', 'Admin'] },
  { path: '/franchise-management/details/:id',   element: SchoolDashboard,          roles: ['SuperAdmin', 'Admin'] },
  { path: '/leads',                              element: LeadsListing,             roles: ['SuperAdmin', 'Admin'] },

  // Subscription
  { path: '/subscription-plans',                 element: SubscriptionListing,      roles: ['SuperAdmin', 'Admin'] },
  { path: '/addon-plans',                        element: AddOnListing,             roles: ['SuperAdmin', 'Admin'] },
  { path: '/free-trial-packages',                element: FreeTrialPackages,        roles: ['SuperAdmin', 'Admin'] },
  { path: '/subscription-history',               element: SubscriptionHistory,      roles: ['SuperAdmin', 'Admin'] },

  // Payments & Invoices
  { path: '/payments',                           element: Payments,                 roles: ['SuperAdmin', 'Admin'] },

  // Users & Roles
  { path: '/users',                              element: UsersRoles,               roles: ['SuperAdmin', 'Admin'] },

  // Reports
  { path: '/reports/billing',                    element: BillingReport,            roles: ['SuperAdmin', 'Admin'] },
  { path: '/reports/school',                     element: SchoolBillingReport,      roles: ['SuperAdmin', 'Admin'] },
  { path: '/reports/overdue',                    element: OverdueReport,            roles: ['SuperAdmin', 'Admin'] },
  { path: '/reports/plan-distribution',          element: PlanDistributionReport,   roles: ['SuperAdmin', 'Admin'] },

  // Support
  { path: '/support',                            element: SupportTickets,           roles: ['SuperAdmin', 'Admin'] },
  { path: '/help-center',                        element: HelpCenter,               roles: ['SuperAdmin', 'Admin'] },

  // SaaS Management
  { path: '/saas',                               element: SaasManagement,           roles: ['SuperAdmin', 'Admin'] },

  // System
  { path: '/settings',                           element: SystemSettings,           roles: ['SuperAdmin', 'Admin'] },
  { path: '/activity-logs',                      element: ActivityLogs,             roles: ['SuperAdmin', 'Admin'] },

  // Other
  { path: '/faq',                                element: FAQListing,               roles: ['SuperAdmin', 'Admin'] },
  { path: '/contact-inquiries',                  element: ContactInquiries,         roles: ['SuperAdmin', 'Admin'] },
  { path: '/newsletter',                         element: NewsletterSubscribers,    roles: ['SuperAdmin', 'Admin'] },
  { path: '/profile',                            element: Profile,                  roles: ['SuperAdmin', 'Admin'] },
]

export default routes
