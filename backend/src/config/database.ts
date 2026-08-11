import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg';
import { config } from '../config/env';

export const pool = new Pool({
  connectionString: config.databaseUrl,
  ssl: config.databaseUrl.includes('neon.tech') || config.nodeEnv === 'production'
    ? { rejectUnauthorized: false }
    : false,
});

export const query = async <T extends QueryResultRow = any>(
  text: string,
  params?: any[]
): Promise<QueryResult<T>> => {
  return pool.query<T>(text, params);
};

export const getClient = async (): Promise<PoolClient> => {
  return pool.connect();
};

export const checkDatabaseConnection = async (): Promise<boolean> => {
  try {
    const res = await query('SELECT NOW() as now_time;');
    return !!res.rows[0]?.now_time;
  } catch (error) {
    return false;
  }
};
