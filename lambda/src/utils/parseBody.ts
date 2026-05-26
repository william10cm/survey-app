export const parseBody = <T>(event: { body: string | null }): T => {
  if (!event.body) throw new Error('Request body is missing');
  return JSON.parse(event.body) as T;
};