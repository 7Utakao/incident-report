<template>
  <div
    :class="[
      'rounded-card shadow-elev bg-surface border border-primary/20',
      paddingClass,
      hoverClass,
      clickableClass,
      className,
    ]"
    @click="handleClick"
  >
    <!-- Header -->
    <div v-if="$slots.header || title" class="border-b border-primary/20 pb-4 mb-4">
      <slot name="header">
        <div class="flex items-center justify-between">
          <h3 v-if="title" class="text-lg font-semibold text-ink">
            {{ title }}
          </h3>
          <div v-if="$slots.actions" class="flex items-center space-x-2">
            <slot name="actions" />
          </div>
        </div>
        <p v-if="subtitle" class="text-sm text-ink/60 mt-1">
          {{ subtitle }}
        </p>
      </slot>
    </div>

    <!-- Content -->
    <div :class="contentClass">
      <slot />
    </div>

    <!-- Footer -->
    <div v-if="$slots.footer" class="border-t border-primary/20 pt-4 mt-4">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

type CardVariant = 'default' | 'outlined' | 'elevated' | 'flat';
type CardSize = 'sm' | 'md' | 'lg';

interface Props {
  title?: string;
  subtitle?: string;
  variant?: CardVariant;
  size?: CardSize;
  hoverable?: boolean;
  clickable?: boolean;
  className?: string;
}

interface Emits {
  (e: 'click', event: MouseEvent): void;
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  size: 'md',
  hoverable: false,
  clickable: false,
});

const emit = defineEmits<Emits>();

const paddingClass = computed(() => {
  switch (props.size) {
    case 'sm':
      return 'p-4';
    case 'md':
      return 'p-6';
    case 'lg':
      return 'p-8';
    default:
      return 'p-6';
  }
});

const hoverClass = computed(() => {
  if (props.hoverable || props.clickable) {
    return 'transition-shadow duration-200 hover:shadow-token-lg';
  }
  return '';
});

const clickableClass = computed(() => {
  if (props.clickable) {
    return 'cursor-pointer focus-ring';
  }
  return '';
});

const contentClass = computed(() => {
  return 'text-ink';
});

const handleClick = (event: MouseEvent) => {
  if (props.clickable) {
    emit('click', event);
  }
};
</script>
