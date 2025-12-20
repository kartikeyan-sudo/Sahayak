const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

function authMiddleware(requiredRoles = []) {
  return (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: 'Missing Authorization header' });

    const token = authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Invalid Authorization format' });

    // Development convenience: allow a fixed dev token when not in production.
    const isProd = process.env.NODE_ENV === 'production';
    if (!isProd && token === 'dev-local-token') {
      // Grant admin role for dev-local-token so local admin UI can function without a real JWT.
      req.user = { username: 'dev-local-admin', role: 'admin' };
      return next();
    }

    try {
      const payload = jwt.verify(token, JWT_SECRET);
      req.user = payload;
      if (requiredRoles.length && !requiredRoles.includes(payload.role)) {
        return res.status(403).json({ message: 'Insufficient role' });
      }
      next();
    } catch (err) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
  };
}

module.exports = authMiddleware;
