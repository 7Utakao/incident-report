<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- ヘッダー -->
      <div class="mb-8">
        <div class="flex justify-between items-center">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">インシデントレポート一覧</h1>
            <p class="mt-1 text-sm text-gray-600">
              チームのインシデントレポートを確認・検索できます
            </p>
          </div>
          <NuxtLink
            to="/reports/new"
            class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusIcon class="h-4 w-4 mr-2" />
            新規作成
          </NuxtLink>
        </div>
      </div>

      <!-- フィルター -->
      <div class="bg-white shadow rounded-lg mb-6">
        <div class="p-6">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <!-- カテゴリフィルター -->
            <div>
              <label for="category" class="block text-sm font-medium text-gray-700 mb-2">
                カテゴリ
              </label>
              <select
                id="category"
                v-model="filters.category"
                @change="loadReports"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">すべて</option>
                <option value="技術的知識不足">技術的知識不足</option>
                <option value="環境設定ミス">環境設定ミス</option>
                <option value="コミュニケーション不足">コミュニケーション不足</option>
                <option value="工数/スケジュール管理">工数/スケジュール管理</option>
                <option value="要件定義・仕様理解">要件定義・仕様理解</option>
                <option value="その他">その他</option>
              </select>
            </div>

            <!-- 期間フィルター -->
            <div>
              <label for="period" class="block text-sm font-medium text-gray-700 mb-2">
                期間
              </label>
              <select
                id="period"
                v-model="filters.period"
                @change="updateDateRange"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">すべて</option>
                <option value="today">今日</option>
                <option value="week">今週</option>
                <option value="month">今月</option>
                <option value="quarter">今四半期</option>
              </select>
            </div>

            <!-- キーワード検索 -->
            <div>
              <label for="keyword" class="block text-sm font-medium text-gray-700 mb-2">
                キーワード
              </label>
              <div class="relative">
                <input
                  id="keyword"
                  v-model="filters.keyword"
                  @input="debounceSearch"
                  type="text"
                  placeholder="タイトル、本文、タグで検索"
                  class="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <MagnifyingGlassIcon class="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ローディング -->
      <div v-if="loading" class="flex justify-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>

      <!-- エラー表示 -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
        <div class="flex">
          <ExclamationTriangleIcon class="h-5 w-5 text-red-400" />
          <div class="ml-3">
            <p class="text-sm text-red-700">{{ error }}</p>
          </div>
        </div>
      </div>

      <!-- レポート一覧 -->
      <div v-else-if="reports.length > 0" class="space-y-4">
        <div
          v-for="report in reports"
          :key="report.reportId"
          class="bg-white shadow rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
          @click="viewReport(report)"
        >
          <div class="flex justify-between items-start mb-3">
            <h3 class="text-lg font-medium text-gray-900 line-clamp-2">
              {{ report.title }}
            </h3>
            <span
              class="ml-4 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 flex-shrink-0"
            >
              {{ report.category }}
            </span>
          </div>

          <p class="text-sm text-gray-600 mb-4 line-clamp-3">
            {{ report.aiResult.summary }}
          </p>

          <div class="flex items-center justify-between">
            <div class="flex flex-wrap gap-1">
              <span
                v-for="tag in report.tags.slice(0, 3)"
                :key="tag"
                class="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800"
              >
                {{ tag }}
              </span>
              <span
                v-if="report.tags.length > 3"
                class="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800"
              >
                +{{ report.tags.length - 3 }}
              </span>
            </div>

            <div class="flex items-center text-sm text-gray-500">
              <CalendarIcon class="h-4 w-4 mr-1" />
              {{ formatDate(report.createdAt) }}
            </div>
          </div>
        </div>

        <!-- ページネーション（簡易版） -->
        <div v-if="reports.length >= 20" class="flex justify-center pt-6">
          <button
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            さらに読み込む
          </button>
        </div>
      </div>

      <!-- 空の状態 -->
      <div v-else class="text-center py-12">
        <DocumentTextIcon class="mx-auto h-12 w-12 text-gray-400" />
        <h3 class="mt-2 text-sm font-medium text-gray-900">レポートがありません</h3>
        <p class="mt-1 text-sm text-gray-500">
          {{
            filters.category || filters.keyword
              ? '検索条件に一致するレポートが見つかりませんでした。'
              : '最初のインシデントレポートを作成してみましょう。'
          }}
        </p>
        <div class="mt-6">
          <NuxtLink
            to="/reports/new"
            class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusIcon class="h-4 w-4 mr-2" />
            新規作成
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- レポート詳細モーダル -->
    <TransitionRoot as="template" :show="showDetailModal">
      <Dialog as="div" class="relative z-10" @close="closeDetailModal">
        <TransitionChild
          as="template"
          enter="ease-out duration-300"
          enter-from="opacity-0"
          enter-to="opacity-100"
          leave="ease-in duration-200"
          leave-from="opacity-100"
          leave-to="opacity-0"
        >
          <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </TransitionChild>

        <div class="fixed inset-0 z-10 overflow-y-auto">
          <div
            class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0"
          >
            <TransitionChild
              as="template"
              enter="ease-out duration-300"
              enter-from="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enter-to="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leave-from="opacity-100 translate-y-0 sm:scale-100"
              leave-to="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <DialogPanel
                class="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-4xl sm:p-6"
              >
                <div v-if="selectedReport">
                  <div class="flex justify-between items-start mb-4">
                    <DialogTitle as="h3" class="text-lg font-semibold leading-6 text-gray-900">
                      {{ selectedReport.title }}
                    </DialogTitle>
                    <button
                      type="button"
                      class="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      @click="closeDetailModal"
                    >
                      <XMarkIcon class="h-6 w-6" />
                    </button>
                  </div>

                  <div class="space-y-6">
                    <!-- メタ情報 -->
                    <div class="flex items-center space-x-4 text-sm text-gray-500">
                      <div class="flex items-center">
                        <CalendarIcon class="h-4 w-4 mr-1" />
                        {{ formatDate(selectedReport.createdAt) }}
                      </div>
                      <span
                        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {{ selectedReport.category }}
                      </span>
                    </div>

                    <!-- 本文 -->
                    <div>
                      <h4 class="text-sm font-medium text-gray-700 mb-2">本文</h4>
                      <div class="bg-gray-50 rounded-lg p-4">
                        <p class="text-sm text-gray-900 whitespace-pre-wrap">
                          {{ selectedReport.body }}
                        </p>
                      </div>
                    </div>

                    <!-- AI処理結果 -->
                    <div>
                      <h4 class="text-sm font-medium text-gray-700 mb-2">AI分析結果</h4>
                      <div class="bg-gray-50 rounded-lg p-4 space-y-3">
                        <div>
                          <h5 class="text-xs font-medium text-gray-600 mb-1">要約</h5>
                          <p class="text-sm text-gray-900">{{ selectedReport.aiResult.summary }}</p>
                        </div>

                        <div>
                          <h5 class="text-xs font-medium text-gray-600 mb-1">タグ</h5>
                          <div class="flex flex-wrap gap-1">
                            <span
                              v-for="tag in selectedReport.tags"
                              :key="tag"
                              class="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800"
                            >
                              {{ tag }}
                            </span>
                          </div>
                        </div>

                        <div v-if="selectedReport.aiResult.suggestedReplacements.length > 0">
                          <h5 class="text-xs font-medium text-gray-600 mb-1">匿名化処理</h5>
                          <div class="space-y-1">
                            <div
                              v-for="replacement in selectedReport.aiResult.suggestedReplacements"
                              :key="replacement.from"
                              class="text-xs text-gray-600"
                            >
                              「{{ replacement.from }}」→「{{ replacement.to }}」
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>
  </div>
