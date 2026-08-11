import fs from 'fs';
import path from 'path';
import { query, pool } from '../config/database';

export const initDb = async () => {
  try {
    const schemaPath = path.join(__dirname, 'schema.sql');
    const sql = fs.readFileSync(schemaPath, 'utf8');
    await query(sql);
  } catch (error) {
    console.error('Error during initDb:', error);
    throw error;
  }
};

if (require.main === module) {
  initDb()
    .then(() => {
      pool.end();
      process.exit(0);
    })
    .catch((err) => {
      console.error('Failed to init db:', err);
      pool.end();
      process.exit(1);
    });
}
