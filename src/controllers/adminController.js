const pool = require('../config/db');
const { v4: uuidv4 } = require('uuid');
const generateLicenseKey = require('../utils/generateLicense');

// GET all licenses
exports.getAllLicenses = async (req, res) => {
  try {
    const [rows] = await pool.promise().query(
      'SELECT * FROM licenses ORDER BY created_at DESC'
    );
    res.json({ total: rows.length, licenses: rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST generate license (admin version)
exports.generateLicense = async (req, res) => {
  try {
    const { expiry_days = 365 } = req.body;

    const id = uuidv4();
    const licenseKey = generateLicenseKey();

    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + parseInt(expiry_days));

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

// PATCH revoke license
exports.revokeLicense = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.promise().query(
      'SELECT * FROM licenses WHERE id = ?', [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'License not found' });
    }

    await pool.promise().query(
      'UPDATE licenses SET status = ? WHERE id = ?',
      ['revoked', id]
    );

    res.json({ message: 'License revoked successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// PATCH reset device binding
exports.resetDevice = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.promise().query(
      'SELECT * FROM licenses WHERE id = ?', [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'License not found' });
    }

    await pool.promise().query(
      'UPDATE licenses SET device_id = NULL WHERE id = ?', [id]
    );

    res.json({ message: 'Device binding reset. License can be activated on a new device.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// PATCH extend expiry
exports.extendExpiry = async (req, res) => {
  try {
    const { id } = req.params;
    const { extend_days = 365 } = req.body;

    const [rows] = await pool.promise().query(
      'SELECT * FROM licenses WHERE id = ?', [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'License not found' });
    }

    await pool.promise().query(
      'UPDATE licenses SET expiry_date = DATE_ADD(expiry_date, INTERVAL ? DAY) WHERE id = ?',
      [parseInt(extend_days), id]
    );

    const [updated] = await pool.promise().query(
      'SELECT expiry_date FROM licenses WHERE id = ?', [id]
    );

    res.json({
      message: `License extended by ${extend_days} days`,
      new_expiry_date: updated[0].expiry_date
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
