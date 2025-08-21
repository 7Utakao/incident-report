<template>
  <div class="min-h-screen bg-background flex items-center justify-center px-4">
    <div class="max-w-md w-full space-y-8">
      <!-- Header -->
      <div class="text-center">
        <h1 class="text-3xl font-bold text-secondary">ログイン</h1>
        <p class="mt-2 text-gray">インシデント報告システムにログインしてください</p>
      </div>

      <!-- Login Form -->
      <Card class="p-8">
        <form @submit.prevent="handleLogin" class="space-y-6">
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
            :disabled="!username || !password || loading"
          >
            <span v-if="loading">ログイン中...</span>
            <span v-else>ログイン</span>
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
const showPassword = ref(false);

// Auth composable
const { login, loading, error, isAuthenticated } = useAuth();

// ログイン処理
const handleLogin = async () => {
  console.log('handleLogin called - 関数が実行されました');
  console.log('Username:', username.value, 'Password length:', password.value.length);
  console.log('Login function:', typeof login);

  try {
    console.log('login関数を呼び出し中...');
    const success = await login(username.value, password.value);
    console.log('login関数の結果:', success);

    if (success) {
      // 認証状態の更新を待ってからナビゲート
      await nextTick();
      console.log('ログイン成功、ナビゲート開始');
    } else {
      console.log('ログイン失敗');
    }
  } catch (err) {
    console.error('handleLogin内でエラー:', err);
  }
};

// 認証状態の変化を監視してナビゲート
watch(
  isAuthenticated,
  async (newValue) => {
    if (newValue) {
      console.log('認証状態が更新されました、ナビゲート実行');
      await navigateTo('/');
    }
  },
  { immediate: true },
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
