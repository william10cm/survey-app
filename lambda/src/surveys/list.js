import { getPool } from '../db/client';
import { ok, serverError } from '../utils/response';
export const handler = async (_event) => {
    try {
        const pool = getPool();
        const { rows } = await pool.query('SELECT * FROM surveys ORDER BY created_at DESC');
        return ok(rows);
    }
    catch (err) {
        return serverError(err);
    }
};
