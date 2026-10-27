const jwt = require("jsonwebtoken");

/**
 * Authentication Middleware
 * Validates JWT token from the Authorization header (Bearer <token>).
 * Attaches the decoded user payload to `req.user`.
 */
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"] || req.headers["Authorization"];

  if (!authHeader) {
    return res.status(401).json({
      success: false,
      message: "Access Denied: No authentication token provided.",
      code: "NO_TOKEN",
    });
  }

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0].toLowerCase() !== "bearer") {
    return res.status(401).json({
      success: false,
      message: "Access Denied: Malformed authorization header. Format must be 'Bearer <token>'.",
      code: "MALFORMED_HEADER",
    });
  }

  const token = parts[1];
  const secretKey = process.env.JWT_SECRET;

  if (!secretKey) {
    console.error("FATAL: JWT_SECRET environment variable is not defined!");
    return res.status(500).json({
      success: false,
      message: "Internal Server Configuration Error.",
    });
  }

  jwt.verify(token, secretKey, (err, decodedUser) => {
    if (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({
          success: false,
          message: "Session expired. Please log in again.",
          code: "TOKEN_EXPIRED",
        });
      }
      return res.status(401).json({
        success: false,
        message: "Invalid or corrupted authentication token.",
        code: "INVALID_TOKEN",
      });
    }

    req.user = decodedUser;
    next();
  });
}

/**
 * Role-Based Access Control Helper (Optional)
 * Allows restricting specific routes to specific roles (e.g. 'ADMIN', 'TEACHER')
 */
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({
        success: false,
        message: "Access Denied: User role not identified.",
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access Denied: Requires one of [${allowedRoles.join(", ")}] roles.`,
      });
    }

    next();
  };
}

module.exports = {
  authenticateToken,
  requireRole,
};
