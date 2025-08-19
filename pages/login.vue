<template>
  <div
    class="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center px-4 sm:px-6 lg:px-8"
  >
    <div class="max-w-md w-full space-y-8">
      <!-- Header -->
      <div class="text-center">
        <div
          class="mx-auto h-16 w-16 bg-primary-500 rounded-full flex items-center justify-center mb-4"
        >
          <div class="text-2xl text-white">📊</div>
        </div>
        <h2 class="text-3xl font-bold text-secondary">ログイン</h2>
        <p class="mt-2 text-gray">インシデント報告システムにアクセス</p>
      </div>

      <!-- Login Form -->
      <Card class="p-8">
        <form @submit.prevent="handleLogin" class="space-y-6">
          <!-- Email -->
          <div>
            <Input
              v-model="email"
              type="email"
              label="メールアドレス"
              placeholder="your-email@example.com"
              required
              :error="emailError"
            />
          </div>

          <!-- Password -->
          <div>
            <Input
              v-model="password"
              type="password"
              label="パスワード"
              placeholder="パスワードを入力"
              required
              :error="passwordError"
            />
          </div>

          <!-- Remember Me -->
          <div class="flex items-center">
            <input
              id="remember-me"
              v-model="rememberMe"
              type="checkbox"
              class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label for="remember-me" class="ml-2 block text-sm text-gray">
              ログイン状態を保持する
            </label>
          </div>

          <!-- Submit Button -->
          <Button
            type="submit"
            variant="primary"
            size="lg"
            class="w-full"
            :loading="loading"
            :disabled="!isFormValid"
          >
            ログイン
          </Button>

          <!-- Demo Info -->
          <div class="mt-6 p-4 bg-primary-50 rounded-token-md">
            <p class="text-sm text-gray text-center">
              <strong>デモ用:</strong> 任意のメールアドレスとパスワードを入力してください
            </p>
          </div>
        </form>
      </Card>

      <!-- Footer -->
      <div class="text-center text-sm text-gray">
        <p>© 2024 インシデント報告システム</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

// Components
import Card from '~/components/ui/Card.vue';
import Button from '~/components/ui/Button.vue';
import Input from '~/components/ui/Input.vue';

// Reactive data
const email = ref('');
const password = ref('');
const rememberMe = ref(false);
const loading = ref(false);
const emailError = ref('');
const passwordError = ref('');

// Computed
const isFormValid = computed(() => {
  return email.value.trim() && password.value.trim();
});

// Methods
const handleLogin = async () => {
  // Reset errors
  emailError.value = '';
  passwordError.value = '';

  // Basic validation
  if (!email.value.trim()) {
    emailError.value = 'メールアドレスを入力してください';
    return;
  }

  if (!password.value.trim()) {
    passwordError.value = 'パスワードを入力してください';
    return;
  }

  try {
    loading.value = true;

    // Mock login delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Simple demo authentication - any email/password combination works
    if (email.value.includes('@') && password.value.length > 0) {
      // Store login state (in a real app, this would be handled by proper auth)
      if (process.client) {
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userEmail', email.value);
        if (rememberMe.value) {
          localStorage.setItem('rememberLogin', 'true');
        }
      }

      // Redirect to home page
      await navigateTo('/');
    } else {
      emailError.value = 'メールアドレスの形式が正しくありません';
    }
  } catch (error) {
    console.error('Login error:', error);
    emailError.value = 'ログインに失敗しました';
  } finally {
    loading.value = false;
  }
};

// Check if already logged in
onMounted(() => {
  if (process.client) {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (isLoggedIn === 'true') {
      navigateTo('/');
    }
  }
});

// Meta
useHead({
  title: 'ログイン - インシデント報告システム',
});

// Layout
definePageMeta({
  layout: false,
});
</script>
