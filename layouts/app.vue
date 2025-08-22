<template>
  <div class="min-h-screen bg-gradient-to-b from-primary/40 via-white to-white">
    <!-- レスポンシブヘッダー -->
    <header
      v-if="isAuthenticated"
      class="bg-sky-100 shadow-sm border-b border-primary/20 sticky top-0 z-50"
    >
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <!-- ロゴ・タイトル -->
          <div class="flex items-center">
            <h1 class="text-xl font-bold text-primaryDeep">報告システム</h1>
          </div>

          <!-- デスクトップナビゲーション (lg以上) -->
          <nav class="hidden lg:flex lg:items-center lg:space-x-8">
            <NuxtLink
              to="/"
              class="flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors"
              :class="
                $route.path === '/'
                  ? 'bg-primaryDeep/10 text-primaryDeep'
                  : 'text-ink/70 hover:bg-primaryDeep/10 hover:text-primaryDeep'
              "
            >
              <HomeIcon class="mr-2 h-4 w-4" />
              ホーム
            </NuxtLink>

            <NuxtLink
              to="/reports"
              class="flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors"
              :class="
                $route.path.startsWith('/reports')
                  ? 'bg-primaryDeep/10 text-primaryDeep'
                  : 'text-ink/70 hover:bg-primaryDeep/10 hover:text-primaryDeep'
              "
            >
              <DocumentTextIcon class="mr-2 h-4 w-4" />
              報告一覧
            </NuxtLink>

            <NuxtLink
              to="/reports/new"
              class="flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors"
              :class="
                $route.path === '/reports/new'
                  ? 'bg-primaryDeep/10 text-primaryDeep'
                  : 'text-ink/70 hover:bg-primaryDeep/10 hover:text-primaryDeep'
              "
            >
              <PlusIcon class="mr-2 h-4 w-4" />
              新規作成
            </NuxtLink>

            <NuxtLink
              to="/dashboard"
              class="flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors"
              :class="
                $route.path === '/dashboard'
                  ? 'bg-primaryDeep/10 text-primaryDeep'
                  : 'text-ink/70 hover:bg-primaryDeep/10 hover:text-primaryDeep'
              "
            >
              <ChartBarIcon class="mr-2 h-4 w-4" />
              ダッシュボード
            </NuxtLink>
          </nav>

          <!-- 右側のユーザーメニューとハンバーガーボタン -->
          <div class="flex items-center space-x-4">
            <!-- ユーザー情報表示 (デスクトップのみ) -->
            <div v-if="user" class="hidden sm:block text-sm text-ink/70">
              {{ user.username }}
            </div>

            <!-- ユーザーメニュー -->
            <div v-if="isAuthenticated" class="relative">
              <Menu as="div" class="relative">
                <MenuButton
                  class="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <div
                    class="h-8 w-8 rounded-full bg-accent1 hover:bg-accent1/90 flex items-center justify-center transition-colors"
                  >
                    <UserIcon class="h-5 w-5 text-ink" />
                  </div>
                </MenuButton>
                <transition
                  enter-active-class="transition ease-out duration-100"
                  enter-from-class="transform opacity-0 scale-95"
                  enter-to-class="transform opacity-100 scale-100"
                  leave-active-class="transition ease-in duration-75"
                  leave-from-class="transform opacity-100 scale-100"
                  leave-to-class="transform opacity-0 scale-95"
                >
                  <MenuItems
                    class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                  >
                    <div class="py-1">
                      <MenuItem v-slot="{ active }">
                        <button
                          @click="handleSignOut"
                          :class="[
                            active ? 'bg-gray-100' : '',
                            'block w-full text-left px-4 py-2 text-sm text-gray-700',
                          ]"
                        >
                          ログアウト
                        </button>
                      </MenuItem>
                    </div>
                  </MenuItems>
                </transition>
              </Menu>
            </div>

            <!-- ハンバーガーメニューボタン (タブレット・モバイル) -->
            <button
              @click="mobileMenuOpen = !mobileMenuOpen"
              class="lg:hidden text-ink/60 hover:text-ink"
            >
              <Bars3Icon v-if="!mobileMenuOpen" class="h-6 w-6" />
              <XMarkIcon v-else class="h-6 w-6" />
            </button>
          </div>
        </div>

        <!-- モバイル・タブレットナビゲーション -->
        <div v-if="mobileMenuOpen" class="lg:hidden border-t border-primary/20 bg-sky-50">
          <div class="px-2 pt-2 pb-3 space-y-1">
            <NuxtLink
              to="/"
              @click="mobileMenuOpen = false"
              class="flex items-center px-3 py-2 text-base font-medium rounded-md transition-colors"
              :class="
                $route.path === '/'
                  ? 'bg-primaryDeep/10 text-primaryDeep'
                  : 'text-ink/70 hover:bg-primaryDeep/10 hover:text-primaryDeep'
              "
            >
              <HomeIcon class="mr-3 h-5 w-5" />
              ホーム
            </NuxtLink>

            <NuxtLink
              to="/reports"
              @click="mobileMenuOpen = false"
              class="flex items-center px-3 py-2 text-base font-medium rounded-md transition-colors"
              :class="
                $route.path.startsWith('/reports')
                  ? 'bg-primaryDeep/10 text-primaryDeep'
                  : 'text-ink/70 hover:bg-primaryDeep/10 hover:text-primaryDeep'
              "
            >
              <DocumentTextIcon class="mr-3 h-5 w-5" />
              報告一覧
            </NuxtLink>

            <NuxtLink
              to="/reports/new"
              @click="mobileMenuOpen = false"
              class="flex items-center px-3 py-2 text-base font-medium rounded-md transition-colors"
              :class="
                $route.path === '/reports/new'
                  ? 'bg-primaryDeep/10 text-primaryDeep'
                  : 'text-ink/70 hover:bg-primaryDeep/10 hover:text-primaryDeep'
              "
            >
              <PlusIcon class="mr-3 h-5 w-5" />
              新規作成
            </NuxtLink>

            <NuxtLink
              to="/dashboard"
              @click="mobileMenuOpen = false"
              class="flex items-center px-3 py-2 text-base font-medium rounded-md transition-colors"
              :class="
                $route.path === '/dashboard'
                  ? 'bg-primaryDeep/10 text-primaryDeep'
                  : 'text-ink/70 hover:bg-primaryDeep/10 hover:text-primaryDeep'
              "
            >
              <ChartBarIcon class="mr-3 h-5 w-5" />
              ダッシュボード
            </NuxtLink>
          </div>
        </div>
      </div>
    </header>

    <!-- メインコンテンツ -->
    <main :class="isAuthenticated ? 'p-6' : ''">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/vue';
import {
  HomeIcon,
  DocumentTextIcon,
  ChartBarIcon,
  UserIcon,
  Bars3Icon,
  XMarkIcon,
  PlusIcon,
} from '@heroicons/vue/24/outline';

const { user, logout, isAuthenticated, checkAuthStatus } = useAuth();
const route = useRoute();
const sidebarOpen = ref(false);
const mobileMenuOpen = ref(false);

const handleSignOut = async () => {
  try {
    await logout();
  } catch (error) {
    console.error('Sign out error:', error);
  }
};

// 初期化時に認証状態をチェック
onMounted(async () => {
  if (process.client) {
    await checkAuthStatus();
  }
});
</script>
