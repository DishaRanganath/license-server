const express = require('express');
const router = express.Router();
const { verifyAdmin } = require('../middleware/adminAuth');
const {
  getAllLicenses,
  generateLicense,
  revokeLicense,
  resetDevice,
  extendExpiry
} = require('../controllers/adminController');

// All routes protected by admin key
router.get('/licenses', verifyAdmin, getAllLicenses);
router.post('/generate', verifyAdmin, generateLicense);
router.patch('/licenses/:id/revoke', verifyAdmin, revokeLicense);
router.patch('/licenses/:id/reset', verifyAdmin, resetDevice);
router.patch('/licenses/:id/extend', verifyAdmin, extendExpiry);

module.exports = router;