export default defineNuxtRouteMiddleware(async (to, from) => {
  // クライアントサイドでのみ実行
  if (process.server) return;

  const { checkAuthStatus, isAuthenticated, loading } = useAuth();

  // 既に認証済みの場合はスキップ
  if (isAuthenticated.value) {
    return;
  }

  // ローディング中の場合は少し待機
  if (loading.value) {
    // 最大3秒待機
    let waitCount = 0;
    while (loading.value && waitCount < 30) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      waitCount++;
    }
  }

  // 認証状態をチェック
  const authenticated = await checkAuthStatus();

  if (!authenticated) {
    // 未認証の場合はログイン画面にリダイレクト
    return navigateTo('/login');
  }
});
