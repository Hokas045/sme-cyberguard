import { createClient } from '@libsql/client';
import { getAuthState } from './auth';

// Use server-side only environment variables (without NEXT_PUBLIC_ prefix)
const TURSO_URL = process.env.TURSO_URL || process.env.NEXT_PUBLIC_TURSO_URL;
const TURSO_AUTH_TOKEN = process.env.TURSO_AUTH_TOKEN || process.env.NEXT_PUBLIC_TURSO_AUTH_TOKEN;

if (!TURSO_URL || !TURSO_AUTH_TOKEN) {
  throw new Error('Missing Turso configuration. Please set TURSO_URL and TURSO_AUTH_TOKEN environment variables.');
}

if (TURSO_AUTH_TOKEN === 'your_auth_token_here') {
  throw new Error('Invalid Turso auth token. Please set a valid TURSO_AUTH_TOKEN in your .env file.');
}

export const turso = createClient({
  url: TURSO_URL,
  authToken: TURSO_AUTH_TOKEN
});

// Basic query function with error handling
export async function query(sql: string, params: any[] = []) {
  try {
    const result = await turso.execute({
      sql,
      args: params
    });
    return result.rows;
  } catch (error) {
    console.error('Database query error:', error);
    throw new Error(`Database operation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Secure query function that enforces business_id filtering for multi-tenancy
export async function secureQuery(sql: string, params: any[] = [], options: { requireBusinessId?: boolean } = {}) {
  const { requireBusinessId = true } = options;

  if (requireBusinessId) {
    const { user } = getAuthState();
    if (!user) {
      throw new Error('Authentication required for secure queries');
    }

    // Ensure business_id is included in the query
    // This is a basic check - in production, you might want more sophisticated SQL parsing
    if (!sql.includes('business_id = ?')) {
      throw new Error('Secure queries must include business_id filtering');
    }

    // Prepend business_id to params
    params = [user.business_id, ...params];
  }

  return query(sql, params);
}

// Helper to get current user's business_id
export function getCurrentBusinessId(): string | null {
  const { user } = getAuthState();
  return user?.business_id || null;
}

// Insert function
export async function insert(table: string, data: Record<string, any>) {
  const columns = Object.keys(data);
  const values = Object.values(data);
  const placeholders = values.map(() => '?').join(', ');

  const sql = `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders})`;
  return query(sql, values);
}

// Update function
export async function update(table: string, data: Record<string, any>, where: Record<string, any>) {
  const setColumns = Object.keys(data);
  const whereColumns = Object.keys(where);

  const setClause = setColumns.map(col => `${col} = ?`).join(', ');
  const whereClause = whereColumns.map(col => `${col} = ?`).join(' AND ');

  const values = [...Object.values(data), ...Object.values(where)];

  const sql = `UPDATE ${table} SET ${setClause} WHERE ${whereClause}`;
  return query(sql, values);
}
