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
        <!-- Title and Meta -->
        <Card>
          <div class="space-y-4">
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <h2 class="text-2xl font-bold text-secondary mb-2">{{ report.title }}</h2>
                <div class="flex items-center space-x-4 text-sm text-gray">
                  <span>作成者: {{ report.author }}</span>
                  <span>•</span>
                  <span>{{ formatDate(report.createdAt) }}</span>
                </div>
              </div>
              <div class="flex items-center space-x-2">
                <Badge :variant="getCategoryVariant(report.category)">
                  {{ report.category }}
                </Badge>
                <Button
                  v-if="report.userId === currentUserId"
                  variant="primary"
                  size="sm"
                  @click="editReport"
                >
                  編集
                </Button>
              </div>
            </div>
          </div>
        </Card>

        <!-- Summary -->
        <Card title="要約">
          <p class="text-secondary leading-relaxed">{{ report.summary }}</p>
        </Card>

        <!-- Content -->
        <Card title="詳細内容">
          <div class="prose prose-sm max-w-none">
            <div class="whitespace-pre-wrap text-secondary leading-relaxed">{{ report.body }}</div>
          </div>
        </Card>

        <!-- Tags -->
        <Card v-if="report.tags && report.tags.length > 0" title="タグ">
          <div class="flex flex-wrap gap-2">
            <Badge v-for="tag in report.tags" :key="tag" variant="outline" size="sm">
              {{ tag }}
            </Badge>
          </div>
        </Card>

        <!-- Metadata -->
        <Card title="詳細情報">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span class="font-medium text-secondary">カテゴリ:</span>
              <span class="ml-2 text-gray">{{ report.category }}</span>
            </div>
            <div>
              <span class="font-medium text-secondary">作成日時:</span>
              <span class="ml-2 text-gray">{{ formatDate(report.createdAt) }}</span>
            </div>
            <div v-if="report.updatedAt !== report.createdAt">
              <span class="font-medium text-secondary">更新日時:</span>
              <span class="ml-2 text-gray">{{ formatDate(report.updatedAt) }}</span>
            </div>
            <div v-if="report.pointsAwarded">
              <span class="font-medium text-secondary">獲得ポイント:</span>
              <span class="ml-2 text-gray">{{ report.pointsAwarded }} pt</span>
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
const getCategoryVariant = (
  category: string,
): 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'outline' => {
  const variants: Record<
    string,
    'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'outline'
  > = {
    '情報漏洩・誤送信': 'error',
    システム障害: 'warning',
    作業ミス: 'primary',
    コミュニケーション: 'secondary',
    その他: 'default',
  };
  return variants[category] || 'default';
};

const formatDate = (dateString: string) => {
  return format(new Date(dateString), 'yyyy年MM月dd日 HH:mm', { locale: ja });
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
</script>
