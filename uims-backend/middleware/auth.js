// middleware/auth.js
const jwt = require('jsonwebtoken');

// IMPORTANT: This assumes your server.js uses dotenv and the secret is available.
// If not, you might need to require('dotenv').config() here or pass the secret.
// For simplicity, we assume process.env.JWT_SECRET is set via dotenv in server.js.

const verifyToken = (req, res, next) => {
  // 1. Get the Authorization header from the request
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // 401: No token or incorrect format
    return res.status(401).json({ 
      success: false, 
      message: 'Authentication token required' 
    });
  }

  // Extract the token part: "Bearer [token]" -> "[token]"
  const token = authHeader.split(' ')[1];

  try {
    // 2. Verify the token using your secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key-here"); 
    
    // 3. Attach the decoded user data (e.g., user_id) to the request object
    req.user = decoded; 
    
    // 4. Continue to the next middleware or the route handler
    next(); 
  } catch (err) {
    console.error('JWT verification failed:', err.message);
    // 401: Token is invalid or expired
    return res.status(401).json({ 
      success: false, 
      message: 'Invalid or expired authentication token' 
    });
  }
};

module.exports = verifyToken;