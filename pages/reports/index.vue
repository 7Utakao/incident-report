<template>
  <div class="min-h-screen bg-slate-50">
    <div class="max-w-7xl mx-auto px-6 py-8">
      <!-- Header -->
      <header class="mb-6">
        <h1 class="text-2xl font-bold text-slate-900">報告一覧</h1>
        <p class="text-slate-500 mt-1">報告された内容の検索ができます</p>
      </header>

      <!-- Filters -->
      <section class="bg-white rounded-2xl border p-4 md:p-6 mb-6 shadow-sm">
        <form class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4 items-end">
          <!-- キーワード検索 -->
          <label class="relative md:col-span-1 lg:col-span-1">
            <div class="mt-0 md:mt-[1.375rem] relative">
              <input
                v-model="filters.q"
                type="text"
                placeholder="タイトルや内容で検索…"
                class="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 pr-10 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
                @input="handleFilterChange"
              />
              <svg
                class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m21 21-3.6-3.6" />
              </svg>
            </div>
          </label>

          <!-- カテゴリ選択 -->
          <label class="relative md:col-span-1 lg:col-span-1">
            <div class="mt-0 md:mt-[1.375rem] relative">
              <select
                v-model="filters.category"
                class="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 pr-10 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 appearance-none"
                @change="handleFilterChange"
              >
                <option value="">カテゴリを選択</option>
                <option v-for="option in categoryOptions" :key="option.value" :value="option.value">
                  {{ option.label }}
                </option>
              </select>
              <svg
                class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
          </label>

          <!-- 開始日 -->
          <label class="relative md:col-span-1 lg:col-span-1">
            <span class="block text-xs font-medium text-slate-700 mb-1">開始日</span>
            <input
              v-model="filters.from"
              type="date"
              class="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
              @input="handleFilterChange"
            />
          </label>

          <!-- 終了日 -->
          <label class="relative md:col-span-1 lg:col-span-1">
            <span class="block text-xs font-medium text-slate-700 mb-1">終了日</span>
            <input
              v-model="filters.to"
              type="date"
              class="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
              @input="handleFilterChange"
            />
          </label>

          <!-- 検索・クリアボタン -->
          <div class="md:col-span-1 lg:col-span-1">
            <div class="mt-0 md:mt-[1.375rem] flex gap-2">
              <button
                type="button"
                class="flex-1 rounded-xl bg-emerald-600 text-white px-3 py-2.5 text-sm hover:bg-emerald-700 transition-colors"
                @click="fetchReports"
              >
                検索
              </button>
              <button
                type="button"
                class="flex-1 rounded-xl bg-white border border-slate-200 text-slate-700 px-3 py-2.5 text-sm hover:bg-slate-50 transition-colors"
                @click="clearFilters"
              >
                クリア
              </button>
            </div>
          </div>
        </form>

        <div class="mt-3 text-sm text-slate-500">
          {{ totalReports }} 件中 {{ filteredReports.length }} 件を表示
        </div>
      </section>

      <!-- Loading State -->
      <div
        v-if="loading"
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6"
      >
        <div v-for="i in 8" :key="i" class="bg-white rounded-2xl border p-4 animate-pulse">
          <div class="flex items-start justify-between gap-3 mb-2">
            <div class="h-4 bg-slate-200 rounded flex-1"></div>
            <div class="h-6 bg-slate-200 rounded-full w-20"></div>
          </div>
          <div class="space-y-2">
            <div class="h-3 bg-slate-200 rounded"></div>
            <div class="h-3 bg-slate-200 rounded w-3/4"></div>
          </div>
          <div class="mt-3 flex items-center justify-between">
            <div class="h-3 bg-slate-200 rounded w-24"></div>
            <div class="h-3 bg-slate-200 rounded w-12"></div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredReports.length === 0" class="text-center py-12">
        <div class="text-slate-400 text-lg mb-2">報告が見つかりません</div>
        <div class="text-slate-500 text-sm">検索条件を変更してお試しください</div>
      </div>

      <!-- Cards Grid -->
      <main
        v-else
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6"
      >
        <article
          v-for="report in paginatedReports"
          :key="report.id"
          class="bg-white rounded-2xl border p-4 hover:shadow-sm transition-shadow cursor-pointer"
          @click="handleRowClick(report)"
        >
          <div class="flex items-start justify-between gap-3">
            <h3 class="font-semibold text-slate-900 clamp-2">{{ report.title || '（無題）' }}</h3>
            <span
              :class="getCategoryColor(report.category)"
              class="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium shrink-0"
            >
              {{ getCategoryDisplayName(report.category) }}
            </span>
          </div>
          <p class="mt-2 text-sm text-slate-600 clamp-3">{{ report.summary || '概要なし' }}</p>
          <div class="mt-3 flex items-center justify-between text-xs text-slate-500">
            <span>{{ formatDate(report.createdAt) }}</span>
            <span class="text-emerald-700 hover:underline">詳細</span>
          </div>
        </article>
      </main>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="mt-8 flex justify-center">
        <Pagination
          :current-page="currentPage"
          :total-pages="totalPages"
          :total="filteredReports.length"
          :per-page="perPage"
          @page-change="handlePageChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

