import { APIGatewayProxyEvent } from 'aws-lambda';
import { getPool } from '../db/client';
import { ok, notFound, serverError } from '../utils/response';

export const handler = async (event: APIGatewayProxyEvent) => {
  try {
    const { surveyId } = event.pathParameters!;
    const pool = await getPool();
    const { rows } = await pool.query(
      `SELECT id, title, description,
              is_published AS "isPublished",
              created_at  AS "createdAt",
              updated_at  AS "updatedAt"
       FROM surveys WHERE id = $1`,
      [surveyId]
    );
    if (rows.length === 0) return notFound('Survey not found');
    return ok(rows[0]);
  } catch (err) {
    return serverError(err);
  }
};