</template>

<script setup lang="ts">
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  ExclamationTriangleIcon,
  CalendarIcon,
  DocumentTextIcon,
  XMarkIcon,
} from '@heroicons/vue/24/outline';
import { useRuntimeConfig } from 'nuxt/app';
import { reactive, ref, onMounted } from 'vue';

// メタデータ
definePageMeta({
  title: 'レポート一覧',
});

// 型定義
interface Report {
  reportId: string;
  title: string;
  body: string;
  aiResult: {
    summary: string;
    tags: string[];
    category: string;
    anonymizedText: string;
    suggestedReplacements: Array<{ from: string; to: string }>;
  };
  createdAt: string;
  category: string;
  tags: string[];
}

// リアクティブデータ
const reports = ref<Report[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);
const showDetailModal = ref(false);
const selectedReport = ref<Report | null>(null);

const filters = reactive({
  category: '',
  period: 'month',
  keyword: '',
});

// 設定
const config = useRuntimeConfig();
const { getIdToken } = useIdToken();

// 検索のデバウンス
let searchTimeout: ReturnType<typeof setTimeout> | undefined = undefined;
const debounceSearch = () => {
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }
  searchTimeout = setTimeout(() => {
    loadReports();
  }, 500);
};

// 期間フィルターの更新
const updateDateRange = () => {
  loadReports();
};

// レポート一覧の読み込み
const loadReports = async () => {
  try {
    loading.value = true;
    error.value = null;

    // IDトークン取得
    const token = await getIdToken();

    // クエリパラメータの構築
    const params = new URLSearchParams();
    if (filters.category) params.append('category', filters.category);
    if (filters.keyword) params.append('q', filters.keyword);

    // 期間フィルター
    if (filters.period !== 'all') {
      const now = new Date();
      let from: Date;

      switch (filters.period) {
        case 'today':
          from = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'week':
          from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          from = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'quarter':
          const quarter = Math.floor(now.getMonth() / 3);
          from = new Date(now.getFullYear(), quarter * 3, 1);
          break;
        default:
          from = new Date(0);
      }

      params.append('from', from.toISOString());
      params.append('to', now.toISOString());
    }

    const queryString = params.toString();
    const url = `${config.public.apiUrl}/reports${queryString ? `?${queryString}` : ''}`;

    const response = await $fetch<{ reports: Report[]; count: number }>(url, {
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
      },
    });

    reports.value = response.reports;
  } catch (err: any) {
    console.error('レポート取得エラー:', err);
    error.value = err.message || 'レポートの取得に失敗しました';
  } finally {
    loading.value = false;
  }
};

// レポート詳細表示
const viewReport = (report: Report) => {
  selectedReport.value = report;
  showDetailModal.value = true;
};

// 詳細モーダルを閉じる
const closeDetailModal = () => {
  showDetailModal.value = false;
  selectedReport.value = null;
};

// 日付フォーマット
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// 初期読み込み
onMounted(() => {
  loadReports();
});
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