// Components
import Pagination from '~/components/ui/Pagination.vue';

// Types
interface Report {
  id: string;
  title: string;
  summary: string;
  category: string;
  createdAt: string;
}

interface Filters {
  q: string;
  category: string;
  from: string;
  to: string;
}

// Reactive data
const loading = ref(true);
const reports = ref<Report[]>([]);
const currentPage = ref(1);
const perPage = ref(12);

const filters = ref<Filters>({
  q: '',
  category: '',
  from: '',
  to: '',
});

// カテゴリオプション
import {
  getCategoryOptions,
  getCategoryDisplayName,
  getCategoryColorClasses,
} from '~/constants/categories';
const categoryOptions = getCategoryOptions();

// Computed
const totalReports = computed(() => reports.value.length);

const filteredReports = computed(() => {
  let filtered = reports.value;

  // Text search
  if (filters.value.q) {
    const query = filters.value.q.toLowerCase();
    filtered = filtered.filter(
      (report) =>
        report.title.toLowerCase().includes(query) || report.summary.toLowerCase().includes(query),
    );
  }

  // Category filter
  if (filters.value.category) {
    filtered = filtered.filter((report) => report.category === filters.value.category);
  }

  // Date range filter
  if (filters.value.from) {
    filtered = filtered.filter(
      (report) => new Date(report.createdAt) >= new Date(filters.value.from),
    );
  }

  if (filters.value.to) {
    filtered = filtered.filter(
      (report) => new Date(report.createdAt) <= new Date(filters.value.to + 'T23:59:59'),
    );
  }

  return filtered;
});

const totalPages = computed(() => {
  return Math.ceil(filteredReports.value.length / perPage.value);
});

const paginatedReports = computed(() => {
  const start = (currentPage.value - 1) * perPage.value;
  const end = start + perPage.value;
  return filteredReports.value.slice(start, end);
});

// Methods
const getCategoryColor = (category: string) => {
  const colors = getCategoryColorClasses(category);
  return `${colors.bg} ${colors.text}`;
};

const formatDate = (dateString: string) => {
  if (!dateString) return '';
  try {
    return format(new Date(dateString), 'yyyy/MM/dd', { locale: ja });
  } catch {
    return '';
  }
};

const handleFilterChange = () => {
  currentPage.value = 1; // Reset to first page when filters change
};

const handlePageChange = (page: number) => {
  currentPage.value = page;
};

const handleRowClick = (report: Report) => {
  navigateTo(`/reports/${report.id}`);
};

const clearFilters = () => {
  filters.value = {
    q: '',
    category: '',
    from: '',
    to: '',
  };
  handleFilterChange();
};

const fetchReports = async () => {
  try {
    loading.value = true;

    // 認証状態の確認
    const { isAuthenticated, getIdToken, checkAuthStatus } = useAuth();

    // 認証状態を再確認
    const authStatus = await checkAuthStatus();

    if (!authStatus) {
      await navigateTo('/login');
      return;
    }

    const token = await getIdToken();

    if (!token) {
      await navigateTo('/login');
      return;
    }

    const { reports: api } = useApi();

    const queryParams = {
      q: filters.value.q,
      category: filters.value.category,
      from: filters.value.from,
      to: filters.value.to,
    };

    const response = await api.list(queryParams);

    // APIレスポンスをUIで使用する形式に変換
    reports.value = response.items.map((item: any) => {
      return {
        id: item.reportId,
        title: item.title || '無題',
        summary: item.summary || item.body?.substring(0, 150) + '...' || '',
        category: item.category,
        createdAt: item.createdAt,
      };
    });
  } catch (error: any) {
    console.error('レポート取得エラー:', error);

    // エラー時は空配列を設定
    reports.value = [];

    // 認証関連エラーの詳細な判定
    const isAuthError =
      error.message?.includes('認証') ||
      error.message?.includes('JWT') ||
      error.message?.includes('Valid JWT token required') ||
      error.message?.includes('認証が必要です') ||
      error.status === 401 ||
      error.statusCode === 401;

    if (isAuthError) {
      await navigateTo('/login');
    }
  } finally {
    loading.value = false;
  }
};

// Watch for filter changes to reset pagination
watch(
  filters,
  () => {
    currentPage.value = 1;
  },
  { deep: true },
);

// Lifecycle
onMounted(() => {
  fetchReports();
});

// Meta
useHead({
  title: '報告一覧 - 報告システム',
});

// 認証ガード
definePageMeta({
  middleware: 'auth',
  layout: 'app',
});
</script>

<style scoped>
.clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
