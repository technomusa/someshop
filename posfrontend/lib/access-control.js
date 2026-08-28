/**
 * Access Control Utilities
 * 
 * Centralized role-based access control helpers for the frontend
 * Works with the RBAC system from the backend
 */

/**
 * Check if user can access a specific module/action
 * @param {string} module - Module name (e.g., 'pos', 'inventory', 'reports')
 * @param {Object} user - User object with roles and permissions
 * @param {string} action - Optional action (e.g., 'create', 'edit', 'delete')
 * @returns {boolean}
 */
export function canAccess(module, user, action = 'view') {
  if (!user || !user.roles) {
    return false;
  }

  const roleNames = user.roles.map((r) => r.name || r);
  const isSuperAdmin = roleNames.includes('super_admin');
  const isAdmin = roleNames.includes('admin');
  const isManager = roleNames.includes('manager');
  const isEmployee = roleNames.includes('employee');
  const isCashier = roleNames.includes('cashier');
  const isAuditor = roleNames.includes('auditor');

  // Super admin has access to everything
  if (isSuperAdmin) {
    return true;
  }

  // Permission mapping based on module and action
  const permissionMap = {
    pos: {
      view: ['view_pos'],
      create: ['sell_product'],
      refund: ['process_refund'],
    },
    inventory: {
      view: ['view_inventory'],
      manage: ['manage_inventory'],
      receive: ['receive_stock'],
      adjust: ['adjust_stock'],
      transfer: ['transfer_stock'],
    },
    products: {
      view: ['view_products'],
      create: ['create_products'],
      edit: ['edit_products'],
      delete: ['delete_products'],
    },
    sales: {
      view: ['view_sales'],
      create: ['sell_product'],
      refund: ['process_refund'],
    },
    reports: {
      view: ['view_reports'],
      export: ['export_reports'],
      analytics: ['view_analytics'],
    },
    customers: {
      view: ['view_customers'],
      create: ['create_customers'],
      edit: ['edit_customers'],
      delete: ['delete_customers'],
    },
    users: {
      view: ['view_users'],
      create: ['create_users'],
      edit: ['edit_users'],
      delete: ['delete_users'],
    },
    accounting: {
      view: ['view_accounting'],
      manage: ['manage_accounting'],
      drawer: ['open_drawer', 'close_drawer'],
      expenses: ['view_expenses', 'manage_expenses'],
    },
    settings: {
      view: ['view_settings'],
      manage: ['manage_settings'],
    },
  };

  const modulePermissions = permissionMap[module];
  if (!modulePermissions) {
    return false;
  }

  const requiredPermissions = modulePermissions[action] || modulePermissions.view;
  if (!requiredPermissions) {
    return false;
  }

  // Check if user has any of the required permissions
  const userPermissions = user.permissions || [];
  const userPermissionNames = userPermissions.map((p) => p.name || p);

  return requiredPermissions.some((perm) => userPermissionNames.includes(perm));
}

/**
 * Get user's role level
 * @param {Object} user - User object
 * @returns {string} - 'super_admin', 'admin', 'manager', 'employee', 'cashier', 'auditor'
 */
export function getUserRoleLevel(user) {
  if (!user || !user.roles) {
    return 'employee';
  }

  const roleNames = user.roles.map((r) => r.name || r);

  if (roleNames.includes('super_admin')) {
    return 'super_admin';
  }
  if (roleNames.includes('admin')) {
    return 'admin';
  }
  if (roleNames.includes('manager')) {
    return 'manager';
  }
  if (roleNames.includes('auditor')) {
    return 'auditor';
  }
  if (roleNames.includes('cashier')) {
    return 'cashier';
  }
  return 'employee';
}

/**
 * Check if user is super admin
 */
export function isSuperAdmin(user) {
  return getUserRoleLevel(user) === 'super_admin';
}

/**
 * Check if user is admin
 */
export function isAdmin(user) {
  return getUserRoleLevel(user) === 'admin';
}

/**
 * Check if user is manager
 */
export function isManager(user) {
  return getUserRoleLevel(user) === 'manager';
}

/**
 * Check if user is employee
 */
export function isEmployee(user) {
  return getUserRoleLevel(user) === 'employee';
}

