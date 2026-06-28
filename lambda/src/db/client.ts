import { Pool } from 'pg';
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';

let pool: Pool | null = null;

const getSecrets = async () => {
  // Local dev — use env vars directly
  if (process.env.DB_HOST) {
    return {
      host:     process.env.DB_HOST,
      port:     Number(process.env.DB_PORT) || 5432,
      database: process.env.DB_NAME || 'survey_app',
      user:     process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD,
    };
  }

  // Production — fetch from Secrets Manager
  const client = new SecretsManagerClient({ region: process.env.AWS_REGION || 'us-east-1' });
  const response = await client.send(
    new GetSecretValueCommand({ SecretId: 'survey-app/db' })
  );
  const secret = JSON.parse(response.SecretString!);
  return {
    host:     secret.DB_HOST,
    port:     Number(secret.DB_PORT) || 5432,
    database: secret.DB_NAME,
    user:     secret.DB_USER,
    password: secret.DB_PASSWORD,
  };
};

export const getPool = async (): Promise<Pool> => {
  if (!pool) {
    const config = await getSecrets();
    // RDS rejects non-SSL connections (no pg_hba.conf entry / "no encryption").
    // rejectUnauthorized:false trusts the RDS-managed cert without bundling a CA.
    // Disable only for local dev via DB_SSL=false.
    const ssl =
      process.env.DB_SSL === 'false' ? false : { rejectUnauthorized: false };
    pool = new Pool({ ...config, ssl, max: 2, idleTimeoutMillis: 30000 });
  }
  return pool;
};