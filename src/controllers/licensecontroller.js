const pool = require('../config/db');
const {v4: uuidv4} = require('uuid');
const generateLicenseKey = require('../utils/generateLicense');
const jwt = require('jsonwebtoken');
const { privateKey } = require('../config/keys');

exports.generateLicense =async (req, res) => {
    try {
        //const { v4: uuidv4 } = await import('uuid');
        const id= uuidv4();
        const licenseKey=generateLicenseKey();
      
        //expiry date set to 1 year from now
        const expiryDate = new Date();
        expiryDate.setFullYear(expiryDate.getFullYear() + 1);

        const query = 'INSERT INTO licenses (id, license_key, expiry_date,status) VALUES (?, ?, ?)';
        await pool.promise().query(query, [id, licenseKey, expiryDate,'active']);

        res.status(201).json({ message: 'License generated successfully',
            license_key: licenseKey, 
            expiry_date: expiryDate });}
            catch (error) {
  console.error("ERROR DETAILS:", error);
  res.status(500).json({ 
    message: 'Internal server error',
    error: error.message
  });
}
        // } catch (error) {
        // console.error('Error generating license:', error);
        // res.status(500).json({ message: 'Internal server error' });
        // }
    };


exports.activateLicense = async (req, res) => {
  try {
    const { license_key, device_id } = req.body;

    if (!license_key || !device_id) {
      return res.status(400).json({ message: 'License key and device ID required' });
    }

    const [rows] = await pool.promise().query(
      'SELECT * FROM licenses WHERE license_key = ?',
      [license_key]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Invalid license key' });
    }

    const license = rows[0];

    if (license.status !== 'active') {
      return res.status(403).json({ message: 'License revoked' });
    }

    if (new Date(license.expiry_date) < new Date()) {
      return res.status(403).json({ message: 'License expired' });
    }

    // Device binding
    if (!license.device_id) {
      await pool.promise().query(
        'UPDATE licenses SET device_id = ? WHERE id = ?',
        [device_id, license.id]
      );
    } else if (license.device_id !== device_id) {
      return res.status(403).json({ message: 'License already activated on another device' });
    }

    // Create JWT
    const token = jwt.sign(
      {
        license_id: license.id,
        license_key: license.license_key,
        device_id: device_id
      },
      privateKey,
      { algorithm: 'RS256', expiresIn: '1y' }
    );

    res.json({
      message: 'License activated successfully',
      token
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// exports.revokeLicense = async (req, res) => {
//   try {
//     const { license_key } = req.body;

//     if (!license_key) {
//       return res.status(400).json({ message: 'License key required' });
//     }

//     const [result] = await pool.promise().query(
//       'UPDATE licenses SET status = ? WHERE license_key = ?',
//       ['revoked', license_key]
//     );

//     if (result.affectedRows === 0) {
//       return res.status(404).json({ message: 'License not found' });
//     }

//     res.json({ message: 'License revoked successfully' });

//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// };
// exports.verifyLicense = async (req, res) => {
//   try {
//     const { token } = req.body;

//     if (!token) {
//       return res.status(400).json({ message: 'Token required' });
//     }

//     const decoded = jwt.verify(token, privateKey, {
//       algorithms: ['RS256']
//     });

//     res.json({
//       valid: true,
//       license_id: decoded.license_id,
//       device_id: decoded.device_id
//     });

//   } catch (error) {
//     return res.status(403).json({
//       valid: false,
//       message: 'Invalid or expired license token'
//     });
//   }
// };