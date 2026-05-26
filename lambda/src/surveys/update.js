import { getPool } from '../db/client';
import { parseBody } from '../utils/parseBody';
import { ok, notFound, serverError } from '../utils/response';
export const handler = async (event) => {
    try {
        const { id } = event.pathParameters;
        const { title, description, isPublished } = parseBody(event);
        const pool = await getPool();
        const { rows } = await pool.query(`UPDATE surveys
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           is_published = COALESCE($3, is_published),
           updated_at = NOW()
       WHERE id = $4
       RETURNING *`, [title, description, isPublished, id]);
        if (rows.length === 0)
            return notFound('Survey not found');
        return ok(rows[0]);
    }
    catch (err) {
        return serverError(err);
    }
};
