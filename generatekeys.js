const { generateKeyPairSync } = require('crypto');
const fs = require('fs');
const path = require('path');

const { privateKey, publicKey } = generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: {
    type: 'spki',
    format: 'pem'
  },
  privateKeyEncoding: {
    type: 'pkcs8',
    format: 'pem'
  }
});

// Save directly into src/config folder
const configPath = path.join(__dirname, 'src', 'config');

fs.writeFileSync(path.join(configPath, 'private.key'), privateKey);
fs.writeFileSync(path.join(configPath, 'public.key'), publicKey);

console.log('Keys generated inside src/config successfully');