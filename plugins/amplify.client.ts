import { Amplify } from 'aws-amplify';

// グローバルな初期化状態を管理
let amplifyInitialized = false;
let amplifyInitPromise: Promise<void> | null = null;

export default defineNuxtPlugin(async () => {
  const config = useRuntimeConfig();

  console.log('Amplify plugin initializing...');
  console.log('Runtime config:', config.public);
  console.log('UserPoolId:', config.public.userPoolId);
  console.log('UserPoolClientId:', config.public.userPoolClientId);
  console.log('AWS Region:', config.public.awsRegion);

  // 環境変数の存在確認
  if (!config.public.userPoolId || !config.public.userPoolClientId || !config.public.awsRegion) {
    console.error('Missing required Amplify configuration values');
    throw new Error('Missing required Amplify configuration values');
  }

  // 既に初期化済みの場合はスキップ
  if (amplifyInitialized) {
    console.log('Amplify already initialized');
    return;
  }

  // 初期化中の場合は待機
  if (amplifyInitPromise) {
    console.log('Amplify initialization in progress, waiting...');
    await amplifyInitPromise;
    return;
  }

  // 初期化処理
  amplifyInitPromise = (async () => {
    try {
      // Amplify設定（v6形式）
      const amplifyConfig = {
        Auth: {
          Cognito: {
            userPoolId: config.public.userPoolId,
            userPoolClientId: config.public.userPoolClientId,
            loginWith: {
              username: true,
            },
          },
        },
      };

      console.log('Amplify config:', amplifyConfig);

      Amplify.configure(amplifyConfig, { ssr: false });
      console.log('Amplify configured successfully');

      // 設定の確認
      const currentConfig = Amplify.getConfig();
      console.log('Current Amplify config after setup:', currentConfig);

      // 初期化完了フラグを設定
      amplifyInitialized = true;
      console.log('Amplify initialization completed');
    } catch (error) {
      console.error('Amplify configuration error:', error);
      amplifyInitialized = false;
      throw error;
    }
  })();

  await amplifyInitPromise;
});

// 初期化状態を確認するヘルパー関数をエクスポート
export const isAmplifyInitialized = () => amplifyInitialized;
export const waitForAmplifyInit = async () => {
  if (amplifyInitialized) return;
  if (amplifyInitPromise) {
    await amplifyInitPromise;
  }
};
