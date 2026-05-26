import { APIGatewayProxyEvent } from 'aws-lambda';
import { getPool } from '../db/client';
import { parseBody } from '../utils/parseBody';
import { created, badRequest, serverError } from '../utils/response';

export const handler = async (event: APIGatewayProxyEvent) => {
  try {
    const { surveyId } = event.pathParameters!;
    const { text, type, required, options, order } = parseBody<any>(event);
    if (!text || !type) return badRequest('text and type are required');

    const pool = await getPool();
    const { rows } = await pool.query(
      `INSERT INTO questions (survey_id, text, type, required, options, order_index)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, survey_id AS "surveyId", text, type, options, required,
                 order_index AS "order", created_at AS "createdAt"`,
      [surveyId, text, type, required ?? false, options ? JSON.stringify(options) : null, order ?? 0]
    );
    return created(rows[0]);
  } catch (err) {
    return serverError(err);
  }
};