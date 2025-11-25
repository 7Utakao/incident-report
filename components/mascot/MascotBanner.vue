<template>
  <div class="space-y-4">
    <!-- 説明文（上部に移動） -->
    <div class="text-left text-sm md:text-base leading-relaxed text-gray-700 font-medium">
      {{ COPY.homeSubtitle }}
    </div>

    <!-- キャラクター + 吹き出し -->
    <div class="flex items-center gap-4">
      <div class="relative">
        <img
          src="/mascot.png"
          alt="マスコット"
          class="w-16 h-16 md:w-24 md:h-24 rounded-full object-contain bg-transparent"
          @error="handleImageError"
        />
      </div>
      <!-- 吹き出し -->
      <div
        class="bubble bg-white border border-black/5 rounded-2xl px-4 py-3 text-sm md:text-base text-gray-800 shadow-sm"
      >
        {{ displayMessage }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { COPY } from '~/constants/copy';

interface Props {
  todayCount?: number;
  totalCount?: number;
  remaining?: number;
  isLeveledUp?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  todayCount: 0,
  totalCount: 0,
  remaining: 0,
  isLeveledUp: false,
});

const currentIndex = ref(0);
let timer: NodeJS.Timeout | null = null;

const displayMessage = computed(() => {
  // if (props.isLeveledUp) {
  //   return COPY.levelUpMessage;
  // }

  const template = COPY.mascotLines[currentIndex.value] || COPY.mascotLines[0];
  return template
    .replace('{todayCount}', props.todayCount.toString())
    .replace('{totalCount}', props.totalCount.toString())
    .replace('{remaining}', props.remaining.toString());
});

const handleImageError = (event: Event) => {
  // 画像が読み込めない場合は絵文字にフォールバック
  const img = event.target as HTMLImageElement;
  img.style.display = 'none';
  const parent = img.parentElement;
  if (parent) {
    parent.innerHTML =
      '<div class="w-16 h-16 md:w-24 md:h-24 rounded-full bg-emerald-100 grid place-items-center text-2xl">😊</div>';
  }
};

onMounted(() => {
  timer = setInterval(() => {
    if (!props.isLeveledUp) {
      currentIndex.value = (currentIndex.value + 1) % COPY.mascotLines.length;
    }
  }, 5000); // 5秒間隔に変更
});

onUnmounted(() => {
  if (timer) {
    clearInterval(timer);
  }
});
</script>

<style scoped>
/* 吹き出しのしっぽ */
.bubble {
  position: relative;
}

.bubble:before {
  content: '';
  position: absolute;
  left: -6px;
  top: 14px;
  width: 12px;
  height: 12px;
  background: white;
  border: 1px solid rgba(0, 0, 0, 0.06);
  transform: rotate(-45deg);
  border-right-color: transparent;
  border-bottom-color: transparent;
}
</style>
