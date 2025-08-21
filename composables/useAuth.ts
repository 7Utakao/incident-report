import { signIn, signOut, getCurrentUser, fetchAuthSession } from 'aws-amplify/auth';

export const useAuth = () => {
  const user = ref<any>(null);
  const isAuthenticated = ref(false);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // ログイン
  const login = async (email: string, password: string) => {
    try {
      loading.value = true;
      error.value = null;

      const { isSignedIn } = await signIn({
        username: email,
        password: password,
      });

      if (isSignedIn) {
        await checkAuthStatus();
        return true;
      }
      return false;
    } catch (err: any) {
      console.error('ログインエラー:', err);
      error.value = err.message || 'ログインに失敗しました';
      return false;
    } finally {
      loading.value = false;
    }
  };

  // ログアウト
  const logout = async () => {
    try {
      loading.value = true;
      await signOut();
      user.value = null;
      isAuthenticated.value = false;
      await navigateTo('/login');
    } catch (err: any) {
      console.error('ログアウトエラー:', err);
      error.value = err.message || 'ログアウトに失敗しました';
    } finally {
      loading.value = false;
    }
  };

  // 認証状態をチェック
  const checkAuthStatus = async () => {
    try {
      loading.value = true;
      const currentUser = await getCurrentUser();

      if (currentUser) {
        user.value = currentUser;
        isAuthenticated.value = true;
        return true;
      } else {
        user.value = null;
        isAuthenticated.value = false;
        return false;
      }
    } catch (err: any) {
      console.error('認証状態チェックエラー:', err);
      user.value = null;
      isAuthenticated.value = false;
      return false;
    } finally {
      loading.value = false;
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

  // 初期化時に認証状態をチェック
  onMounted(async () => {
    await checkAuthStatus();
  });

  return {
    user: readonly(user),
    isAuthenticated: readonly(isAuthenticated),
    loading: readonly(loading),
    error: readonly(error),
    login,
    logout,
    checkAuthStatus,
    getIdToken,
  };
};
