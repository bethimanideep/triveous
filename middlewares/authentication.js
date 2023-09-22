const jwt = require('jsonwebtoken');
require('dotenv').config()
// Middleware function for token verification
function verifyToken(req, res, next) {
  // Get the token from the request headers, query parameters, or wherever you store it
  const token = req.headers.authorization; // Assuming it's in the "Authorization" header

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  // Verify the token
  jwt.verify(token, process.env.secret, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Invalid token or Expired' });
    }

    // Token is valid; you can access the decoded information in subsequent middleware
    req.user = decoded; // Assuming the token contains user information
    // Proceed to the next middleware
    next();
  });
}

module.exports = verifyToken;
