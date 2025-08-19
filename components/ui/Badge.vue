<template>
  <span
    :class="[
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
      variantClass,
      sizeClass,
      className,
    ]"
  >
    <slot />
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue';

type BadgeVariant =
  | 'default'
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'error'
  | 'outline';
type BadgeSize = 'sm' | 'md' | 'lg';

interface Props {
  variant?: BadgeVariant;
  size?: BadgeSize;
  className?: string;
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  size: 'md',
});

const variantClass = computed(() => {
  switch (props.variant) {
    case 'default':
      return 'bg-accent3/40 text-primaryDeep';
    case 'primary':
      return 'bg-primary/30 text-primaryDeep';
    case 'secondary':
      return 'bg-primaryDeep text-white';
    case 'success':
      return 'bg-green-100 text-green-800';
    case 'warning':
      return 'bg-accent1/30 text-accent1';
    case 'error':
      return 'bg-accent2/30 text-accent2';
    case 'outline':
      return 'bg-transparent border border-primary/25 text-ink';
    default:
      return 'bg-accent3/40 text-primaryDeep';
  }
});

const sizeClass = computed(() => {
  switch (props.size) {
    case 'sm':
      return 'px-2 py-0.5 text-xs';
    case 'md':
      return 'px-2.5 py-0.5 text-xs';
    case 'lg':
      return 'px-3 py-1 text-sm';
    default:
      return 'px-2.5 py-0.5 text-xs';
  }
});
</script>
