<template>
  <div class="min-h-screen bg-background">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="flex justify-between items-center mb-8">
        <div>
          <h1 class="text-3xl font-bold text-secondary">{{ COPY.listTitle }}</h1>
          <p class="mt-2 text-gray">{{ COPY.listSubtitle }}</p>
          <!-- デバッグ情報 -->
          <div class="mt-2 text-xs text-gray-500 space-y-1">
            <div>
              認証状態: {{ debugInfo.isAuthenticated ? '✅ ログイン済み' : '❌ 未ログイン' }}
            </div>
            <div>トークン: {{ debugInfo.hasToken ? '✅ あり' : '❌ なし' }}</div>
            <div>最終取得: {{ debugInfo.lastFetch || '未取得' }}</div>
            <div>エラー: {{ debugInfo.lastError || 'なし' }}</div>
          </div>
        </div>
        <div class="flex space-x-2">
          <Button variant="secondary" @click="manualRefresh" :loading="loading">
            {{ loading ? '取得中...' : '手動更新' }}
          </Button>
          <Button variant="primary" @click="$router.push('/reports/new')">
            新しい報告を作成
          </Button>
        </div>
      </div>

      <!-- Filters -->
      <Card class="mb-6">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <!-- Search Query -->
          <div>
            <Input
              v-model="filters.q"
              placeholder="タイトルや内容で検索..."
              @input="handleFilterChange"
            />
          </div>

          <!-- Category Filter -->
          <div>
            <Select
              v-model="filters.category"
              :options="categoryOptions"
              placeholder="カテゴリを選択"
              @update:model-value="handleFilterChange"
            />
          </div>

          <!-- Date From -->
          <div>
            <Input v-model="filters.from" type="date" label="開始日" @input="handleFilterChange" />
          </div>

          <!-- Date To -->
          <div>
            <Input v-model="filters.to" type="date" label="終了日" @input="handleFilterChange" />
          </div>
        </div>

        <!-- Filter Actions -->
        <div class="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
          <div class="text-sm text-gray">
            {{ totalReports }} 件中 {{ filteredReports.length }} 件を表示
          </div>
          <div class="flex space-x-2">
            <Button variant="ghost" size="sm" @click="clearFilters"> フィルタをクリア </Button>
            <Button variant="secondary" size="sm" @click="exportReports"> 検索 </Button>
          </div>
        </div>
      </Card>

      <!-- Reports Table -->
      <Card>
        <Table
          :columns="tableColumns"
          :data="paginatedReports"
          :loading="loading"
          row-clickable
          @row-click="handleRowClick"
        >
          <!-- Custom cell templates -->
          <template #cell-title="{ item }">
            <div class="max-w-xs">
              <div class="font-medium text-secondary truncate">{{ item.title }}</div>
              <div class="text-sm text-gray truncate">{{ item.summary }}</div>
            </div>
          </template>

          <template #cell-category="{ item }">
            <Badge :variant="getCategoryVariant(item.category)">
              {{ getCategoryDisplayName(item.category) }}
            </Badge>
          </template>

          <template #cell-createdAt="{ item }">
            <div class="text-sm">
              <div>{{ formatDate(item.createdAt) }}</div>
              <div class="text-xs text-gray">{{ formatRelativeTime(item.createdAt) }}</div>
            </div>
          </template>

          <template #actions="{ item }">
            <div class="flex space-x-2">
              <Button variant="ghost" size="sm" @click.stop="$router.push(`/reports/${item.id}`)">
                詳細
              </Button>
              <Button
                v-if="item.userId === currentUserId"
                variant="ghost"
                size="sm"
                @click.stop="editReport(item)"
              >
                編集
              </Button>
            </div>
          </template>
        </Table>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="mt-6">
          <Pagination
            :current-page="currentPage"
            :total-pages="totalPages"
            :total="filteredReports.length"
            :per-page="perPage"
            @page-change="handlePageChange"
          />
        </div>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { format, formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';
import { COPY } from '~/constants/copy';

// Components
import Card from '~/components/ui/Card.vue';
import Button from '~/components/ui/Button.vue';
import Input from '~/components/ui/Input.vue';
import Select from '~/components/ui/Select.vue';
import Table from '~/components/ui/Table.vue';
import Badge from '~/components/ui/Badge.vue';
import Pagination from '~/components/ui/Pagination.vue';

// Types
interface Report {
  id: string;
  title: string;
  summary: string;
  category: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  author: string;
  userId: string;
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
const perPage = ref(10);

const filters = ref<Filters>({
  q: '',
  category: '',
  from: '',
  to: '',
});

// デバッグ情報
const debugInfo = ref({
  isAuthenticated: false,
  hasToken: false,
  lastFetch: '',
  lastError: '',
});

// カテゴリオプション
import {
  getCategoryOptions,
  getCategoryDisplayName,
  getCategoryVariant,
} from '~/constants/categories';
const categoryOptions = getCategoryOptions();

// Table columns
const tableColumns = [
  { key: 'title', label: 'タイトル', sortable: true },
  { key: 'category', label: 'カテゴリ', sortable: true },
  { key: 'author', label: '作成者', sortable: true },
  { key: 'createdAt', label: '作成日時', sortable: true },
];

// Mock current user ID for permission check
const currentUserId = ref('user-123');

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

const getStatusVariant = (
  status: string,
): 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'outline' => {
  const variants: Record<
    string,
    'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'outline'
  > = {
    検討中: 'warning',
    実施中: 'primary',
    完了: 'success',
    保留: 'secondary',
  };
  return variants[status] || 'default';
};

const formatDate = (dateString: string) => {
  return format(new Date(dateString), 'yyyy/MM/dd HH:mm', { locale: ja });
};

const formatRelativeTime = (dateString: string) => {
  return formatDistanceToNow(new Date(dateString), { addSuffix: true, locale: ja });
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

const editReport = (report: Report) => {
  // TODO: Implement edit functionality
  console.log('Edit report:', report.id);
};

const clearFilters = () => {
  filters.value = {
    q: '',
    category: '',
    from: '',
    to: '',
  };
};

const exportReports = () => {
  // TODO: Implement export functionality
  console.log('Export reports');
};

const manualRefresh = async () => {
  console.log('🔄 手動更新が実行されました');
  await fetchReports();
};

const fetchReports = async () => {
  try {
    loading.value = true;
    console.log('🔍 レポート取得開始');

    // デバッグ情報をリセット
    debugInfo.value.lastError = '';
    debugInfo.value.lastFetch = new Date().toLocaleString('ja-JP');

    // 認証状態の確認
    const { isAuthenticated, getIdToken } = useAuth();
    console.log('認証状態:', isAuthenticated.value);
    debugInfo.value.isAuthenticated = isAuthenticated.value;

    const token = await getIdToken();
    console.log('トークン取得結果:', token ? 'あり' : 'なし');
    debugInfo.value.hasToken = !!token;

    const { reports: api } = useApi();

    const queryParams = {
      q: filters.value.q,
      category: filters.value.category,
      from: filters.value.from,
      to: filters.value.to,
    };
    console.log('クエリパラメータ:', queryParams);

    const response = await api.list(queryParams);
    console.log('✅ API レスポンス:', response);
    console.log('取得したアイテム数:', response.items?.length || 0);

    // APIレスポンスをUIで使用する形式に変換
    reports.value = response.items.map((item: any) => {
      console.log('変換中のアイテム:', item);
      return {
        id: item.reportId,
        title: item.title || '無題',
        summary: item.summary || item.body?.substring(0, 100) + '...' || '',
        category: item.category,
        status: '完了', // 現在のAPIには status がないため固定値
        author: 'ユーザー', // 現在のAPIには author がないため固定値
        userId: item.userId,
        createdAt: item.createdAt,
        updatedAt: item.createdAt, // 現在のAPIには updatedAt がないため createdAt を使用
      };
    });

    console.log('✅ 変換後のレポート数:', reports.value.length);
  } catch (error: any) {
    console.error('❌ レポート取得エラー:', error);
    console.error('エラーの詳細:', {
      message: error.message,
      status: error.status,
      statusCode: error.statusCode,
      stack: error.stack,
    });

    // デバッグ情報にエラーを記録
    debugInfo.value.lastError = error.message || 'Unknown error';

    // エラー時は空配列を設定
    reports.value = [];

    // ユーザーにエラーを表示
    if (error.message?.includes('認証')) {
      alert('認証エラーが発生しました。再ログインしてください。');
    } else {
      alert(`データの取得に失敗しました: ${error.message}`);
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

// ページがフォーカスされた時にデータを再取得
if (process.client) {
  window.addEventListener('focus', () => {
    fetchReports();
  });
}

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
