import { getPool } from '../db/client';
import { ok, notFound, serverError } from '../utils/response';
export const handler = async (event) => {
    try {
        const { id } = event.pathParameters;
        const pool = await getPool();
        const { rows } = await pool.query('SELECT * FROM surveys WHERE id = $1', [id]);
        if (rows.length === 0)
            return notFound('Survey not found');
        return ok(rows[0]);
    }
    catch (err) {
        return serverError(err);
    }
};
