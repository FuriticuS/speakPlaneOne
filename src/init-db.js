import { query } from './config/db.js';

const initDb = async () => {
  // ---------- users ----------
  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role VARCHAR(20) NOT NULL DEFAULT 'user',
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);

  // Профильные поля (новая модель — заполняются на /settings после регистрации).
  await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS name VARCHAR(255)`);
  await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS gender VARCHAR(20)`);
  await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS age INT`);

  // ---------- refresh_tokens ----------
  await query(`
    CREATE TABLE IF NOT EXISTS refresh_tokens (
      id SERIAL PRIMARY KEY,
      user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token TEXT NOT NULL UNIQUE,
      created_at TIMESTAMP DEFAULT NOW(),
      expires_at TIMESTAMP NOT NULL,
      revoked BOOLEAN DEFAULT FALSE
    )
  `);

  // ---------- удаляем старые таблицы (Project → Page → Block) ----------
  await query(`DROP TABLE IF EXISTS projects CASCADE`);
  await query(`DROP TABLE IF EXISTS pages CASCADE`);
  await query(`DROP TABLE IF EXISTS blocks CASCADE`);

  // ---------- blocks (новая модель: блоки-«страны» на полотне) ----------
  await query(`
    CREATE TABLE IF NOT EXISTS blocks (
      id SERIAL PRIMARY KEY,
      content TEXT DEFAULT NULL,
      x DOUBLE PRECISION NOT NULL,
      y DOUBLE PRECISION NOT NULL,
      width DOUBLE PRECISION NOT NULL,
      height DOUBLE PRECISION NOT NULL,
      parent_id INT DEFAULT NULL,
      edge VARCHAR(10) DEFAULT NULL,
      owner_id INT DEFAULT NULL REFERENCES users(id) ON DELETE SET NULL,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);

  // ---------- сид корневого блока ----------
  const root = await query(`SELECT id FROM blocks LIMIT 1`);
  if (root.rowCount === 0) {
    await query(
      `INSERT INTO blocks (content, x, y, width, height, parent_id, edge, owner_id)
       VALUES ($1, 0, 0, 320, 220, NULL, NULL, NULL)`,
      ['Добро пожаловать в SpeakPlane'],
    );
  }

  console.log('Database ready');
};

initDb().catch((err) => {
  console.error(err);
  process.exit(1);
});
