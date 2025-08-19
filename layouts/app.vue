<template>
  <div
    class="min-h-screen bg-gradient-to-b from-primary/40 via-white to-white dark:from-primary/20 dark:via-gray-900 dark:to-gray-900"
  >
    <!-- サイドナビゲーション -->
    <aside
      class="fixed inset-y-0 left-0 z-50 w-64 bg-primaryDeep text-white shadow-elev transform -translate-x-full lg:translate-x-0 transition-transform duration-200 ease-in-out"
      :class="{ 'translate-x-0': sidebarOpen }"
    >
      <div class="flex items-center justify-between h-16 px-6 border-b border-white/20">
        <h1 class="text-xl font-bold text-white">Incident Report</h1>
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

          <NuxtLink
            to="/me"
            class="flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors"
            :class="
              $route.path === '/me'
                ? 'bg-white/10 text-white'
                : 'text-white/70 hover:bg-white/10 hover:text-white'
            "
          >
            <UserIcon class="mr-3 h-5 w-5 opacity-90" />
            マイページ
          </NuxtLink>

          <NuxtLink
            to="/admin"
            class="flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors"
            :class="
              $route.path.startsWith('/admin')
                ? 'bg-white/10 text-white'
                : 'text-white/70 hover:bg-white/10 hover:text-white'
            "
          >
            <CogIcon class="mr-3 h-5 w-5 opacity-90" />
            管理
          </NuxtLink>
        </div>
      </nav>
    </aside>

    <!-- メインコンテンツ -->
    <div class="lg:pl-64">
      <!-- トップバー -->
      <header
        class="bg-surface dark:bg-gray-800 shadow-sm border-b border-primary/20 dark:border-gray-700"
      >
        <div class="flex items-center justify-between h-16 px-4 sm:px-6">
          <div class="flex items-center">
            <button
              @click="sidebarOpen = true"
              class="lg:hidden text-ink/60 hover:text-ink dark:text-gray-400 dark:hover:text-gray-200"
            >
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
                  class="w-full pl-10 pr-4 py-2 border border-primary/25 dark:border-gray-600 rounded-md bg-surface dark:bg-gray-700 text-ink dark:text-white placeholder-ink/40 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>
            </div>
          </div>

          <div class="flex items-center space-x-4">
            <!-- ダークモード切替 -->
            <button
              @click="toggleDarkMode"
              class="p-2 text-ink/60 hover:text-ink dark:text-gray-400 dark:hover:text-gray-200 rounded-md hover:bg-primary/10 dark:hover:bg-gray-700"
            >
              <SunIcon v-if="isDark" class="h-5 w-5" />
              <MoonIcon v-else class="h-5 w-5" />
            </button>

            <!-- ユーザーメニュー -->
            <div class="relative">
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
                    class="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                  >
                    <div class="py-1">
                      <MenuItem v-slot="{ active }">
                        <NuxtLink
                          to="/me"
                          :class="[
                            active ? 'bg-gray-100 dark:bg-gray-700' : '',
                            'block px-4 py-2 text-sm text-gray-700 dark:text-gray-300',
                          ]"
                        >
                          プロフィール
                        </NuxtLink>
                      </MenuItem>
                      <MenuItem v-slot="{ active }">
                        <button
                          @click="logout"
                          :class="[
                            active ? 'bg-gray-100 dark:bg-gray-700' : '',
                            'block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300',
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
      <main class="p-6">
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
  CogIcon,
  Bars3Icon,
  XMarkIcon,
  MagnifyingGlassIcon,
  SunIcon,
  MoonIcon,
} from '@heroicons/vue/24/outline';

const sidebarOpen = ref(false);
const isDark = ref(false);

const toggleDarkMode = () => {
  isDark.value = !isDark.value;
  if (isDark.value) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
};

const logout = () => {
  // ログアウト処理（ダミー）
  console.log('Logout clicked');
};

// 初期化時にダークモードの状態を確認
onMounted(() => {
  isDark.value = document.documentElement.classList.contains('dark');
});
</script>
