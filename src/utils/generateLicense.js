const { v4: uuidv4 } = require('uuid');

function generateLicenseKey() {
    return  'CMTI-' + uuidv4().split('-')[0].toUpperCase() + '-' + uuidv4().split('-')[1].toUpperCase();
}

module.exports = generateLicenseKey;