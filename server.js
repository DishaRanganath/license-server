const mysql = require('mysql2/promise');

async function initDB() {
  const db = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: { rejectUnauthorized: false }
  });

  await db.execute(`
    CREATE TABLE IF NOT EXISTS licenses (
      id VARCHAR(36) PRIMARY KEY,
      license_key VARCHAR(50) UNIQUE NOT NULL,
      status ENUM('active', 'revoked') DEFAULT 'active',
      devices JSON,
      max_devices INT DEFAULT 1,
      feature_flatness BOOLEAN DEFAULT FALSE,
      feature_straightness BOOLEAN DEFAULT FALSE,
      feature_perpendicularity BOOLEAN DEFAULT FALSE,
      feature_parallelism BOOLEAN DEFAULT FALSE,
      expiry_date DATE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  console.log('✅ licenses table ready');
  await db.end();
}

require('./src/config/db');
const app = require('./src/app');
const PORT = process.env.PORT || 10000;

initDB().catch(console.error);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});