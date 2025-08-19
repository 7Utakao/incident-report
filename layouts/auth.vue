<template>
  <div
    class="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8"
  >
    <div class="max-w-md w-full space-y-8">
      <div>
        <div
          class="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900"
        >
          <DocumentTextIcon class="h-8 w-8 text-blue-600 dark:text-blue-400" />
        </div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
          Incident Report System
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          チーム向けインシデント管理システム
        </p>
      </div>

      <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-8">
        <slot />
      </div>

      <!-- ダークモード切替 -->
      <div class="flex justify-center">
        <button
          @click="toggleDarkMode"
          class="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <SunIcon v-if="isDark" class="h-5 w-5" />
          <MoonIcon v-else class="h-5 w-5" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { DocumentTextIcon, SunIcon, MoonIcon } from '@heroicons/vue/24/outline';

const isDark = ref(false);

const toggleDarkMode = () => {
  isDark.value = !isDark.value;
  if (isDark.value) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
};

// 初期化時にダークモードの状態を確認
onMounted(() => {
  isDark.value = document.documentElement.classList.contains('dark');
});
</script>
