import { getPool } from '../db/client';
import { parseBody } from '../utils/parseBody';
import { created, badRequest, serverError } from '../utils/response';
export const handler = async (event) => {
    try {
        const { title, description } = parseBody(event);
        if (!title?.trim())
            return badRequest('Title is required');
        const pool = await getPool();
        const { rows } = await pool.query(`INSERT INTO surveys (title, description, is_published)
       VALUES ($1, $2, false)
       RETURNING *`, [title.trim(), description?.trim() ?? '']);
        return created(rows[0]);
    }
    catch (err) {
        return serverError(err);
    }
};
