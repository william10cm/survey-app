import { APIGatewayProxyEvent } from 'aws-lambda';
import { getPool } from '../db/client';
import { parseBody } from '../utils/parseBody';
import { created, badRequest, serverError } from '../utils/response';

const ALLOWED_TYPES = new Set(['text', 'multiple_choice', 'checkbox', 'rating', 'yes_no']);

export const handler = async (event: APIGatewayProxyEvent) => {
  try {
    const { surveyId } = event.pathParameters!;
    const { text, type, required, options, order } = parseBody<any>(event);
    if (!text || !type) return badRequest('text and type are required');

    if (!ALLOWED_TYPES.has(type)) {
      return badRequest(`Unsupported question type: ${type}`);
    }

    if ((type === 'multiple_choice' || type === 'checkbox') && (!Array.isArray(options) || options.length === 0)) {
      return badRequest('options are required for multiple_choice and checkbox questions');
    }

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
    const dbError = err as { code?: string; constraint?: string; message?: string };
    if (dbError.code === '23514' && dbError.constraint === 'questions_type_check') {
      return badRequest(
        'Question type is not allowed by the database schema. Run the latest DB migrations in the deployed environment.'
      );
    }
    return serverError(err);
  }
};