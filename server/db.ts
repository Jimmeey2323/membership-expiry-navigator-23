import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

// Simple configuration that should work
export const pool = new Pool({
  connectionString: "postgresql://postgres:admin123@db.brumbzbtvqkslzhlpsxh.supabase.co:5432/postgres",
  ssl: {
    rejectUnauthorized: false
  },
  max: 10,
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 10000,
});

export const db = drizzle(pool, { schema });

// Simple connection test
pool.connect((err, client, release) => {
  if (err) {
    console.error('Database connection failed:', err.message);
  } else {
    console.log('✅ Database connected successfully');
    release();
  }
});

pool.on('error', (err) => {
  console.error('Database pool error:', err);
});
