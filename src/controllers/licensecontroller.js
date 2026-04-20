// const pool = require('../config/db');
// const {v4: uuidv4} = require('uuid');
// const generateLicenseKey = require('../utils/generateLicense');
// const jwt = require('jsonwebtoken');
// const { privateKey,publicKey } = require('../config/keys');

// exports.generateLicense =async (req, res) => {
//     try {
//         //const { v4: uuidv4 } = await import('uuid');
//         const id= uuidv4();
//         const licenseKey=generateLicenseKey();
      
//         //expiry date set to 1 year from now
//         const expiryDate = new Date();
//         expiryDate.setFullYear(expiryDate.getFullYear() + 20);

//         const query = 'INSERT INTO licenses (id, license_key, expiry_date,status) VALUES (?, ?, ?)';
//         await pool.promise().query(query, [id, licenseKey, expiryDate,'active']);

//         res.status(201).json({ message: 'License generated successfully',
//             license_key: licenseKey, 
//             expiry_date: expiryDate });}
//             catch (error) {
//   console.error("ERROR DETAILS:", error);
//   res.status(500).json({ 
//     message: 'Internal server error',
//     error: error.message
//   });
// }
//         // } catch (error) {
//         // console.error('Error generating license:', error);
//         // res.status(500).json({ message: 'Internal server error' });
//         // }
//     };


// exports.activateLicense = async (req, res) => {
//   try {
//     const { license_key, device_id } = req.body;

//     if (!license_key || !device_id) {
//       return res.status(400).json({ message: 'License key and device ID required' });
//     }

//     const [rows] = await pool.promise().query(
//       'SELECT * FROM licenses WHERE license_key = ?',
//       [license_key]
//     );

//     if (rows.length === 0) {
//       return res.status(404).json({ message: 'Invalid license key' });
//     }

//     const license = rows[0];

//     if (license.status !== 'active') {
//       return res.status(403).json({ message: 'License revoked' });
//     }

//     if (new Date(license.expiry_date) < new Date()) {
//       return res.status(403).json({ message: 'License expired' });
//     }

//     // Device binding
//     // if (!license.device_id) {
//     //   await pool.promise().query(
//     //     'UPDATE licenses SET device_id = ? WHERE id = ?',
//     //     [device_id, license.id]
//     //   );
//     // } else if (license.device_id !== device_id) {
//     //   return res.status(403).json({ message: 'License already activated on another device' });
//     // }
//     // Device binding — supports 2 devices
// if (!license.device_id) {
//   // First activation
//   await pool.promise().query(
//     'UPDATE licenses SET device_id = ? WHERE id = ?',
//     [device_id, license.id]
//   );

// } else if (license.device_id === device_id) {
//   // Same device 1 — allow
  
// } else if (!license.device_id2) {
//   // Second activation — bind second device
//   await pool.promise().query(
//     'UPDATE licenses SET device_id2 = ? WHERE id = ?',
//     [device_id, license.id]
//   );

// } else if (license.device_id2 === device_id) {
//   // Same device 2 — allow

// } else {
//   // Third device — reject
//   return res.status(403).json({ 
//     message: 'License already activated on 2 devices. Maximum limit reached.' 
//   });
// }

//     // Create JWT
//     const token = jwt.sign(
//       {
//         license_id: license.id,
//         license_key: license.license_key,
//         device_id: device_id
//       },
//       privateKey,
//       { algorithm: 'RS256', expiresIn: '1y' }
//     );

//     res.json({
//       message: 'License activated successfully',
//       token
//     });

//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// };

// exports.verifyDevice = async (req, res) => {
//   try {
//     const authHeader = req.headers.authorization;

//     if (!authHeader) {
//       return res.status(401).json({ valid: false, message: 'No token provided' });
//     }

//     const token = authHeader.split(' ')[1];

//     // Verify JWT signature
//     const decoded = jwt.verify(token, publicKey, { algorithms: ['RS256'] });

//     // Check license in DB
//     const [rows] = await pool.promise().query(
//       'SELECT * FROM licenses WHERE id = ?',
//       [decoded.license_id]
//     );

