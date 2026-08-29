import { query } from './config/db.js';

const ROOT_BLOCK_CONTENT = 'Добро пожаловать в SpeakPlane';
const ROOT_BLOCK_SIZE = { width: 320, height: 220 };

const initDb = async () => {
  // --- users: базовая таблица (роль уже есть) ---
  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role VARCHAR(20) NOT NULL DEFAULT 'user',
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);

  // --- профильные поля (заполняются на /settings после регистрации) ---
  await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS name VARCHAR(100)`);
  await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS gender VARCHAR(20) NOT NULL DEFAULT 'not_specified'`);
  await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS age INT`);
  await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS city VARCHAR(100)`);

  // --- refresh_tokens ---
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

  // --- удаляем старую модель Project → Page → Block ---
  await query(`DROP TABLE IF EXISTS blocks CASCADE`);
  await query(`DROP TABLE IF EXISTS pages CASCADE`);
  await query(`DROP TABLE IF EXISTS projects CASCADE`);

  // --- blocks: блоки-«страны» ---
  await query(`
    CREATE TABLE IF NOT EXISTS blocks (
      id SERIAL PRIMARY KEY,
      content TEXT,
      x DOUBLE PRECISION NOT NULL,
      y DOUBLE PRECISION NOT NULL,
      width DOUBLE PRECISION NOT NULL,
      height DOUBLE PRECISION NOT NULL,
      parent_id INT REFERENCES blocks(id) ON DELETE SET NULL,
      edge VARCHAR(10),
      owner_id INT REFERENCES users(id) ON DELETE SET NULL,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);

  await query(`CREATE INDEX IF NOT EXISTS idx_blocks_bbox ON blocks (x, y, width, height)`);

  // --- сид корневого блока ---
  const root = await query(`SELECT id FROM blocks WHERE parent_id IS NULL LIMIT 1`);
  if (root.rowCount === 0) {
    await query(
      `INSERT INTO blocks (content, x, y, width, height, parent_id, edge, owner_id)
       VALUES ($1, 0, 0, $2, $3, NULL, NULL, NULL)`,
      [ROOT_BLOCK_CONTENT, ROOT_BLOCK_SIZE.width, ROOT_BLOCK_SIZE.height],
    );
  }

  console.log('Database ready');
};

initDb().catch((err) => {
  console.error(err);
  process.exit(1);
});
