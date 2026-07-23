export const ROLES = {
  EMPLOYEE: 'EMPLOYEE',
  MANAGER: 'MANAGER',
  FINANCE: 'FINANCE',
  ADMIN: 'ADMIN',
};

export const NAV_ITEMS = [
  {
    label: 'Employee Dashboard',
    path: '/employee',
    roles: [ROLES.EMPLOYEE],
  },
  {
    label: 'Manager Dashboard',
    path: '/manager',
    roles: [ROLES.MANAGER],
  },
  {
    label: 'Finance Dashboard',
    path: '/finance',
    roles: [ROLES.FINANCE],
  },
  {
    label: 'Admin Dashboard',
    path: '/admin',
    roles: [ROLES.ADMIN],
  },
];

/**
 * Returns navigation links permitted for a given user role.
 * @param {string} role
 * @returns {Array} List of allowed navigation items.
 */
export function getNavForRole(role) {
  if (!role) return [];
  return NAV_ITEMS.filter((item) => item.roles.includes(role));
}

/**
 * Returns allowed roles list for a specific path.
 * @param {string} path
 * @returns {Array} List of roles allowed for that path.
 */
export function getAllowedRolesForPath(path) {
  const item = NAV_ITEMS.find((item) => item.path === path);
  return item ? item.roles : [];
}
