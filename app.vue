<template>
  <div>
    <!-- ナビゲーション -->
    <nav class="bg-white shadow">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex">
            <div class="flex-shrink-0 flex items-center">
              <NuxtLink to="/" class="text-xl font-bold text-gray-900">
                Incident Report System
              </NuxtLink>
            </div>
            <div class="hidden sm:ml-6 sm:flex sm:space-x-8">
              <NuxtLink
                to="/reports"
                class="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                active-class="border-blue-500 text-gray-900"
              >
                レポート一覧
              </NuxtLink>
              <NuxtLink
                to="/reports/new"
                class="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                active-class="border-blue-500 text-gray-900"
              >
                新規作成
              </NuxtLink>
            </div>
          </div>

          <!-- 認証状態表示 -->
          <div class="flex items-center">
            <div v-if="authLoading" class="text-sm text-gray-500">認証確認中...</div>
            <div v-else-if="isAuthenticated" class="text-sm text-gray-700">ログイン済み</div>
            <div v-else class="text-sm text-gray-500">未認証（デモモード）</div>
          </div>
        </div>
      </div>
    </nav>

    <!-- メインコンテンツ -->
    <main>
      <NuxtPage />
    </main>

    <!-- フッター -->
    <footer class="bg-white border-t border-gray-200 mt-12">
      <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <p class="text-center text-sm text-gray-500">
          © 2024 Incident Report System. All rights reserved.
        </p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
// 認証状態の監視
const { isAuthenticated, loading: authLoading } = useIdToken();

// メタデータ
useHead({
  title: 'Incident Report System',
  meta: [{ name: 'description', content: 'チーム向けインシデント管理システム' }],
});
</script>
