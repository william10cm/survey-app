import { Pool } from 'pg';

const pool = new Pool({
  host: 'localhost',
  port: 5433,
  database: 'survey_app',
  user: 'postgres',
  password: '******',
});

const seed = async () => {
  const client = await pool.connect();
  try {
    console.log('🌱 Seeding database...');

    const { rows: [survey] } = await client.query(`
      INSERT INTO surveys (title, description, is_published)
      VALUES ('Customer Feedback', 'Tell us how we did', true)
      RETURNING id
    `);

    await client.query(`
      INSERT INTO questions (survey_id, text, type, required, order_index)
      VALUES
        ($1, 'How satisfied are you overall?', 'rating', true, 1),
        ($1, 'What did we do well?', 'text', false, 2),
        ($1, 'Would you recommend us?', 'yes_no', true, 3),
        ($1, 'How did you hear about us?', 'multiple_choice', false, 4)
    `, [survey.id]);

    await client.query(`
      UPDATE questions
      SET options = '["Social media", "Friend", "Search engine", "Other"]'::jsonb
      WHERE survey_id = $1 AND type = 'multiple_choice'
    `, [survey.id]);

    console.log('✅ Seed complete. Survey ID:', survey.id);
  } finally {
    client.release();
    await pool.end();
  }
};

seed();
