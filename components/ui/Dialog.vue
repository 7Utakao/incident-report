<template>
  <TransitionRoot as="template" :show="open">
    <Dialog as="div" class="relative z-50" @close="$emit('close')">
      <TransitionChild
        as="template"
        enter="ease-out duration-300"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="ease-in duration-200"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
      </TransitionChild>

      <div class="fixed inset-0 z-10 overflow-y-auto">
        <div
          class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0"
        >
          <TransitionChild
            as="template"
            enter="ease-out duration-300"
            enter-from="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enter-to="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leave-from="opacity-100 translate-y-0 sm:scale-100"
            leave-to="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <DialogPanel
              class="relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:p-6"
              :class="sizeClasses"
            >
              <div>
                <div
                  v-if="icon"
                  class="mx-auto flex h-12 w-12 items-center justify-center rounded-full"
                  :class="iconBgClasses"
                >
                  <component :is="icon" class="h-6 w-6" :class="iconClasses" />
                </div>

                <div class="mt-3 text-center sm:mt-5" :class="{ 'sm:mt-0': !icon }">
                  <DialogTitle
                    v-if="title"
                    as="h3"
                    class="text-base font-semibold leading-6 text-gray-900 dark:text-white"
                  >
                    {{ title }}
                  </DialogTitle>

                  <div class="mt-2" :class="{ 'mt-0': !title }">
                    <slot />
                  </div>
                </div>
              </div>

              <div
                v-if="$slots.actions"
                class="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3"
              >
                <slot name="actions" />
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue';

interface Props {
  open: boolean;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  icon?: any;
  iconType?: 'success' | 'warning' | 'error' | 'info';
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  iconType: 'info',
});

defineEmits<{
  close: [];
}>();

const sizeClasses = computed(() => {
  const sizes = {
    sm: 'sm:max-w-sm',
    md: 'sm:max-w-md',
    lg: 'sm:max-w-lg',
    xl: 'sm:max-w-xl',
  };
  return sizes[props.size];
});

const iconBgClasses = computed(() => {
  const bgClasses = {
    success: 'bg-green-100 dark:bg-green-900',
    warning: 'bg-yellow-100 dark:bg-yellow-900',
    error: 'bg-red-100 dark:bg-red-900',
    info: 'bg-blue-100 dark:bg-blue-900',
  };
  return bgClasses[props.iconType];
});

const iconClasses = computed(() => {
  const iconColors = {
    success: 'text-green-600 dark:text-green-400',
    warning: 'text-yellow-600 dark:text-yellow-400',
    error: 'text-red-600 dark:text-red-400',
    info: 'text-blue-600 dark:text-blue-400',
  };
  return iconColors[props.iconType];
});
</script>
