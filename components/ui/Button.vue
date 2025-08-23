<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :class="buttonClasses"
    @click="$emit('click', $event)"
  >
    <div
      v-if="loading"
      class="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"
    ></div>
    <component
      v-if="icon && !loading"
      :is="icon"
      class="h-4 w-4"
      :class="{ 'mr-2': $slots.default }"
    />
    <slot />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  loading?: boolean;
  icon?: any;
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  type: 'button',
  disabled: false,
  loading: false,
});

defineEmits<{
  click: [event: MouseEvent];
}>();

const buttonClasses = computed(() => {
  const baseClasses =
    'inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const variantClasses = {
    primary:
      'bg-emerald-600 hover:bg-emerald-700 text-white focus:ring-emerald-400 dark:bg-emerald-600 dark:hover:bg-emerald-700',
    secondary:
      'bg-primary/20 hover:bg-primary/30 text-primaryDeep border border-primary/25 focus:ring-primary dark:bg-primary/10 dark:hover:bg-primary/20 dark:text-white dark:border-primary/20',
    danger:
      'bg-accent2 hover:bg-accent2/90 text-white focus:ring-accent2 dark:bg-accent2 dark:hover:bg-accent2/90',
    ghost:
      'hover:bg-primary/10 text-ink focus:ring-primary dark:hover:bg-primary/10 dark:text-white',
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return [baseClasses, variantClasses[props.variant], sizeClasses[props.size]].join(' ');
});
</script>
