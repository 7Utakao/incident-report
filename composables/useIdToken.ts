import { getCurrentUser, fetchAuthSession } from 'aws-amplify/auth';

export const useIdToken = () => {
  const idToken = ref<string | null>(null);
  const isAuthenticated = ref(false);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const getIdToken = async (): Promise<string | null> => {
    try {
      loading.value = true;
      error.value = null;

      // 現在のユーザーを確認
      const user = await getCurrentUser();
      if (!user) {
        isAuthenticated.value = false;
        return null;
      }

      // セッションからIDトークンを取得
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();

      if (token) {
        idToken.value = token;
        isAuthenticated.value = true;
        return token;
      } else {
        isAuthenticated.value = false;
        return null;
      }
    } catch (err: any) {
      console.error('ID Token取得エラー:', err);
      error.value = err.message || 'ID Token取得に失敗しました';
      isAuthenticated.value = false;
      return null;
    } finally {
      loading.value = false;
    }
  };

  const refreshToken = async (): Promise<string | null> => {
    return await getIdToken();
  };

  return {
    idToken: readonly(idToken),
    isAuthenticated: readonly(isAuthenticated),
    loading: readonly(loading),
    error: readonly(error),
    getIdToken,
    refreshToken,
  };
};
