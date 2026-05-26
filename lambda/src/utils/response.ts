export const ok = (data: unknown) => ({
  statusCode: 200,
  headers: corsHeaders(),
  body: JSON.stringify(data),
});

export const created = (data: unknown) => ({
  statusCode: 201,
  headers: corsHeaders(),
  body: JSON.stringify(data),
});

export const badRequest = (message: string) => ({
  statusCode: 400,
  headers: corsHeaders(),
  body: JSON.stringify({ error: message }),
});

export const notFound = (message = 'Not found') => ({
  statusCode: 404,
  headers: corsHeaders(),
  body: JSON.stringify({ error: message }),
});

export const serverError = (err: unknown) => {
  console.error(err);
  return {
    statusCode: 500,
    headers: corsHeaders(),
    body: JSON.stringify({ error: 'Internal server error' }),
  };
};

const corsHeaders = () => ({
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': process.env.FRONTEND_URL || '*',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
});