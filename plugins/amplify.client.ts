import { Amplify } from 'aws-amplify';

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();

  console.log('Amplify plugin initializing...');
  console.log('Runtime config:', config.public);
  console.log('UserPoolId:', config.public.userPoolId);
  console.log('UserPoolClientId:', config.public.userPoolClientId);
  console.log('AWS Region:', config.public.awsRegion);

  // Amplify設定
  const amplifyConfig = {
    Auth: {
      Cognito: {
        userPoolId: config.public.userPoolId,
        userPoolClientId: config.public.userPoolClientId,
        signUpVerificationMethod: 'code' as const,
      },
    },
  };

  console.log('Amplify config:', amplifyConfig);

  try {
    Amplify.configure(amplifyConfig);
    console.log('Amplify configured successfully');
  } catch (error) {
    console.error('Amplify configuration error:', error);
  }
});