/**
 * Check if user is cashier
 */
export function isCashier(user) {
  return getUserRoleLevel(user) === 'cashier';
}

/**
 * Check if user is auditor
 */
export function isAuditor(user) {
  return getUserRoleLevel(user) === 'auditor';
}

/**
 * Get dashboard variant based on user role and business type
 * @param {Object} user - User object
 * @returns {string} - Dashboard variant name
 */
export function getDashboardVariant(user) {
  const roleLevel = getUserRoleLevel(user);
  const businessType = user?.business?.code || user?.shop?.shop_type || 'default';

  // Map business types to dashboard variants
  const businessDashboards = {
    COLD_STORE: 'cold-store',
    LAPTOP_SHOP: 'laptop-shop',
    ELECTRONICS: 'electronics',
  };

  const dashboardType = businessDashboards[businessType] || 'default';

  return `${roleLevel}-${dashboardType}`;
}

/**
 * Get available menu items based on user role
 * @param {Object} user - User object
 * @returns {Array} - Array of menu items user can access
 */
export function getAvailableMenuItems(user) {
  const menuItems = [
    {
      id: 'pos',
      label: 'POS',
      path: '/pos',
      icon: 'ShoppingCart',
      roles: ['super_admin', 'admin', 'manager', 'employee'],
    },
    {
      id: 'inventory',
      label: 'Inventory',
      path: '/inventory',
      icon: 'Package',
      roles: ['super_admin', 'admin', 'manager'],
      permissions: ['view_inventory'],
    },
    {
      id: 'products',
      label: 'Products',
      path: '/products',
      icon: 'Box',
      roles: ['super_admin', 'admin', 'manager'],
      permissions: ['view_products'],
    },
    {
      id: 'sales',
      label: 'Sales',
      path: '/sales',
      icon: 'Receipt',
      roles: ['super_admin', 'admin', 'manager', 'employee', 'cashier', 'auditor'],
      permissions: ['view_sales'],
    },
    {
      id: 'reports',
      label: 'Reports',
      path: '/reports',
      icon: 'BarChart',
      roles: ['super_admin', 'admin', 'manager', 'auditor'],
      permissions: ['view_reports'],
    },
    {
      id: 'customers',
      label: 'Customers',
      path: '/customers',
      icon: 'Users',
      roles: ['super_admin', 'admin', 'manager', 'employee'],
      permissions: ['view_customers'],
    },
    {
      id: 'users',
      label: 'Users',
      path: '/users',
      icon: 'UserCog',
      roles: ['super_admin', 'admin', 'manager'],
      permissions: ['view_users'],
    },
    {
      id: 'accounting',
      label: 'Accounting',
      path: '/accounting',
      icon: 'DollarSign',
      roles: ['super_admin', 'admin', 'manager'],
      permissions: ['view_accounting'],
    },
    {
      id: 'settings',
      label: 'Settings',
      path: '/settings',
      icon: 'Settings',
      roles: ['super_admin', 'admin'],
      permissions: ['view_settings'],
    },
  ];

  return menuItems.filter((item) => {
    // Check role access
    const roleLevel = getUserRoleLevel(user);
    if (!item.roles.includes(roleLevel)) {
      return false;
    }

    // Check permission access if specified
    if (item.permissions) {
      return item.permissions.some((perm) => canAccess(perm.split('_')[1], user));
    }

    return true;
  });
}

/**
 * Check if route should be accessible
 * @param {string} path - Route path
 * @param {Object} user - User object
 * @returns {boolean}
 */
export function canAccessRoute(path, user) {
  const routeMap = {
    '/pos': () => canAccess('pos', user),
    '/inventory': () => canAccess('inventory', user),
    '/products': () => canAccess('products', user),
    '/sales': () => canAccess('sales', user),
    '/reports': () => canAccess('reports', user),
    '/customers': () => canAccess('customers', user),
    '/users': () => canAccess('users', user),
    '/accounting': () => canAccess('accounting', user),
    '/settings': () => canAccess('settings', user),
  };

  const checkAccess = routeMap[path];
  return checkAccess ? checkAccess() : true; // Default to accessible if not in map
}
