import { APIGatewayProxyEvent } from 'aws-lambda';
import { getPool } from '../db/client';
import { ok, serverError } from '../utils/response';

export const handler = async (event: APIGatewayProxyEvent) => {
  try {
    const { surveyId } = event.pathParameters!;
    const pool = await getPool();
    const { rows } = await pool.query(
      `SELECT id, survey_id AS "surveyId", text, type, options, required,
              order_index AS "order", created_at AS "createdAt"
       FROM questions WHERE survey_id = $1 ORDER BY order_index ASC`,
      [surveyId]
    );
    return ok(rows);
  } catch (err) {
    return serverError(err);
  }
};