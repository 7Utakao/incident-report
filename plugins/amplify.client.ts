import { Amplify } from 'aws-amplify';

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();

  // Amplify設定
  Amplify.configure({
    Auth: {
      Cognito: {
        userPoolId: config.public.userPoolId,
        userPoolClientId: config.public.userPoolClientId,
        signUpVerificationMethod: 'code',
      },
    },
  });
});
