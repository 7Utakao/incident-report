<template>
  <div
    class="min-h-screen bg-gradient-to-br from-primary/5 to-accent1/10 flex items-center justify-center p-4"
  >
    <div class="card max-w-md w-full p-8 text-center">
      <div class="mb-8">
        <div
          class="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <svg class="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
        </div>
        <h1 class="text-2xl font-bold text-primaryDeep mb-2">ログイン</h1>
        <p class="text-primaryDeep/70">報告システムにサインインしてください</p>
      </div>

      <div class="space-y-6">
        <button @click="handleSignIn" :disabled="loading" class="btn btn-primary w-full">
          <span v-if="loading" class="inline-flex items-center">
            <svg
              class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              ></circle>
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            サインイン中...
          </span>
          <span v-else>AWS Cognitoでサインイン</span>
        </button>
      </div>

      <div v-if="error" class="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
        <p class="text-sm text-red-600">{{ error }}</p>
      </div>

      <div class="mt-6 pt-6 border-t border-primary/10">
        <p class="text-sm text-primaryDeep/70">
          アカウントをお持ちでない場合は、管理者にお問い合わせください。
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'auth',
});

const { signInWithHostedUI, isAuthenticated, checkAuthState } = useAuth();
const loading = ref(false);
const error = ref('');

const handleSignIn = async () => {
  loading.value = true;
  error.value = '';

  try {
    await signInWithHostedUI();
  } catch (err: any) {
    console.error('Sign in error:', err);
    error.value = 'サインインに失敗しました。もう一度お試しください。';
  } finally {
    loading.value = false;
  }
};

// 認証状態をチェックして、既にログイン済みの場合はリダイレクト
onMounted(async () => {
  if (process.client) {
    const isAuth = await checkAuthState();
    if (isAuth) {
      await navigateTo('/');
    }
  }
});

// 認証状態の変化を監視
watch(isAuthenticated, (newValue) => {
  if (newValue) {
    navigateTo('/');
  }
});

useHead({
  title: 'ログイン - 報告システム',
});
</script>
