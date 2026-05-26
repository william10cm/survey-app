import { APIGatewayProxyEvent } from 'aws-lambda';
import { getPool } from '../db/client';
import { ok, notFound, serverError } from '../utils/response';

export const handler = async (event: APIGatewayProxyEvent) => {
  try {
    const { surveyId } = event.pathParameters!;
    const pool = await getPool();
    const { rowCount } = await pool.query(
      'DELETE FROM surveys WHERE id = $1',
      [surveyId]
    );
    if (rowCount === 0) return notFound('Survey not found');
    return ok({ message: 'Survey deleted' });
  } catch (err) {
    return serverError(err);
  }
};