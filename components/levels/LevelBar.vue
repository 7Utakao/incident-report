<template>
  <div v-if="type === 'single'" class="text-center">
    <!-- Single Level Bar (Legacy) -->
    <div class="mb-4">
      <div class="text-2xl font-bold text-ink mb-1">Lv {{ level }} {{ levelTitle }}</div>
    </div>
    <div class="w-full bg-primary/20 rounded-full h-3 mb-2">
      <div
        class="bg-primaryDeep h-3 rounded-full transition-all duration-300"
        :style="{ width: `${progress}%` }"
      ></div>
    </div>
    <div class="text-xs text-ink/60">次のレベルまで {{ reportsToNext }} 件</div>
  </div>

  <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
    <!-- 会社レベル -->
    <div class="rounded-2xl border bg-white p-6 shadow-sm">
      <div class="text-sm text-gray-500">会社レベル</div>
      <div class="mt-1 text-xl font-semibold">Lv {{ orgLevel }} {{ orgLevelTitle }}</div>
      <div class="mt-4 h-2 rounded-full bg-gray-100 overflow-hidden">
        <div
          class="h-full rounded-full bg-emerald-500 transition-all duration-300"
          :style="{ width: `${orgProgress}%` }"
        ></div>
      </div>
      <div class="mt-2 text-xs text-gray-500">次のレベルまで {{ orgRemaining }} 件</div>
    </div>

    <!-- 個人レベル -->
    <div class="rounded-2xl border bg-white p-6 shadow-sm">
      <div class="text-sm text-gray-500">個人レベル</div>
      <div class="mt-1 text-xl font-semibold">Lv {{ meLevel }} {{ meLevelTitle }}</div>
      <div class="mt-4 h-2 rounded-full bg-gray-100 overflow-hidden">
        <div
          class="h-full rounded-full bg-lime-500 transition-all duration-300"
          :style="{ width: `${meProgress}%` }"
        ></div>
      </div>
      <div class="mt-2 text-xs text-gray-500">次のレベルまで {{ meRemaining }} 件</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { LEVEL_NAMES } from '~/composables/useLevel';

interface Props {
  // Legacy single bar props
  level?: number;
  progress?: number; // 0-100
  reportsToNext?: number;

  // New dual bar props
  type?: 'single' | 'dual';
  orgLevel?: number;
  orgProgress?: number;
  orgRemaining?: number;
  meLevel?: number;
  meProgress?: number;
  meRemaining?: number;
}

const props = withDefaults(defineProps<Props>(), {
  level: 1,
  progress: 0,
  reportsToNext: 0,
  type: 'single',
  orgLevel: 1,
  orgProgress: 0,
  orgRemaining: 0,
  meLevel: 1,
  meProgress: 0,
  meRemaining: 0,
});

const levelTitle = computed(() => {
  const index = Math.min(props.level - 1, LEVEL_NAMES.length - 1);
  return LEVEL_NAMES[Math.max(0, index)];
});

const orgLevelTitle = computed(() => {
  const index = Math.min(props.orgLevel - 1, LEVEL_NAMES.length - 1);
  return LEVEL_NAMES[Math.max(0, index)];
});

const meLevelTitle = computed(() => {
  const index = Math.min(props.meLevel - 1, LEVEL_NAMES.length - 1);
  return LEVEL_NAMES[Math.max(0, index)];
});
</script>
