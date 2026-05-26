import { APIGatewayProxyEvent } from 'aws-lambda';
import { getPool } from '../db/client';
import { parseBody } from '../utils/parseBody';
import { ok, notFound, serverError } from '../utils/response';

export const handler = async (event: APIGatewayProxyEvent) => {
  try {
    const { id } = event.pathParameters!;
    const { title, description, isPublished } = parseBody<{
      title?: string;
      description?: string;
      isPublished?: boolean;
    }>(event);

    const pool = await getPool();
    const { rows } = await pool.query(
      `UPDATE surveys
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           is_published = COALESCE($3, is_published),
           updated_at = NOW()
       WHERE id = $4
       RETURNING id, title, description,
                 is_published AS "isPublished",
                 created_at  AS "createdAt",
                 updated_at  AS "updatedAt"`,
      [title, description, isPublished, id]
    );
    if (rows.length === 0) return notFound('Survey not found');
    return ok(rows[0]);
  } catch (err) {
    return serverError(err);
  }
};