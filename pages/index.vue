<template>
  <div class="min-h-screen bg-background">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="mb-8">
        <p class="text-ink/60">
          {{ COPY.homeSubtitle }}
        </p>
      </div>

      <!-- Mascot Banner -->
      <div class="mb-8">
        <MascotBanner />
      </div>

      <!-- Main Content Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Left Column: Level Status -->
        <div class="space-y-6">
          <!-- Level Status -->
          <Card title="レベル状況">
            <div class="py-6">
              <LevelBar
                :level="userLevel"
                :progress="levelProgress"
                :reports-to-next="reportsToNextLevel"
              />
            </div>
          </Card>
        </div>

        <!-- Right Column: Recent Reports -->
        <div class="space-y-6">
          <!-- Recent Reports -->
          <Card title="最近の報告">
            <div v-if="loading" class="space-y-4">
              <div v-for="i in 3" :key="i" class="grid grid-cols-[120px_1fr] gap-3">
                <Skeleton variant="rectangular" width="100" height="24" />
                <div class="space-y-2">
                  <Skeleton variant="text" width="80%" />
                  <Skeleton variant="text" width="60%" />
                </div>
              </div>
            </div>

            <div v-else-if="recentReports.length === 0" class="text-center py-8 text-ink/60">
              まだ報告がありません
            </div>

            <div v-else>
              <ul class="space-y-0">
                <li
                  v-for="report in recentReports"
                  :key="report.id"
                  class="grid grid-cols-[120px_1fr] gap-3 p-4 hover:bg-primary/10 cursor-pointer transition-colors"
                  @click="$router.push(`/reports/${report.id}`)"
                >
                  <div class="truncate">
                    <Badge :variant="getCategoryVariant(report.category)" class="text-xs">
                      {{ report.category }}
                    </Badge>
                  </div>
                  <div>
                    <div class="font-medium line-clamp-1 text-sm">{{ report.title }}</div>
                    <div class="text-sm opacity-80 line-clamp-2 mt-1">{{ report.summary }}</div>
                  </div>
                </li>
              </ul>
            </div>

            <template #footer>
              <div class="text-center">
                <Button variant="ghost" @click="$router.push('/reports')">
                  すべての報告を見る
                </Button>
              </div>
            </template>
          </Card>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="mt-8">
        <Card title="クイックアクション">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="primary"
              size="lg"
              class="w-full"
              @click="$router.push('/reports/new')"
            >
              新しい報告を作成
            </Button>
            <Button variant="secondary" size="md" class="w-full" @click="$router.push('/reports')">
              報告一覧を見る
            </Button>
            <Button variant="ghost" size="md" class="w-full" @click="$router.push('/dashboard')">
              ダッシュボード
            </Button>
          </div>
        </Card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { COPY } from '~/constants/copy';

// Components
import Card from '~/components/ui/Card.vue';
import Button from '~/components/ui/Button.vue';
import Badge from '~/components/ui/Badge.vue';
import Skeleton from '~/components/ui/Skeleton.vue';
import MascotBanner from '~/components/mascot/MascotBanner.vue';
import LevelBar from '~/components/levels/LevelBar.vue';

// Types
interface Report {
  id: string;
  title: string;
  summary: string;
  category: string;
  status: string;
  createdAt: string;
}

// Reactive data
const loading = ref(true);
const recentReports = ref<Report[]>([]);

// Mock stats data
const todayReports = ref(3);
const weekReports = ref(12);
const totalReports = ref(47);
const improvementSuggestions = ref(89);

// User level system (mock data)
const userLevel = ref(4);
const totalUserReports = ref(47);

const levelTitle = computed(() => {
  const titles = ['新人', '初級者', '中級者', '上級者', 'エキスパート', 'マスター'];
  return titles[Math.min(userLevel.value - 1, titles.length - 1)] || 'マスター';
});

const levelProgress = computed(() => {
  const reportsForCurrentLevel = (userLevel.value - 1) * 10;
  const reportsForNextLevel = userLevel.value * 10;
  const currentProgress = totalUserReports.value - reportsForCurrentLevel;
  const levelRange = reportsForNextLevel - reportsForCurrentLevel;
  return Math.min((currentProgress / levelRange) * 100, 100);
});

const reportsToNextLevel = computed(() => {
  const reportsForNextLevel = userLevel.value * 10;
  return Math.max(reportsForNextLevel - totalUserReports.value, 0);
});

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
  return format(new Date(dateString), 'MM/dd HH:mm', { locale: ja });
};

const fetchRecentReports = async () => {
  try {
    loading.value = true;
    // Mock API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Mock data
    recentReports.value = [
      {
        id: '1',
        title: '機密資料の誤送信インシデント',
        summary: '重要な会議資料を間違った取引先に送信してしまいました。',
        category: '情報漏洩・誤送信',
        status: '完了',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: '2',
        title: 'データベース接続エラー',
        summary: '朝の業務開始時にデータベースに接続できない問題が発生しました。',
        category: 'システム障害',
        status: '実施中',
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: '3',
        title: '顧客情報の入力ミス',
        summary: '顧客の住所を間違って入力し、配送に遅延が生じました。',
        category: '作業ミス',
        status: '検討中',
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      },
    ];
  } finally {
    loading.value = false;
  }
};

// Lifecycle
onMounted(() => {
  fetchRecentReports();
});

// Meta
useHead({
  title: 'ホーム - 報告システム',
});
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
