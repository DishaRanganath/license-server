const express = require('express');
const router = express.Router();
const { generateLicense,activateLicense } =require('../controllers/licensecontroller');
const { verifyToken } = require('../middleware/authmiddleware.js');
// Route to generate a new license
router.post('/generate', generateLicense);
router.post('/activate', activateLicense);
router.get('/protected', verifyToken, (req, res) => {
  res.json({
    message: 'Access granted',
    license: req.license
  });
});
module.exports = router;