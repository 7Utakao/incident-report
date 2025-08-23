import { Amplify } from 'aws-amplify';

// グローバルな初期化状態を管理
let amplifyInitialized = false;
let amplifyInitPromise: Promise<void> | null = null;
let amplifyConfig: any = null;

// Amplify設定の検証
export const verifyAmplifyConfig = () => {
  try {
    const config = Amplify.getConfig();
    const hasAuth = config.Auth?.Cognito?.userPoolId && config.Auth?.Cognito?.userPoolClientId;
    console.log('Amplify config verification:', { hasAuth, config: config.Auth?.Cognito });
    return hasAuth;
  } catch (error) {
    console.error('Amplify config verification failed:', error);
    return false;
  }
};

export default defineNuxtPlugin(async () => {
  const config = useRuntimeConfig();

  console.log('🚀 Amplify plugin initializing...');
  console.log('📋 Runtime config:', {
    userPoolId: config.public.userPoolId,
    userPoolClientId: config.public.userPoolClientId,
    awsRegion: config.public.awsRegion,
  });

  // 環境変数の存在確認
  if (!config.public.userPoolId || !config.public.userPoolClientId || !config.public.awsRegion) {
    console.error('❌ Missing required Amplify configuration values');
    throw new Error('Missing required Amplify configuration values');
  }

  // 既に初期化済みで設定が有効な場合はスキップ
  if (amplifyInitialized && verifyAmplifyConfig()) {
    console.log('✅ Amplify already initialized and verified');
    return;
  }

  // 初期化中の場合は待機
  if (amplifyInitPromise) {
    console.log('⏳ Amplify initialization in progress, waiting...');
    await amplifyInitPromise;
    return;
  }

  // 初期化処理
  amplifyInitPromise = (async () => {
    try {
      // Amplify設定（v6形式）
      amplifyConfig = {
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

      console.log('🔧 Configuring Amplify with:', amplifyConfig);

      // Amplifyを設定
      Amplify.configure(amplifyConfig, { ssr: false });
      console.log('⚙️ Amplify.configure() called');

      // 少し待機してから設定を確認
      await new Promise((resolve) => setTimeout(resolve, 100));

      // 設定の確認と検証
      const currentConfig = Amplify.getConfig();
      console.log('📊 Current Amplify config after setup:', currentConfig);

      // 設定が正しく適用されているか検証
      const isValid = verifyAmplifyConfig();
      if (!isValid) {
        throw new Error('Amplify configuration verification failed');
      }

      // 初期化完了フラグを設定
      amplifyInitialized = true;
      console.log('✅ Amplify initialization completed successfully');
    } catch (error) {
      console.error('❌ Amplify configuration error:', error);
      amplifyInitialized = false;
      amplifyInitPromise = null; // リトライを可能にする
      throw error;
    }
  })();

  await amplifyInitPromise;
});

// 初期化状態を確認するヘルパー関数をエクスポート
export const isAmplifyInitialized = () => {
  const initialized = amplifyInitialized && verifyAmplifyConfig();
  console.log('🔍 isAmplifyInitialized check:', {
    amplifyInitialized,
    verified: verifyAmplifyConfig(),
    result: initialized,
  });
  return initialized;
};

export const waitForAmplifyInit = async (maxRetries = 20, retryDelay = 250) => {
  console.log('⏳ waitForAmplifyInit called');

  if (isAmplifyInitialized()) {
    console.log('✅ Amplify already initialized');
    return true;
  }

  // 初期化中の場合は待機
  if (amplifyInitPromise) {
    console.log('⏳ Waiting for ongoing initialization...');
    try {
      await amplifyInitPromise;
      if (isAmplifyInitialized()) {
        console.log('✅ Initialization completed');
        return true;
      }
    } catch (error) {
      console.error('❌ Initialization promise failed:', error);
    }
  }

  // リトライロジック
  for (let i = 0; i < maxRetries; i++) {
    console.log(`🔄 Retry ${i + 1}/${maxRetries}: Checking Amplify initialization...`);

    if (isAmplifyInitialized()) {
      console.log('✅ Amplify initialization verified');
      return true;
    }

    // 設定を再試行
    if (amplifyConfig) {
      try {
        console.log('🔧 Re-configuring Amplify...');
        Amplify.configure(amplifyConfig, { ssr: false });
        await new Promise((resolve) => setTimeout(resolve, 100));

        if (isAmplifyInitialized()) {
          console.log('✅ Re-configuration successful');
          amplifyInitialized = true;
          return true;
        }
      } catch (error) {
        console.error('❌ Re-configuration failed:', error);
      }
    }

    await new Promise((resolve) => setTimeout(resolve, retryDelay));
  }

  console.error('❌ Amplify initialization timeout after', maxRetries, 'retries');
  throw new Error(`Amplify initialization timeout after ${maxRetries} retries`);
};

// 強制的に再初期化する関数
export const forceReinitializeAmplify = async () => {
  console.log('🔄 Force reinitializing Amplify...');
  amplifyInitialized = false;
  amplifyInitPromise = null;

  if (amplifyConfig) {
    try {
      Amplify.configure(amplifyConfig, { ssr: false });
      await new Promise((resolve) => setTimeout(resolve, 100));

      if (verifyAmplifyConfig()) {
        amplifyInitialized = true;
        console.log('✅ Force reinitialization successful');
        return true;
      }
    } catch (error) {
      console.error('❌ Force reinitialization failed:', error);
    }
  }

  return false;
};
