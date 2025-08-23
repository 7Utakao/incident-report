<template>
  <div class="min-h-screen bg-background flex items-center justify-center px-4">
    <div class="max-w-md w-full space-y-8">
      <!-- Header -->
      <div class="text-center">
        <h1 class="text-3xl font-bold text-secondary">ログイン</h1>
        <p class="mt-2 text-gray">Report Seedにログインしてください</p>
      </div>

      <!-- Login Form -->
      <Card class="p-8">
        <!-- 通常のログインフォーム -->
        <form v-if="!needsNewPassword" @submit.prevent="handleLogin" class="space-y-6">
          <!-- Username Input -->
          <div>
            <Input
              v-model="username"
              type="text"
              label="ユーザーID"
              placeholder="ユーザーIDを入力"
              required
              :disabled="loading"
            />
          </div>

          <!-- Password Input -->
          <div class="relative">
            <Input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              label="パスワード"
              placeholder="パスワードを入力"
              required
              :disabled="loading"
            />
            <button
              type="button"
              @click="showPassword = !showPassword"
              class="absolute right-3 top-9 text-gray-500 hover:text-gray-700 focus:outline-none"
              :disabled="loading"
            >
              <svg
                v-if="showPassword"
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                ></path>
              </svg>
              <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                ></path>
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                ></path>
              </svg>
            </button>
          </div>

          <!-- Error Message -->
          <div v-if="error" class="text-error text-sm bg-red-50 p-3 rounded-md">
            {{ error }}
          </div>

          <!-- Login Button -->
          <Button
            type="submit"
            variant="primary"
            class="w-full"
            :loading="loading"
            :disabled="loading"
          >
            <span v-if="loading">ログイン中...</span>
            <span v-else>ログイン</span>
          </Button>
        </form>

        <!-- 新しいパスワード設定フォーム -->
        <form v-else @submit.prevent="handleSetNewPassword" class="space-y-6">
          <div class="text-center mb-4">
            <h2 class="text-lg font-semibold text-secondary">新しいパスワードを設定</h2>
            <p class="text-sm text-gray mt-1">
              初回ログインのため、新しいパスワードを設定してください
            </p>
          </div>

          <!-- New Password Input -->
          <div class="relative">
            <Input
              v-model="newPassword"
              :type="showNewPassword ? 'text' : 'password'"
              label="新しいパスワード"
              placeholder="新しいパスワードを入力"
              required
              :disabled="loading"
            />
            <button
              type="button"
              @click="showNewPassword = !showNewPassword"
              class="absolute right-3 top-9 text-gray-500 hover:text-gray-700 focus:outline-none"
              :disabled="loading"
            >
              <svg
                v-if="showNewPassword"
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                ></path>
              </svg>
              <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                ></path>
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                ></path>
              </svg>
            </button>
          </div>

          <!-- Confirm Password Input -->
          <div class="relative">
            <Input
              v-model="confirmPassword"
              :type="showConfirmPassword ? 'text' : 'password'"
              label="パスワード確認"
              placeholder="パスワードを再入力"
              required
              :disabled="loading"
            />
            <button
              type="button"
              @click="showConfirmPassword = !showConfirmPassword"
              class="absolute right-3 top-9 text-gray-500 hover:text-gray-700 focus:outline-none"
              :disabled="loading"
            >
              <svg
                v-if="showConfirmPassword"
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                ></path>
              </svg>
              <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                ></path>
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                ></path>
              </svg>
            </button>
          </div>

          <!-- Error Message -->
          <div v-if="error" class="text-error text-sm bg-red-50 p-3 rounded-md">
            {{ error }}
          </div>

          <!-- Password validation message -->
          <div
            v-if="newPassword && confirmPassword && newPassword !== confirmPassword"
            class="text-error text-sm bg-red-50 p-3 rounded-md"
          >
            パスワードが一致しません
          </div>

          <!-- Set Password Button -->
          <Button
            type="submit"
            variant="primary"
            class="w-full"
            :loading="loading"
            :disabled="
              !newPassword || !confirmPassword || newPassword !== confirmPassword || loading
            "
          >
            <span v-if="loading">設定中...</span>
            <span v-else>パスワードを設定</span>
          </Button>
        </form>
      </Card>

      <!-- Footer -->
      <div class="text-center text-sm text-gray">
        <p>アカウントをお持ちでない場合は、管理者にお問い合わせください。</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Components
import Card from '~/components/ui/Card.vue';
import Button from '~/components/ui/Button.vue';
import Input from '~/components/ui/Input.vue';

// Reactive data
const username = ref('');
const password = ref('');
const newPassword = ref('');
const confirmPassword = ref('');
const showPassword = ref(false);
const showNewPassword = ref(false);
const showConfirmPassword = ref(false);

// Auth composable
const { login, loading, error, isAuthenticated, needsNewPassword, setNewPassword } = useAuth();

// ログイン処理
const handleLogin = async () => {
  console.log('handleLogin called - 関数が実行されました');
  console.log('Username:', username.value, 'Password length:', password.value.length);
  console.log('Login function:', typeof login);

  try {
    console.log('login関数を呼び出し中...');
    const success = await login(username.value, password.value);
    console.log('login関数の結果:', success);

    if (success === true) {
      // 認証状態の更新を待ってからナビゲート
      await nextTick();
      console.log('ログイン成功、ナビゲート開始');
    } else if (success === 'NEEDS_NEW_PASSWORD') {
      console.log('新しいパスワードの設定が必要です');
      // needsNewPasswordがtrueになるので、UIが自動的に切り替わる
    } else {
      console.log('ログイン失敗');
    }
  } catch (err) {
    console.error('handleLogin内でエラー:', err);
  }
};

// 新しいパスワード設定処理
const handleSetNewPassword = async () => {
  console.log('handleSetNewPassword called');

  if (newPassword.value !== confirmPassword.value) {
    console.error('パスワードが一致しません');
    return;
  }

  try {
    console.log('setNewPassword関数を呼び出し中...');
    const success = await setNewPassword(newPassword.value);
    console.log('setNewPassword関数の結果:', success);

    if (success) {
      console.log('新しいパスワード設定成功');
      // 認証状態が更新されるので、watchが自動的にナビゲートする
    } else {
      console.log('新しいパスワード設定失敗');
    }
  } catch (err) {
    console.error('handleSetNewPassword内でエラー:', err);
  }
};

// ページ読み込み時に認証状態をチェック
onMounted(async () => {
  console.log('ログイン画面がマウントされました、認証状態をチェック中...');
  const { checkAuthStatus } = useAuth();
  const authenticated = await checkAuthStatus();

  if (authenticated) {
    console.log('既にログイン済みです、ホーム画面にリダイレクトします');
    await navigateTo('/');
  }
});

// 認証状態の変化を監視してナビゲート
watch(
  isAuthenticated,
  async (newValue) => {
    if (newValue) {
      console.log('認証状態が更新されました、ナビゲート実行');
      await navigateTo('/');
    }
  },
  { immediate: false }, // onMountedで既にチェックしているのでimmediateはfalse
);

// Meta
useHead({
  title: 'ログイン - インシデント報告システム',
});

// レイアウトを無効化（ログイン画面は独立したレイアウト）
definePageMeta({
  layout: false,
});
</script>
