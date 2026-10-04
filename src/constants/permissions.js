import { ROLES } from './roles'

export const ROUTE_PERMISSION = {
  '/dashboard/admin': [ROLES.SUPERADMIN],
  '/dashboard/teachers': [ROLES.SUPERADMIN, ROLES.ADMIN],
  '/dashboard/staff': [ROLES.SUPERADMIN, ROLES.ADMIN, ROLES.TEACHER, ROLES.STAFF],
  '/dashboard/parents': [ROLES.SUPERADMIN, ROLES.ADMIN],

  '/fee/feesstructure': [ROLES.SUPERADMIN, ROLES.ADMIN],
  '/fee/feescollection': [ROLES.SUPERADMIN, ROLES.ADMIN],
  '/fee/feesreport': [ROLES.SUPERADMIN, ROLES.ADMIN],

  '/admission': [ROLES.SUPERADMIN, ROLES.ADMIN],
  '/enrollment': [ROLES.SUPERADMIN, ROLES.ADMIN],
  '/staffmanagement': [ROLES.SUPERADMIN, ROLES.ADMIN],

  '/attendance': [ROLES.SUPERADMIN, ROLES.ADMIN, ROLES.TEACHER],
  '/reports': [ROLES.SUPERADMIN, ROLES.ADMIN, ROLES.TEACHER, ROLES.STAFF],
}
