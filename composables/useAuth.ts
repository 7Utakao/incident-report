import { signIn, signOut, getCurrentUser, fetchAuthSession } from 'aws-amplify/auth';

// グローバルな状態管理
const globalUser = ref<any>(null);
const globalIsAuthenticated = ref(false);
const globalLoading = ref(false);
const globalError = ref<string | null>(null);

export const useAuth = () => {
  // ログイン
  const login = async (username: string, password: string) => {
    console.log('useAuth.login called with:', { username, passwordLength: password.length });
    try {
      console.log('Setting loading to true');
      globalLoading.value = true;
      globalError.value = null;

      console.log('Calling AWS Cognito signIn...');
      const signInResult = await signIn({
        username: username,
        password: password,
      });

      console.log('signIn full result:', signInResult);
      console.log('signIn result:', { isSignedIn: signInResult.isSignedIn });

      // 追加の詳細情報をログ出力
      if (signInResult.nextStep) {
        console.log('signIn nextStep:', signInResult.nextStep);
      }

      if (signInResult.isSignedIn) {
        console.log('Sign in successful, getting current user...');
        // ログイン成功時は即座に認証状態を更新
        try {
          const currentUser = await getCurrentUser();
          console.log('getCurrentUser result:', currentUser);
          if (currentUser) {
            globalUser.value = currentUser;
            globalIsAuthenticated.value = true;
            console.log('認証状態を更新しました:', {
              user: currentUser,
              isAuthenticated: globalIsAuthenticated.value,
            });
            return true;
          }
        } catch (userError) {
          console.error('ユーザー情報取得エラー:', userError);
          // ユーザー情報取得に失敗してもログインは成功とみなす
          console.log('ユーザー情報取得失敗でも認証成功とみなします');
          globalIsAuthenticated.value = true;
          return true;
        }
      }
      console.log('Sign in failed or isSignedIn is false');
      return false;
    } catch (err: any) {
      console.error('ログインエラー:', err);
      if (err.name === 'UserNotFoundException') {
        globalError.value = 'ユーザーが見つかりません';
      } else if (err.name === 'NotAuthorizedException') {
        globalError.value = 'ユーザー名またはパスワードが正しくありません';
      } else {
        globalError.value = err.message || 'ログインに失敗しました';
      }
      return false;
    } finally {
      console.log('Setting loading to false');
      globalLoading.value = false;
    }
  };

  // ログアウト
  const logout = async () => {
    try {
      globalLoading.value = true;
      await signOut();
      globalUser.value = null;
      globalIsAuthenticated.value = false;
      await navigateTo('/login');
    } catch (err: any) {
      console.error('ログアウトエラー:', err);
      globalError.value = err.message || 'ログアウトに失敗しました';
    } finally {
      globalLoading.value = false;
    }
  };

  // 認証状態をチェック
  const checkAuthStatus = async () => {
    try {
      globalLoading.value = true;
      const currentUser = await getCurrentUser();

      if (currentUser) {
        globalUser.value = currentUser;
        globalIsAuthenticated.value = true;
        return true;
      } else {
        globalUser.value = null;
        globalIsAuthenticated.value = false;
        return false;
      }
    } catch (err: any) {
      // 認証エラーは正常な状態として扱う（未認証）
      if (err.name === 'UserUnAuthenticatedException' || err.name === 'NotAuthorizedException') {
        globalUser.value = null;
        globalIsAuthenticated.value = false;
        return false;
      }
      console.error('認証状態チェックエラー:', err);
      globalUser.value = null;
      globalIsAuthenticated.value = false;
      return false;
    } finally {
      globalLoading.value = false;
    }
  };

  // IDトークンを取得
  const getIdToken = async (): Promise<string | null> => {
    try {
      const session = await fetchAuthSession();
      return session.tokens?.idToken?.toString() || null;
    } catch (err: any) {
      console.error('IDトークン取得エラー:', err);
      return null;
    }
  };

  return {
    user: readonly(globalUser),
    isAuthenticated: readonly(globalIsAuthenticated),
    loading: readonly(globalLoading),
    error: readonly(globalError),
    login,
    logout,
    checkAuthStatus,
    getIdToken,
  };
};
