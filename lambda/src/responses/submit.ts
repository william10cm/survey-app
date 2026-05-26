import { APIGatewayProxyEvent } from 'aws-lambda';
import { getPool } from '../db/client';
import { parseBody } from '../utils/parseBody';
import { created, badRequest, notFound, serverError } from '../utils/response';
import { Answer } from 'shared';

interface SubmitResponseBody {
  answers: Answer[];
}

export const handler = async (event: APIGatewayProxyEvent) => {
  try {
    const { surveyId } = event.pathParameters!;
    const { answers } = parseBody<SubmitResponseBody>(event);

    if (!Array.isArray(answers) || answers.length === 0) {
      return badRequest('Answers array is required');
    }

    const pool = await getPool();

    // Verify survey exists and is published
    const { rows: surveys } = await pool.query(
      'SELECT id FROM surveys WHERE id = $1 AND is_published = true',
      [surveyId]
    );
    if (surveys.length === 0) return notFound('Survey not found or not published');

    // Insert response + answers in a transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const { rows: [response] } = await client.query(
        'INSERT INTO responses (survey_id) VALUES ($1) RETURNING id',
        [surveyId]
      );

      for (const answer of answers) {
        await client.query(
          `INSERT INTO answers (response_id, question_id, value)
           VALUES ($1, $2, $3)`,
          [response.id, answer.questionId, JSON.stringify(answer.value)]
        );
      }

      await client.query('COMMIT');
      return created({ responseId: response.id });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    return serverError(err);
  }
};