<template>
  <div class="min-h-screen bg-background">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-secondary">ダッシュボード</h1>
        <p class="mt-2 text-gray">報告の分析と統計</p>
      </div>

      <!-- Stats Overview -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card class="text-center">
          <div class="text-3xl font-bold text-primary-600 mb-2">
            {{ reportsToday }}/{{ totalReports }}
          </div>
          <div class="text-sm text-gray">本日の報告数/総報告数</div>
        </Card>

        <Card class="text-center">
          <div class="text-3xl font-bold text-accent-warm mb-2">
            {{ proposalsToday }}/{{ totalProposals }}
          </div>
          <div class="text-sm text-gray">本日の改善提案数/総改善提案数</div>
        </Card>
      </div>

      <!-- Charts Grid -->
      <div class="mb-8">
        <!-- Top Improvement Suggestions Bar Chart -->
        <Card title="よく提案される改善策">
          <div class="h-64 flex items-center justify-center">
            <div class="text-center">
              <div class="text-6xl mb-4">📊</div>
              <p class="text-gray">改善策の棒グラフ（Top N）</p>
              <p class="text-sm text-gray mt-2">Chart.js実装予定</p>
            </div>
          </div>
        </Card>
      </div>

      <!-- Analysis Summary -->
      <div>
        <Card title="総改善案のまとめ">
          <div class="prose prose-sm max-w-none">
            <p class="text-secondary leading-relaxed">
              これまでに投稿された{{
                totalProposals
              }}件の改善提案を分析した結果、特にメール誤送信防止とダブルチェック体制の構築が重要な課題として浮かび上がっています。
              メール関連では「宛先を最後に入力する」ルールの導入が効果的で、時間管理においては作業前の十分な時間確保が推奨されます。
              また、チーム全体でのダブルチェック体制を構築することで、ヒューマンエラーを大幅に削減できることが示されています。
              継続的な改善活動により、組織全体のリスク管理能力向上が期待されます。
            </p>
          </div>
        </Card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

// Components
import Card from '~/components/ui/Card.vue';
import Badge from '~/components/ui/Badge.vue';

// Mock data
const reportsToday = ref(3);
const totalReports = ref(47);
const proposalsToday = ref(8);
const totalProposals = ref(89);

const topTags = ref([
  { name: 'メール送信ルール', count: 15, variant: 'error' as const },
  { name: 'ダブルチェック', count: 12, variant: 'warning' as const },
  { name: '時間管理', count: 8, variant: 'primary' as const },
  { name: 'システム改善', count: 6, variant: 'secondary' as const },
  { name: '研修・教育', count: 4, variant: 'default' as const },
]);

// Meta
useHead({
  title: 'ダッシュボード - 報告システム',
});
</script>
