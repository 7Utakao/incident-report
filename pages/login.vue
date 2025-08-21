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
          <!-- Email Input -->
          <div>
            <Input
              v-model="email"
              type="email"
              label="メールアドレス"
              placeholder="example@company.com"
              required
              :disabled="loading"
            />
          </div>

          <!-- Password Input -->
          <div>
            <Input
              v-model="password"
              type="password"
              label="パスワード"
              placeholder="パスワードを入力"
              required
              :disabled="loading"
            />
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
            :disabled="!email || !password || loading"
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
const email = ref('');
const password = ref('');

// Auth composable
const { login, loading, error, isAuthenticated } = useAuth();

// ログイン処理
const handleLogin = async () => {
  const success = await login(email.value, password.value);

  if (success) {
    // ログイン成功時はダッシュボードまたはレポート一覧にリダイレクト
    await navigateTo('/reports');
  }
};

// 既にログイン済みの場合はリダイレクト
watchEffect(() => {
  if (isAuthenticated.value) {
    navigateTo('/reports');
  }
});

// Meta
useHead({
  title: 'ログイン - インシデント報告システム',
});

// レイアウトを無効化（ログイン画面は独立したレイアウト）
definePageMeta({
  layout: false,
});
</script>
