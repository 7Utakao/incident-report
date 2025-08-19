<template>
  <div class="relative">
    <label v-if="label" :for="id" class="block text-sm font-medium text-secondary mb-2">
      {{ label }}
      <span v-if="required" class="text-error ml-1">*</span>
    </label>

    <Listbox v-model="selectedValue" :disabled="disabled">
      <div class="relative">
        <ListboxButton
          :id="id"
          :class="[
            'relative w-full cursor-default rounded-token-md border py-2 pl-3 pr-10 text-left focus-ring',
            'bg-white shadow-token-sm',
            error ? 'border-error' : 'border-gray',
            disabled ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : 'hover:border-primary',
          ]"
        >
          <span v-if="selectedValue" class="block truncate">
            {{ getDisplayValue(selectedValue) }}
          </span>
          <span v-else class="block truncate text-gray-400">
            {{ placeholder }}
          </span>
          <span class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
            <ChevronUpDownIcon class="h-5 w-5 text-gray-400" aria-hidden="true" />
          </span>
        </ListboxButton>

        <transition
          leave-active-class="transition duration-100 ease-in"
          leave-from-class="opacity-100"
          leave-to-class="opacity-0"
        >
          <ListboxOptions
            class="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-token-md bg-white py-1 shadow-token-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
          >
            <ListboxOption
              v-for="option in options"
              :key="getOptionKey(option)"
              v-slot="{ active, selected }"
              :value="getOptionValue(option)"
              as="template"
            >
              <li
                :class="[
                  active ? 'bg-primary-light text-primary-900' : 'text-gray-900',
                  'relative cursor-default select-none py-2 pl-10 pr-4',
                ]"
              >
                <span :class="[selected ? 'font-medium' : 'font-normal', 'block truncate']">
                  {{ getDisplayValue(getOptionValue(option)) }}
                </span>
                <span
                  v-if="selected"
                  class="absolute inset-y-0 left-0 flex items-center pl-3 text-primary-600"
                >
                  <CheckIcon class="h-5 w-5" aria-hidden="true" />
                </span>
              </li>
            </ListboxOption>
          </ListboxOptions>
        </transition>
      </div>
    </Listbox>

    <p v-if="error" class="mt-2 text-sm text-error">
      {{ error }}
    </p>
    <p v-else-if="hint" class="mt-2 text-sm text-gray">
      {{ hint }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Listbox, ListboxButton, ListboxOptions, ListboxOption } from '@headlessui/vue';
import { ChevronUpDownIcon, CheckIcon } from '@heroicons/vue/20/solid';

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

interface Props {
  modelValue?: string | number | null;
  options: SelectOption[] | string[];
  label?: string;
  placeholder?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  disabled?: boolean;
  id?: string;
}

interface Emits {
  (e: 'update:modelValue', value: string | number | null): void;
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '選択してください',
  id: () => `select-${Math.random().toString(36).substr(2, 9)}`,
});

const emit = defineEmits<Emits>();

const selectedValue = computed({
  get: () => props.modelValue ?? null,
  set: (value) => emit('update:modelValue', value),
});

const getOptionValue = (option: SelectOption | string): string | number => {
  return typeof option === 'string' ? option : option.value;
};

const getOptionKey = (option: SelectOption | string): string | number => {
  return typeof option === 'string' ? option : option.value;
};

const getDisplayValue = (value: string | number | null): string => {
  if (value === null || value === undefined) return '';

  const option = props.options.find((opt) => getOptionValue(opt) === value);
  if (typeof option === 'string') return option;
  return option?.label || String(value);
};
</script>
