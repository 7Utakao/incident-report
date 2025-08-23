<template>
  <div class="min-h-screen bg-background">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex items-center space-x-4 mb-4">
          <Button variant="ghost" @click="$router.back()"> ← 戻る </Button>
        </div>
        <h1 class="text-3xl font-bold text-secondary">報告詳細</h1>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="space-y-6">
        <Card>
          <div class="space-y-4">
            <Skeleton variant="text" width="60%" height="32" />
            <Skeleton variant="text" width="40%" height="24" />
            <Skeleton variant="rectangular" width="100%" height="200" />
          </div>
        </Card>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center py-12">
        <div class="text-6xl mb-4">😕</div>
        <h2 class="text-xl font-semibold text-secondary mb-2">報告が見つかりませんでした</h2>
        <p class="text-gray mb-6">指定された報告は存在しないか、削除された可能性があります。</p>
        <Button variant="primary" @click="$router.push('/reports')">報告一覧に戻る</Button>
      </div>

      <!-- Report Content -->
      <div v-else-if="report" class="space-y-6">
        <!-- Header with Edit Button -->
        <div class="flex items-center justify-between">
          <div></div>
          <Button
            v-if="report.userId === currentUserId"
            variant="primary"
            size="sm"
            @click="editReport"
          >
            編集
          </Button>
        </div>

        <!-- Report Form (Read-only) -->
        <Card title="インシデント報告">
          <div class="space-y-6">
            <!-- Title -->
            <div>
              <label class="block text-sm font-medium text-secondary mb-2">タイトル</label>
              <div
                class="w-full px-3 py-2 border border-gray-300 rounded-token-md bg-gray-50 text-secondary"
              >
                {{ report.title }}
              </div>
            </div>

            <!-- Category -->
            <div>
              <label class="block text-sm font-medium text-secondary mb-2">カテゴリ</label>
              <div class="w-full px-3 py-2 border border-gray-300 rounded-token-md bg-gray-50">
                <span
                  :class="getCategoryColor(report.category)"
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                >
                  {{ getCategoryDisplayName(report.category) }}
                </span>
              </div>
            </div>

            <!-- Created Date -->
            <div>
              <label class="block text-sm font-medium text-secondary mb-2">作成日時</label>
              <div
                class="w-full px-3 py-2 border border-gray-300 rounded-token-md bg-gray-50 text-secondary"
              >
                {{ formatDateInput(report.createdAt) }}
              </div>
            </div>

            <!-- Content -->
            <div>
              <label class="block text-sm font-medium text-secondary mb-2">内容</label>
              <div
                class="w-full px-3 py-2 border border-gray-300 rounded-token-md bg-gray-50 text-secondary whitespace-pre-wrap min-h-[200px]"
              >
                {{ report.body }}
              </div>
            </div>

            <!-- Improvements -->
            <div v-if="report.improvements">
              <label class="block text-sm font-medium text-secondary mb-2">改善案</label>
              <div
                class="w-full px-3 py-2 border border-gray-300 rounded-token-md bg-gray-50 text-secondary whitespace-pre-wrap min-h-[150px]"
              >
                {{ report.improvements }}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import {
  getCategoryOptions,
  getCategoryDisplayName,
  getCategoryColorClasses,
} from '~/constants/categories';

// Components
import Card from '~/components/ui/Card.vue';
import Button from '~/components/ui/Button.vue';
import Badge from '~/components/ui/Badge.vue';
import Skeleton from '~/components/ui/Skeleton.vue';

// Types
interface Report {
  id: string;
  title: string;
  summary: string;
  body: string;
  category: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
  author: string;
  userId: string;
  pointsAwarded?: number;
  improvements?: string;
}

// Route params
const route = useRoute();
const reportId = route.params.id as string;

// Reactive data
const loading = ref(true);
const error = ref(false);
const report = ref<Report | null>(null);

// Mock current user ID for permission check
const currentUserId = ref('user-123');

// Methods
const getCategoryColor = (category: string) => {
  const colors = getCategoryColorClasses(category);
  return `${colors.bg} ${colors.text}`;
};

const formatDate = (dateString: string) => {
  return format(new Date(dateString), 'yyyy年MM月dd日 HH:mm', { locale: ja });
};

const formatDateInput = (dateString: string) => {
  return format(new Date(dateString), 'yyyy-MM-dd', { locale: ja });
};

const editReport = () => {
  // TODO: Navigate to edit page
  console.log('Edit report:', reportId);
};

const fetchReport = async () => {
  try {
    loading.value = true;
    error.value = false;

    const { reports: api } = useApi();
    const response = await api.get(reportId);

    // APIレスポンスをUIで使用する形式に変換
    report.value = {
      id: response.reportId,
      title: response.title || '無題',
      summary: response.summary || response.body?.substring(0, 100) + '...' || '',
      body: response.body,
      category: response.category,
      tags: response.tags || [],
      createdAt: response.createdAt,
      updatedAt: response.createdAt, // 現在のAPIには updatedAt がないため createdAt を使用
      author: 'ユーザー', // 現在のAPIには author がないため固定値
      userId: response.userId,
      pointsAwarded: 0, // 現在のAPIには pointsAwarded がないため固定値
      improvements: response.improvements, // 改善案フィールドを追加
    };
  } catch (err) {
    console.error('Failed to fetch report:', err);
    error.value = true;
  } finally {
    loading.value = false;
  }
};

// Lifecycle
onMounted(() => {
  fetchReport();
});

// Meta
useHead({
  title: computed(() =>
    report.value ? `${report.value.title} - 報告詳細` : '報告詳細 - 報告システム',
  ),
});

// 認証ガード
definePageMeta({
  middleware: 'auth',
  layout: 'app',
});
</script>
