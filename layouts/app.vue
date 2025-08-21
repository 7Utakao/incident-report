<template>
  <div class="min-h-screen bg-gradient-to-b from-primary/40 via-white to-white">
    <!-- サイドナビゲーション -->
    <aside
      v-if="isAuthenticated"
      class="fixed inset-y-0 left-0 z-50 w-64 bg-primaryDeep text-white shadow-elev transform -translate-x-full lg:translate-x-0 transition-transform duration-200 ease-in-out"
      :class="{ 'translate-x-0': sidebarOpen }"
    >
      <div class="flex items-center justify-between h-16 px-6 border-b border-white/20">
        <h1 class="text-xl font-bold text-white">報告システム</h1>
        <button @click="sidebarOpen = false" class="lg:hidden text-white/70 hover:text-white">
          <XMarkIcon class="h-6 w-6" />
        </button>
      </div>

      <nav class="mt-6 px-3">
        <div class="space-y-1">
          <NuxtLink
            to="/"
            class="flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors"
            :class="
              $route.path === '/'
                ? 'bg-white/10 text-white'
                : 'text-white/70 hover:bg-white/10 hover:text-white'
            "
          >
            <HomeIcon class="mr-3 h-5 w-5 opacity-90" />
            ホーム
          </NuxtLink>

          <NuxtLink
            to="/reports"
            class="flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors"
            :class="
              $route.path.startsWith('/reports')
                ? 'bg-white/10 text-white'
                : 'text-white/70 hover:bg-white/10 hover:text-white'
            "
          >
            <DocumentTextIcon class="mr-3 h-5 w-5 opacity-90" />
            報告一覧
          </NuxtLink>

          <NuxtLink
            to="/reports/new"
            class="flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors"
            :class="
              $route.path === '/reports/new'
                ? 'bg-white/10 text-white'
                : 'text-white/70 hover:bg-white/10 hover:text-white'
            "
          >
            <PlusIcon class="mr-3 h-5 w-5 opacity-90" />
            新規作成
          </NuxtLink>

          <NuxtLink
            to="/dashboard"
            class="flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors"
            :class="
              $route.path === '/dashboard'
                ? 'bg-white/10 text-white'
                : 'text-white/70 hover:bg-white/10 hover:text-white'
            "
          >
            <ChartBarIcon class="mr-3 h-5 w-5 opacity-90" />
            ダッシュボード
          </NuxtLink>
        </div>
      </nav>
    </aside>

    <!-- メインコンテンツ -->
    <div :class="isAuthenticated ? 'lg:pl-64' : ''">
      <!-- トップバー -->
      <header v-if="isAuthenticated" class="bg-surface shadow-sm border-b border-primary/20">
        <div class="flex items-center justify-between h-16 px-4 sm:px-6">
          <div class="flex items-center">
            <button @click="sidebarOpen = true" class="lg:hidden text-ink/60 hover:text-ink">
              <Bars3Icon class="h-6 w-6" />
            </button>

            <!-- 検索バー -->
            <div class="ml-4 flex-1 max-w-md">
              <div class="relative">
                <MagnifyingGlassIcon
                  class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-ink/40"
                />
                <input
                  type="text"
                  placeholder="検索..."
                  class="w-full pl-10 pr-4 py-2 border border-primary/25 rounded-md bg-surface text-ink placeholder-ink/40 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>
            </div>
          </div>

          <div class="flex items-center space-x-4">
            <!-- ユーザー情報表示 -->
            <div v-if="user" class="text-sm text-ink/70">
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
          </div>
        </div>
      </header>

      <!-- ページコンテンツ -->
      <main :class="isAuthenticated ? 'p-6' : ''">
        <slot />
      </main>
    </div>

    <!-- サイドバーオーバーレイ (モバイル) -->
    <div
      v-if="sidebarOpen"
      @click="sidebarOpen = false"
      class="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
    ></div>
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
  MagnifyingGlassIcon,
  PlusIcon,
} from '@heroicons/vue/24/outline';

const { user, logout, isAuthenticated, checkAuthStatus } = useAuth();
const route = useRoute();
const sidebarOpen = ref(false);

const handleSignOut = async () => {
  try {
    await logout();
  } catch (error) {
    console.error('Sign out error:', error);
  }
};

// 認証状態をチェック
onMounted(async () => {
  if (process.client) {
    try {
      const isAuth = await checkAuthStatus();
      if (!isAuth && !route.path.includes('/login')) {
        await navigateTo('/login');
      }
    } catch (error) {
      console.error('認証チェックエラー:', error);
      if (!route.path.includes('/login')) {
        await navigateTo('/login');
      }
    }
  }
});

// 認証状態の変化を監視
watch(isAuthenticated, (newValue) => {
  if (!newValue && !route.path.includes('/login')) {
    navigateTo('/login');
  }
});
</script>
