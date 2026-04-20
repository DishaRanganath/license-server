const pool = require('../config/db');
const { v4: uuidv4 } = require('uuid');
const generateLicenseKey = require('../utils/generateLicense');

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

exports.generateLicense = async (req, res) => {
  try {
    const {
      expiry_days = 5475,
      max_devices = 1,
      feature_flatness = false,
      feature_straightness = false,
      feature_perpendicularity = false,
      feature_parallelism = false
    } = req.body;

    const id = uuidv4();
    const licenseKey = generateLicenseKey();
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + parseInt(expiry_days));

    await pool.promise().query(
      `INSERT INTO licenses 
        (id, license_key, expiry_date, max_devices, 
         feature_flatness, feature_straightness, 
         feature_perpendicularity, feature_parallelism)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, licenseKey, expiryDate, parseInt(max_devices),
       feature_flatness, feature_straightness,
       feature_perpendicularity, feature_parallelism]
    );

    res.status(201).json({
      message: 'License generated successfully',
      license_key: licenseKey,
      expiry_date: expiryDate,
      max_devices,
      features: {
        flatness: feature_flatness,
        straightness: feature_straightness,
        perpendicularity: feature_perpendicularity,
        parallelism: feature_parallelism
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

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
      'UPDATE licenses SET status = ? WHERE id = ?', ['revoked', id]
    );
    res.json({ message: 'License revoked successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

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
      'UPDATE licenses SET devices = ? WHERE id = ?',
      [JSON.stringify([]), id]
    );
    res.json({ message: 'All device bindings reset.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

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

exports.updateLicense = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      max_devices,
      feature_flatness,
      feature_straightness,
      feature_perpendicularity,
      feature_parallelism
    } = req.body;

    const [rows] = await pool.promise().query(
      'SELECT * FROM licenses WHERE id = ?', [id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: 'License not found' });
    }

    await pool.promise().query(
      `UPDATE licenses SET
        max_devices = ?,
        feature_flatness = ?,
        feature_straightness = ?,
        feature_perpendicularity = ?,
        feature_parallelism = ?
       WHERE id = ?`,
      [max_devices, feature_flatness, feature_straightness,
       feature_perpendicularity, feature_parallelism, id]
    );

    res.json({ message: 'License updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};