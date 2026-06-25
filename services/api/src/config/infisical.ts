import { InfisicalSDK } from '@infisical/sdk';

export async function initConfig() {
  const token = process.env.INFISICAL_TOKEN;
  if (!token) {
    console.log(
      '[Config] INFISICAL_TOKEN not found. Falling back to local environment configuration.',
    );
    return;
  }

  const siteUrl = process.env.INFISICAL_URL || 'https://eu.infisical.com';
  const environment = process.env.NODE_ENV || 'development';

  console.log(
    `[Config] Initializing Infisical client connecting to: ${siteUrl}`,
  );
  try {
    const client = new InfisicalSDK({
      siteUrl,
    });

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    await client.auth().serviceToken.login({
      accessToken: token,
    });

    console.log('[Config] Service Token auth successful. Loading secrets...');
    const response = await client.secrets().listSecrets({
      environment,
      projectId: process.env.INFISICAL_PROJECT_ID || '',
    });

    if (response && Array.isArray(response.secrets)) {
      for (const secret of response.secrets) {
        if (secret.secretKey && secret.secretValue) {
          process.env[secret.secretKey] = secret.secretValue;
        }
      }
    }
    console.log(
      '[Config] Infisical secrets loaded successfully into process.env.',
    );
  } catch (error) {
    console.error('[Config] Failed to load secrets from Infisical:', error);
    throw error;
  }
}
