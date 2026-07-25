const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`,
      });
    }

    next();
  };
};

const hasPermission = (req, res, next) => {
  // This is a simplified permission check
  // In production, you'd want a more robust permission system
  const permissions = {
    owner: ['*'],
    manager: ['*'],
    cashier: ['orders', 'menu', 'tables', 'expenses'],
    chef: ['orders', 'recipes', 'ingredients'],
    waiter: ['orders', 'tables', 'menu'],
    store_manager: ['products', 'categories', 'warehouses', 'stock', 'suppliers'],
  };

  const userRole = req.user.role;
  const resource = req.params.resource || req.path.split('/')[1];
  
  if (userRole === 'owner') {
    return next();
  }

  const allowedResources = permissions[userRole] || [];
  if (allowedResources.includes('*') || allowedResources.includes(resource)) {
    return next();
  }

  return res.status(403).json({
    success: false,
    message: 'You do not have permission to access this resource',
  });
};

module.exports = { authorize, hasPermission };