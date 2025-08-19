<template>
  <div class="card flex items-center gap-4 p-6 bg-primary/15 border-primary/25">
    <div class="w-12 h-12 rounded-full bg-accent1/60 grid place-items-center text-2xl">😊</div>
    <p class="text-primaryDeep font-medium">{{ COPY.mascotLines[currentIndex] }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { COPY } from '~/constants/copy';

const currentIndex = ref(0);
let timer: NodeJS.Timeout | null = null;

onMounted(() => {
  timer = setInterval(() => {
    currentIndex.value = (currentIndex.value + 1) % COPY.mascotLines.length;
  }, 3000);
});

onUnmounted(() => {
  if (timer) {
    clearInterval(timer);
  }
});
</script>
