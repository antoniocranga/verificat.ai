import { InfisicalSDK } from '@infisical/sdk';

export async function initConfig() {
  const token = process.env.INFISICAL_TOKEN;
  if (!token) {
    console.log(
      '[Config] INFISICAL_TOKEN not found. Falling back to local environment configuration.',
    );
    return;
  }

  const siteUrl =
    process.env.INFISICAL_URL || 'https://infisical-staging.verificat.xyz';
  const environment = process.env.NODE_ENV || 'development';

  console.log(
    `[Config] Initializing Infisical client connecting to: ${siteUrl}`,
  );
  try {
    const client = new InfisicalSDK({
      siteUrl,
    });

    await client.auth().universalAuth.login({
      clientId: process.env.INFISICAL_CLIENT_ID || '',
      clientSecret: process.env.INFISICAL_CLIENT_SECRET || '',
    });

    console.log('[Config] Universal Auth successful. Loading secrets...');
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
