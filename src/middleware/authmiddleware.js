const jwt = require('jsonwebtoken');
const { publicKey } = require('../config/keys');
const pool = require('../config/db');

exports.verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];

    // Step 1: Verify JWT signature
    const decoded = jwt.verify(token, publicKey, { algorithms: ['RS256'] });

    // Step 2: Check license in database
    const [rows] = await pool.promise().query(
      'SELECT * FROM licenses WHERE id = ?',
      [decoded.license_id]
    );

    if (rows.length === 0) {
      return res.status(403).json({ message: 'License not found' });
    }

    const license = rows[0];

    // Step 3: Check status
    if (license.status !== 'active') {
      return res.status(403).json({ message: 'License revoked' });
    }

    // Step 4: Check expiry again (real-time enforcement)
    if (new Date(license.expiry_date) < new Date()) {
      return res.status(403).json({ message: 'License expired' });
    }

    req.license = decoded;

    next();

  } catch (error) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};