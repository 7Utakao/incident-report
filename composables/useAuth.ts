import { Amplify } from 'aws-amplify';
import { signIn, signOut, getCurrentUser, fetchAuthSession, type AuthUser } from 'aws-amplify/auth';

export const useAuth = () => {
  const config = useRuntimeConfig();
  const user = ref<AuthUser | null>(null);
  const isAuthenticated = ref(false);
  const idToken = ref<string | null>(null);

  // Amplify設定
  const initializeAmplify = () => {
    Amplify.configure({
      Auth: {
        Cognito: {
          userPoolId: config.public.userPoolId,
          userPoolClientId: config.public.userPoolClientId,
          loginWith: {
            oauth: {
              domain: `https://ap-northeast-1mchkmwz8y.auth.ap-northeast-1.amazoncognito.com`,
              scopes: ['openid', 'email', 'profile'],
              redirectSignIn: typeof window !== 'undefined' ? window.location.origin : '',
              redirectSignOut: typeof window !== 'undefined' ? window.location.origin : '',
              responseType: 'code',
            },
          },
        },
      },
    });
  };

  // 現在のユーザー情報を取得
  const checkAuthState = async () => {
    try {
      const currentUser = await getCurrentUser();
      const session = await fetchAuthSession();

      user.value = currentUser;
      isAuthenticated.value = true;
      idToken.value = session.tokens?.idToken?.toString() || null;

      return true;
    } catch (error) {
      console.log('User not authenticated:', error);
      user.value = null;
      isAuthenticated.value = false;
      idToken.value = null;
      return false;
    }
  };

  // サインイン（Hosted UIを使用）
  const signInWithHostedUI = async () => {
    try {
      await signIn({
        provider: 'Cognito',
      });
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  // サインアウト
  const signOutUser = async () => {
    try {
      await signOut();
      user.value = null;
      isAuthenticated.value = false;
      idToken.value = null;

      // ログイン画面にリダイレクト
      await navigateTo('/login');
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  // IDトークンを取得
  const getIdToken = async (): Promise<string | null> => {
    try {
      // 開発・テスト用: test-tokenを返す
      // 本番環境では以下のコメントアウトを解除してCognitoトークンを使用
      if (process.env.NODE_ENV === 'development' || !isAuthenticated.value) {
        return 'test-token';
      }

      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString() || null;
      idToken.value = token;
      return token;
    } catch (error) {
      console.error('Failed to get ID token:', error);
      // 開発・テスト用のフォールバック
      return 'test-token';
    }
  };

  // 初期化（クライアントサイドのみ）
  onMounted(async () => {
    if (process.client) {
      initializeAmplify();
      await checkAuthState();
    }
  });

  return {
    user: readonly(user),
    isAuthenticated: readonly(isAuthenticated),
    idToken: readonly(idToken),
    signInWithHostedUI,
    signOutUser,
    getIdToken,
    checkAuthState,
  };
};
