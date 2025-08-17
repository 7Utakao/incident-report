<template>
  <div class="min-h-screen bg-gray-50">
    <!-- ヒーローセクション -->
    <div class="bg-white">
      <div class="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div class="text-center">
          <h1 class="text-4xl font-extrabold text-gray-900 sm:text-5xl">Incident Report System</h1>
          <p class="mt-4 text-xl text-gray-600">
            チームのインシデントを記録・分析し、知見を共有するシステム
          </p>
          <div class="mt-8 flex justify-center space-x-4">
            <NuxtLink
              to="/reports/new"
              class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PlusIcon class="h-5 w-5 mr-2" />
              新規レポート作成
            </NuxtLink>
            <NuxtLink
              to="/reports"
              class="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <DocumentTextIcon class="h-5 w-5 mr-2" />
              レポート一覧
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>

    <!-- 機能紹介 -->
    <div class="py-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center">
          <h2 class="text-3xl font-extrabold text-gray-900">主な機能</h2>
          <p class="mt-4 text-lg text-gray-600">
            AIを活用したインシデント管理で、チームの学習と改善を支援します
          </p>
        </div>

        <div class="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <!-- AI分析 -->
          <div class="bg-white rounded-lg shadow p-6">
            <div
              class="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white mx-auto"
            >
              <CpuChipIcon class="h-6 w-6" />
            </div>
            <h3 class="mt-4 text-lg font-medium text-gray-900 text-center">AI自動分析</h3>
            <p class="mt-2 text-sm text-gray-600 text-center">
              レポート内容を自動分析し、カテゴリ分類・タグ付け・要約を生成します
            </p>
          </div>

          <!-- 匿名化 -->
          <div class="bg-white rounded-lg shadow p-6">
            <div
              class="flex items-center justify-center h-12 w-12 rounded-md bg-green-500 text-white mx-auto"
            >
              <ShieldCheckIcon class="h-6 w-6" />
            </div>
            <h3 class="mt-4 text-lg font-medium text-gray-900 text-center">自動匿名化</h3>
            <p class="mt-2 text-sm text-gray-600 text-center">
              個人名・顧客名・連絡先などの機密情報を自動検出・匿名化します
            </p>
          </div>

          <!-- 検索・フィルタ -->
          <div class="bg-white rounded-lg shadow p-6">
            <div
              class="flex items-center justify-center h-12 w-12 rounded-md bg-purple-500 text-white mx-auto"
            >
              <MagnifyingGlassIcon class="h-6 w-6" />
            </div>
            <h3 class="mt-4 text-lg font-medium text-gray-900 text-center">高度な検索</h3>
            <p class="mt-2 text-sm text-gray-600 text-center">
              カテゴリ・期間・キーワードでレポートを効率的に検索・絞り込みできます
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- 統計情報（モック） -->
    <div class="bg-white py-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center">
          <h2 class="text-3xl font-extrabold text-gray-900">システム統計</h2>
        </div>

        <div class="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div class="bg-gray-50 overflow-hidden shadow rounded-lg">
            <div class="p-5">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <DocumentTextIcon class="h-6 w-6 text-gray-400" />
                </div>
                <div class="ml-5 w-0 flex-1">
                  <dl>
                    <dt class="text-sm font-medium text-gray-500 truncate">総レポート数</dt>
                    <dd class="text-lg font-medium text-gray-900">{{ stats.totalReports }}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-gray-50 overflow-hidden shadow rounded-lg">
            <div class="p-5">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <CalendarIcon class="h-6 w-6 text-gray-400" />
                </div>
                <div class="ml-5 w-0 flex-1">
                  <dl>
                    <dt class="text-sm font-medium text-gray-500 truncate">今月のレポート</dt>
                    <dd class="text-lg font-medium text-gray-900">{{ stats.thisMonth }}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-gray-50 overflow-hidden shadow rounded-lg">
            <div class="p-5">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <TagIcon class="h-6 w-6 text-gray-400" />
                </div>
                <div class="ml-5 w-0 flex-1">
                  <dl>
                    <dt class="text-sm font-medium text-gray-500 truncate">人気のカテゴリ</dt>
                    <dd class="text-lg font-medium text-gray-900">{{ stats.topCategory }}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-gray-50 overflow-hidden shadow rounded-lg">
            <div class="p-5">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <ShieldCheckIcon class="h-6 w-6 text-gray-400" />
                </div>
                <div class="ml-5 w-0 flex-1">
                  <dl>
                    <dt class="text-sm font-medium text-gray-500 truncate">匿名化処理</dt>
                    <dd class="text-lg font-medium text-gray-900">{{ stats.anonymized }}%</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- CTA セクション -->
    <div class="bg-blue-600">
      <div
        class="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between"
      >
        <h2 class="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          <span class="block">インシデントを記録して</span>
          <span class="block text-blue-200">チームの知見を共有しましょう</span>
        </h2>
        <div class="mt-8 flex lg:mt-0 lg:flex-shrink-0">
          <div class="inline-flex rounded-md shadow">
            <NuxtLink
              to="/reports/new"
              class="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50"
            >
              今すぐ始める
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  PlusIcon,
  DocumentTextIcon,
  CpuChipIcon,
  ShieldCheckIcon,
  MagnifyingGlassIcon,
  CalendarIcon,
  TagIcon,
} from '@heroicons/vue/24/outline';

// メタデータ
definePageMeta({
  title: 'ホーム',
});

// モック統計データ
const stats = reactive({
  totalReports: 156,
  thisMonth: 23,
  topCategory: '環境設定ミス',
  anonymized: 87,
});

// 実際の統計データを取得する場合の例
// const loadStats = async () => {
//   try {
//     const config = useRuntimeConfig();
//     const { getIdToken } = useIdToken();
//     const token = await getIdToken();
//
//     const response = await $fetch(`${config.public.apiUrl}/stats`, {
//       headers: {
//         'Authorization': token ? `Bearer ${token}` : ''
//       }
//     });
//
//     Object.assign(stats, response);
//   } catch (error) {
//     console.error('統計データ取得エラー:', error);
//   }
// };

// onMounted(() => {
//   loadStats();
// });
</script>
