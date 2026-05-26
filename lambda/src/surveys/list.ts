import { APIGatewayProxyEvent } from 'aws-lambda';
import { getPool } from '../db/client';
import { ok, serverError } from '../utils/response';

export const handler = async (_event: APIGatewayProxyEvent) => {
  try {
    const pool = await getPool();
    const { rows } = await pool.query(
      `SELECT id, title, description,
              is_published AS "isPublished",
              created_at  AS "createdAt",
              updated_at  AS "updatedAt"
       FROM surveys ORDER BY created_at DESC`
    );
    return ok(rows);
  } catch (err) {
    return serverError(err);
  }
};