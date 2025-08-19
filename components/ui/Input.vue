<template>
  <div class="space-y-1">
    <label
      v-if="label"
      :for="id"
      class="block text-sm font-medium text-gray-700 dark:text-gray-300"
    >
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>

    <div class="relative">
      <div v-if="icon" class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <component :is="icon" class="h-5 w-5 text-gray-400" />
      </div>

      <input
        :id="id"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :required="required"
        :maxlength="maxlength"
        :class="inputClasses"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
        @blur="$emit('blur', $event)"
        @focus="$emit('focus', $event)"
      />

      <div
        v-if="maxlength && showCount"
        class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none"
      >
        <span class="text-xs text-gray-400">
          {{ String(modelValue || '').length }}/{{ maxlength }}
        </span>
      </div>
    </div>

    <p v-if="error" class="text-sm text-red-600 dark:text-red-400">{{ error }}</p>
    <p v-else-if="hint" class="text-sm text-gray-500 dark:text-gray-400">{{ hint }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  id?: string;
  label?: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'date';
  modelValue?: string | number;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  hint?: string;
  icon?: any;
  maxlength?: number;
  showCount?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  disabled: false,
  required: false,
  showCount: false,
});

defineEmits<{
  'update:modelValue': [value: string];
  blur: [event: FocusEvent];
  focus: [event: FocusEvent];
}>();

const inputClasses = computed(() => {
  const baseClasses =
    'block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6 transition-colors disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 dark:disabled:bg-gray-800 dark:disabled:text-gray-400';

  const iconPadding = props.icon ? 'pl-10' : 'pl-3';
  const countPadding = props.maxlength && props.showCount ? 'pr-16' : 'pr-3';

  const stateClasses = props.error
    ? 'ring-red-300 placeholder:text-red-300 focus:ring-red-500 text-red-900 dark:ring-red-500 dark:placeholder:text-red-400 dark:focus:ring-red-400 dark:text-red-400'
    : 'ring-gray-300 placeholder:text-gray-400 focus:ring-blue-600 text-gray-900 dark:bg-gray-800 dark:ring-gray-600 dark:placeholder:text-gray-400 dark:focus:ring-blue-500 dark:text-white';

  return [baseClasses, iconPadding, countPadding, stateClasses].join(' ');
});
</script>
