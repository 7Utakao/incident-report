<template>
  <div class="text-center">
    <!-- Level Info -->
    <div class="mb-4">
      <div class="text-2xl font-bold text-ink mb-1">Lv {{ level }} {{ levelTitle }}</div>
    </div>

    <!-- Progress Bar -->
    <div class="w-full bg-primary/20 rounded-full h-3 mb-2">
      <div
        class="bg-primaryDeep h-3 rounded-full transition-all duration-300"
        :style="{ width: `${progress}%` }"
      ></div>
    </div>
    <div class="text-xs text-ink/60">次のレベルまで {{ reportsToNext }} 件</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  level: number;
  progress: number; // 0-100
  reportsToNext?: number;
}

const props = withDefaults(defineProps<Props>(), {
  reportsToNext: 0,
});

const levelTitles = [
  'ひよっこ',
  'たねまき',
  '見習い',
  '研究者',
  '冒険者',
  '達人',
  '師範',
  '先導者',
  '伝道師',
];

const levelTitle = computed(() => {
  const index = Math.min(props.level - 1, levelTitles.length - 1);
  return levelTitles[Math.max(0, index)];
});
</script>
