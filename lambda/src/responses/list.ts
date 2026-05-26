import { APIGatewayProxyEvent } from 'aws-lambda';
import { getPool } from '../db/client';
import { ok, serverError } from '../utils/response';

export const handler = async (event: APIGatewayProxyEvent) => {
  try {
    const { surveyId } = event.pathParameters!;
    const pool = await getPool();

    const { rows } = await pool.query(
      `SELECT r.id,
              r.survey_id  AS "surveyId",
              r.submitted_at AS "submittedAt",
              COALESCE(
                json_agg(
                  json_build_object(
                    'questionId', a.question_id,
                    'value',      a.value
                  )
                ) FILTER (WHERE a.id IS NOT NULL),
                '[]'
              ) AS answers
       FROM responses r
       LEFT JOIN answers a ON a.response_id = r.id
       WHERE r.survey_id = $1
       GROUP BY r.id
       ORDER BY r.submitted_at DESC`,
      [surveyId]
    );
    return ok(rows);
  } catch (err) {
    return serverError(err);
  }
};
