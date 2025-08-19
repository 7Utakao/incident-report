<template>
  <div
    :class="['animate-pulse bg-gray-200 rounded-token-md', sizeClass, className]"
    :style="customStyle"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue';

type SkeletonVariant = 'text' | 'circular' | 'rectangular' | 'rounded';

interface Props {
  variant?: SkeletonVariant;
  width?: string | number;
  height?: string | number;
  className?: string;
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'text',
});

const sizeClass = computed(() => {
  switch (props.variant) {
    case 'text':
      return 'h-4 w-full';
    case 'circular':
      return 'rounded-full w-10 h-10';
    case 'rectangular':
      return 'w-full h-32';
    case 'rounded':
      return 'w-full h-32 rounded-token-lg';
    default:
      return 'h-4 w-full';
  }
});

const customStyle = computed(() => {
  const style: Record<string, string> = {};

  if (props.width) {
    style.width = typeof props.width === 'number' ? `${props.width}px` : props.width;
  }

  if (props.height) {
    style.height = typeof props.height === 'number' ? `${props.height}px` : props.height;
  }

  return style;
});
</script>
