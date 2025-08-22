<template>
  <div
    class="min-h-screen"
    style="background: linear-gradient(180deg, #eef6ff 0%, #f7fbff 60%, #ffffff 100%)"
  >
    <div class="max-w-7xl mx-auto px-6 py-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">ダッシュボード</h1>
        <p class="text-gray-500 mt-1">報告の分析と統計</p>
      </div>

      <!-- KPI: 総報告数 + あなたの報告数 -->
      <section class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div class="rounded-2xl border bg-white/80 backdrop-blur p-6 shadow-sm">
          <div class="text-sm text-gray-500">総報告数</div>
          <div class="mt-1 text-4xl font-semibold tracking-tight text-gray-900">
            <span v-if="loading">—</span>
            <span v-else>{{ totalReports.toLocaleString('ja-JP') }}</span>
          </div>
        </div>
        <div class="rounded-2xl border bg-white/80 backdrop-blur p-6 shadow-sm">
          <div class="text-sm text-gray-500">あなたの報告数</div>
          <div class="mt-1 text-4xl font-semibold tracking-tight text-gray-900">
            <span v-if="loading">—</span>
            <span v-else>{{ userReports.toLocaleString('ja-JP') }}</span>
          </div>
        </div>
      </section>

      <!-- グラフ 2枚（全社 / あなた） -->
      <section class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div class="rounded-2xl border bg-white p-5 shadow-sm">
          <div class="mb-2 text-sm text-gray-500">全社 Top10</div>
          <div class="h-80">
            <canvas ref="chartCompanyRef" aria-label="全社カテゴリ別棒グラフ" role="img"></canvas>
          </div>
        </div>
        <div class="rounded-2xl border bg-white p-5 shadow-sm">
          <div class="mb-2 text-sm text-gray-500">あなた Top10</div>
          <div class="h-80">
            <canvas ref="chartUserRef" aria-label="あなたのカテゴリ別棒グラフ" role="img"></canvas>
          </div>
        </div>
      </section>

      <!-- AI 総評（短文） -->
      <section class="rounded-2xl border bg-white p-5 shadow-sm">
        <div class="text-sm text-gray-500 mb-2">AIによる総評</div>
        <p class="leading-relaxed text-gray-900">
          <span v-if="loading">—</span>
          <span v-else>{{ advice }}</span>
        </p>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue';
import { Chart, registerables } from 'chart.js';

// Chart.jsの全コンポーネントを登録
Chart.register(...registerables);

// Reactive data
const loading = ref(true);
const totalReports = ref(0);
const userReports = ref(0);
const advice = ref('');
const chartCompanyRef = ref<HTMLCanvasElement>();
const chartUserRef = ref<HTMLCanvasElement>();

let chartCompany: Chart | null = null;
let chartUser: Chart | null = null;

// API client
const { stats } = useApi();

// データ取得とグラフ描画
const fetchData = async () => {
  try {
    loading.value = true;

    // 全社とユーザー別のデータを並行取得
    const [companyData, userData] = await Promise.all([
      stats.categories({ scope: 'company', topN: 10, tz: 'Asia/Tokyo' }),
      stats.categories({ scope: 'user', topN: 10, tz: 'Asia/Tokyo' }),
    ]);

    // KPI値を設定
    totalReports.value = companyData.totalReports;
    userReports.value = userData.totalReports;

    // 総評を設定（ユーザー優先、なければ全社）
    advice.value =
      userData.advice ||
      companyData.advice ||
      '直近の傾向は確認中です。気づきがあれば短文でも構いません、まずは一件投稿してみましょう。';

    // グラフを描画
    await nextTick();
    renderCharts(companyData.byCategory, userData.byCategory);
  } catch (error) {
    console.error('Dashboard data fetch failed:', error);
    advice.value = 'データの取得に失敗しました。しばらく時間をおいて再試行してください。';
  } finally {
    loading.value = false;
  }
};

// グラフ描画関数
const renderCharts = (companyData: any[], userData: any[]) => {
  // 既存のグラフを破棄
  if (chartCompany) {
    chartCompany.destroy();
    chartCompany = null;
  }
  if (chartUser) {
    chartUser.destroy();
    chartUser = null;
  }

  // 全社グラフ
  if (chartCompanyRef.value) {
    const labels = companyData.map((item) => item.name || item.code);
    const values = companyData.map((item) => item.count);

    chartCompany = new Chart(chartCompanyRef.value, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: '報告数',
            data: values,
            backgroundColor: 'rgba(59, 130, 246, 0.8)',
            borderColor: 'rgba(59, 130, 246, 1)',
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              precision: 0,
            },
          },
          x: {
            ticks: {
              maxRotation: 45,
              minRotation: 0,
            },
          },
        },
      },
    });
  }

  // あなたのグラフ
  if (chartUserRef.value) {
    const labels = userData.map((item) => item.name || item.code);
    const values = userData.map((item) => item.count);

    chartUser = new Chart(chartUserRef.value, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: '報告数',
            data: values,
            backgroundColor: 'rgba(16, 185, 129, 0.8)',
            borderColor: 'rgba(16, 185, 129, 1)',
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              precision: 0,
            },
          },
          x: {
            ticks: {
              maxRotation: 45,
              minRotation: 0,
            },
          },
        },
      },
    });
  }
};

// ライフサイクル
onMounted(() => {
  fetchData();
});

// クリーンアップ
onBeforeUnmount(() => {
  if (chartCompany) {
    chartCompany.destroy();
  }
  if (chartUser) {
    chartUser.destroy();
  }
});

// Meta
useHead({
  title: 'ダッシュボード - 報告システム',
});

// 認証ガード
definePageMeta({
  middleware: 'auth',
  layout: 'app',
});
</script>
