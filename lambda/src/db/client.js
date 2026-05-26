import { Pool } from 'pg';
// Module-level: persists across warm Lambda invocations
let pool = null;
export const getPool = () => {
    if (!pool) {
        pool = new Pool({
            host: process.env.DB_HOST,
            port: Number(process.env.DB_PORT) || 5432,
            database: process.env.DB_NAME,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            max: 2, // Lambda: keep pool small (many concurrent functions)
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 5000,
        });
    }
    return pool;
};
