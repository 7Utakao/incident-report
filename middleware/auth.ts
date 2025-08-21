export default defineNuxtRouteMiddleware(async (to, from) => {
  // クライアントサイドでのみ実行
  if (process.server) return;

  const { checkAuthStatus } = useAuth();

  // 認証状態をチェック
  const authenticated = await checkAuthStatus();

  if (!authenticated) {
    // 未認証の場合はログイン画面にリダイレクト
    return navigateTo('/login');
  }
});