//     if (rows.length === 0) {
//       return res.status(403).json({ valid: false, message: 'License not found' });
//     }

//     const license = rows[0];

//     // Check status
//     if (license.status !== 'active') {
//       return res.status(403).json({ valid: false, message: 'License revoked' });
//     }

//     // Check expiry
//     if (new Date(license.expiry_date) < new Date()) {
//       return res.status(403).json({ valid: false, message: 'License expired' });
//     }

//     // Check device is still bound
//     const validDevice =
//       decoded.device_id === license.device_id ||
//       decoded.device_id === license.device_id2;

//     if (!validDevice) {
//       return res.status(403).json({ 
//         valid: false, 
//         message: 'Device binding reset. Please reactivate.' 
//       });
//     }

//     res.json({ valid: true, message: 'License valid' });

//   } catch (error) {
//     return res.status(403).json({ valid: false, message: 'Invalid token' });
//   }
// };


// new for device binding access
const pool = require('../config/db');
const { v4: uuidv4 } = require('uuid');
const generateLicenseKey = require('../utils/generateLicense');
const jwt = require('jsonwebtoken');
const { privateKey, publicKey } = require('../config/keys');

exports.generateLicense = async (req, res) => {
  try {
    const id = uuidv4();
    const licenseKey = generateLicenseKey();
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 15);

    await pool.promise().query(
      'INSERT INTO licenses (id, license_key, expiry_date) VALUES (?, ?, ?)',
      [id, licenseKey, expiryDate]
    );

    res.status(201).json({
      message: 'License generated successfully',
      license_key: licenseKey,
      expiry_date: expiryDate
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
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

    // Parse devices JSON array
    let devices = [];
    try {
      devices = typeof license.devices === 'string'
        ? JSON.parse(license.devices)
        : license.devices || [];
    } catch { devices = []; }

    // Check if device already registered
    const alreadyBound = devices.includes(device_id);

    if (!alreadyBound) {
      if (devices.length >= license.max_devices) {
        return res.status(403).json({
          message: `License already activated on maximum ${license.max_devices} device(s). Contact CMTI to upgrade.`
        });
      }
      devices.push(device_id);
      await pool.promise().query(
        'UPDATE licenses SET devices = ? WHERE id = ?',
        [JSON.stringify(devices), license.id]
      );
    }

    // Build features
    const features = {
      flatness: license.feature_flatness === 1,
      straightness: license.feature_straightness === 1,
      perpendicularity: license.feature_perpendicularity === 1,
      parallelism: license.feature_parallelism === 1,
    };

    const token = jwt.sign(
      {
        license_id: license.id,
        license_key: license.license_key,
        device_id: device_id,
        features: features
      },
      privateKey,
      { algorithm: 'RS256', expiresIn: '15y' }
    );

    res.json({
      message: 'License activated successfully',
      token,
      features
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

exports.verifyDevice = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ valid: false, message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, publicKey, { algorithms: ['RS256'] });

    const [rows] = await pool.promise().query(
      'SELECT * FROM licenses WHERE id = ?',
      [decoded.license_id]
    );

    if (rows.length === 0) {
      return res.status(403).json({ valid: false, message: 'License not found' });
    }

    const license = rows[0];

    if (license.status !== 'active') {
      return res.status(403).json({ valid: false, message: 'License revoked' });
    }

    if (new Date(license.expiry_date) < new Date()) {
      return res.status(403).json({ valid: false, message: 'License expired' });
    }

    let devices = [];
    try {
      devices = typeof license.devices === 'string'
        ? JSON.parse(license.devices)
        : license.devices || [];
    } catch { devices = []; }

    if (!devices.includes(decoded.device_id)) {
      return res.status(403).json({
        valid: false,
        message: 'Device binding reset. Please reactivate.'
      });
    }

    const features = {
      flatness: license.feature_flatness === 1,
      straightness: license.feature_straightness === 1,
      perpendicularity: license.feature_perpendicularity === 1,
      parallelism: license.feature_parallelism === 1,
    };

    res.json({ valid: true, message: 'License valid', features });

  } catch (error) {
    return res.status(403).json({ valid: false, message: 'Invalid or expired token' });
  }
};