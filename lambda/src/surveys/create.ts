import { APIGatewayProxyEvent } from 'aws-lambda';
import { getPool } from '../db/client';
import { parseBody } from '../utils/parseBody';
import { created, badRequest, serverError } from '../utils/response';

interface CreateSurveyBody {
  title: string;
  description?: string;
}

export const handler = async (event: APIGatewayProxyEvent) => {
  try {
    const { title, description } = parseBody<CreateSurveyBody>(event);
    if (!title?.trim()) return badRequest('Title is required');

    const pool = await getPool();
    const { rows } = await pool.query(
      `INSERT INTO surveys (title, description, is_published)
       VALUES ($1, $2, false)
       RETURNING id, title, description,
                 is_published AS "isPublished",
                 created_at  AS "createdAt",
                 updated_at  AS "updatedAt"`,
      [title.trim(), description?.trim() ?? '']
    );
    return created(rows[0]);
  } catch (err) {
    return serverError(err);
  }
};