<template>
  <div class="min-h-screen" :style="backgroundStyle">
    <div class="max-w-7xl mx-auto px-6 py-8 space-y-8">
      <!-- ヒーロー：マスコット + 説明文 -->
      <MascotBanner
        :today-count="todayCount"
        :total-count="totalCount"
        :remaining="orgRemaining"
        :is-leveled-up="isLeveledUpToday"
      />

      <!-- レベル状況：会社 / 個人 の2本バー -->
      <LevelBar
        type="dual"
        :org-level="orgLevel.level"
        :org-progress="orgProgress"
        :org-remaining="orgRemaining"
        :me-level="meLevel.level"
        :me-progress="meProgress"
        :me-remaining="meRemaining"
      />

      <!-- 最近の報告 -->
      <section class="rounded-2xl border bg-white p-6 shadow-sm">
        <div class="flex items-center justify-between">
          <h2 class="text-base font-semibold">最近の報告</h2>
          <NuxtLink to="/reports" class="text-sm text-emerald-700 hover:underline">
            すべての報告を見る
          </NuxtLink>
        </div>

        <div v-if="loading" class="mt-4 divide-y">
          <div
            v-for="i in 5"
            :key="i"
            class="py-3 grid grid-cols-[7rem,1fr,auto] items-start gap-3"
          >
            <Skeleton variant="rectangular" width="112" height="24" />
            <div class="min-w-0 space-y-2">
              <Skeleton variant="text" width="80%" />
              <Skeleton variant="text" width="60%" />
            </div>
            <Skeleton variant="text" width="60" />
          </div>
        </div>

        <div v-else-if="recentReports.length === 0" class="mt-4 py-8 text-center text-gray-400">
          まだ報告がありません。
        </div>

        <div v-else class="mt-4 divide-y">
          <div
            v-for="report in recentReports"
            :key="report.id"
            class="py-3 grid grid-cols-[7rem,1fr,auto] items-start gap-3 hover:bg-gray-50 cursor-pointer transition-colors"
            @click="$router.push(`/reports/${report.id}`)"
          >
            <span
              class="inline-flex w-28 shrink-0 justify-center rounded-full text-[11px] px-2 py-1 whitespace-nowrap overflow-hidden text-ellipsis"
              :class="getCategoryColor(report.category)"
            >
              {{ getCategoryDisplayName(report.category) || '—' }}
            </span>
            <div class="min-w-0">
              <div class="font-medium truncate">{{ report.title || '（無題）' }}</div>
              <div class="text-xs text-gray-500 line-clamp-2">{{ report.summary || '' }}</div>
            </div>
            <div class="ml-auto text-xs text-gray-400">{{ formatDate(report.createdAt) }}</div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { calculateLevel, checkTodayLevelUp } from '~/composables/useLevel';
import { getCategoryDisplayName, getCategoryColorClasses } from '~/constants/categories';

// Components
import Skeleton from '~/components/ui/Skeleton.vue';
import MascotBanner from '~/components/mascot/MascotBanner.vue';
import LevelBar from '~/components/levels/LevelBar.vue';

// Types
interface Report {
  id: string;
  title: string;
  summary: string;
  category: string;
  createdAt: string;
}

// Reactive data
const loading = ref(true);
const recentReports = ref<Report[]>([]);
const todayCount = ref(0);
const totalCount = ref(0);
const meCount = ref(0);

// Level calculations
const orgLevel = computed(() => calculateLevel(totalCount.value));
const meLevel = computed(() => calculateLevel(meCount.value));

const orgProgress = computed(() => orgLevel.value.progress);
const orgRemaining = computed(() => orgLevel.value.remaining);
const meProgress = computed(() => meLevel.value.progress);
const meRemaining = computed(() => meLevel.value.remaining);

// Level up detection
const isLeveledUpToday = computed(() => {
  const orgLeveledUp = checkTodayLevelUp('level.org', totalCount.value);
  const meLeveledUp = checkTodayLevelUp('level.me', meCount.value);
  return orgLeveledUp || meLeveledUp;
});

// Background style
const backgroundStyle = computed(() => ({
  background: 'radial-gradient(1200px 600px at 50% -20%, #ecfdf5 0%, #f6fff9 40%, #ffffff 72%)',
}));

// Methods
const getCategoryColor = (category: string) => {
  const colors = getCategoryColorClasses(category);
  return `${colors.bg} ${colors.text}`;
};

const formatDate = (dateString: string) => {
  if (!dateString) return '';
  try {
    return format(new Date(dateString), 'MM/dd', { locale: ja });
  } catch {
    return '';
  }
};

const fetchData = async () => {
  try {
    loading.value = true;

    const api = useApi();

    console.log('🔍 ホーム画面データ取得開始');

    // 並列でデータを取得
    const [allStatsRes, todayStatsRes, userStatsRes, recentRes] = await Promise.all([
      // 全体の統計
      api.stats.categories({ scope: 'all' }),
      // 今日の統計（scopeの型エラーを回避するため、直接APIコールを使用）
      api.apiCall('/stats/categories', {
        method: 'GET',
        query: { scope: 'today', tz: 'Asia/Tokyo' },
      }),
      // 個人の統計
      api.stats.categories({ scope: 'user' }),
      // 最近の報告5件（limitパラメータを削除し、後でsliceで制限）
      api.reports.list(),
    ]);

    console.log('📊 API取得結果:');
    console.log('- 全体統計:', allStatsRes);
    console.log('- 今日統計:', todayStatsRes);
    console.log('- 個人統計:', userStatsRes);
    console.log('- 最近の報告:', recentRes);

    // データの設定
    totalCount.value = allStatsRes.totalReports || 0;
    todayCount.value = (todayStatsRes as any).totalReports || 0;
    meCount.value = userStatsRes.totalReports || 0; // 実際のユーザーの報告数を動的に取得

    console.log('📈 設定された値:');
    console.log(`- 総報告数: ${totalCount.value}`);
    console.log(`- 今日の報告数: ${todayCount.value}`);
    console.log(`- 個人報告数: ${meCount.value} (動的取得)`);

    // レベル計算結果をログ出力
    const orgLevelInfo = calculateLevel(totalCount.value);
    const meLevelInfo = calculateLevel(meCount.value);
    console.log('🎯 レベル計算結果:');
    console.log(
      `- 会社レベル: Lv${orgLevelInfo.level} ${orgLevelInfo.name} (残り${orgLevelInfo.remaining}件)`,
    );
    console.log(
      `- 個人レベル: Lv${meLevelInfo.level} ${meLevelInfo.name} (残り${meLevelInfo.remaining}件)`,
    );

    // 最近の報告の変換（5件に制限）
    const reports = recentRes.items || [];
    recentReports.value = reports.slice(0, 5).map((report: any) => ({
      id: report.reportId || report.id,
      title: report.title || report.summary || '（無題）',
      summary: report.summary || report.body || '',
      category: report.category || '—',
      createdAt: report.createdAt || '',
    }));

    console.log(`📝 最近の報告: ${recentReports.value.length}件取得`);
  } catch (error) {
    console.error('❌ データ取得エラー:', error);
    console.log('🔄 フォールバックデータを使用します');

    // API取得に失敗した場合は空のデータを設定（モックデータは使用しない）
    totalCount.value = 0;
    todayCount.value = 0;
    meCount.value = 0;
    recentReports.value = [];
  } finally {
    loading.value = false;
  }
};

// Lifecycle
onMounted(() => {
  fetchData();
});

// Meta
useHead({
  title: 'ホーム - 報告システム',
});

// 認証ガード
definePageMeta({
  middleware: 'auth',
  layout: 'app',
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
