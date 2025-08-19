<template>
  <nav
    class="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6"
  >
    <div class="flex flex-1 justify-between sm:hidden">
      <!-- Mobile pagination -->
      <Button
        variant="secondary"
        size="sm"
        :disabled="currentPage <= 1"
        @click="goToPage(currentPage - 1)"
      >
        前へ
      </Button>
      <Button
        variant="secondary"
        size="sm"
        :disabled="currentPage >= totalPages"
        @click="goToPage(currentPage + 1)"
      >
        次へ
      </Button>
    </div>

    <div class="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
      <div>
        <p class="text-sm text-gray-700">
          <span class="font-medium">{{ startItem }}</span>
          から
          <span class="font-medium">{{ endItem }}</span>
          件目を表示（全
          <span class="font-medium">{{ total }}</span>
          件中）
        </p>
      </div>

      <div>
        <nav class="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
          <!-- Previous button -->
          <button
            :disabled="currentPage <= 1"
            :class="[
              'relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0',
              currentPage <= 1 ? 'cursor-not-allowed opacity-50' : 'hover:text-gray-500 focus-ring',
            ]"
            @click="goToPage(currentPage - 1)"
          >
            <span class="sr-only">前のページ</span>
            <ChevronLeftIcon class="h-5 w-5" aria-hidden="true" />
          </button>

          <!-- Page numbers -->
          <template v-for="page in visiblePages" :key="page">
            <button
              v-if="typeof page === 'number'"
              :class="[
                'relative inline-flex items-center px-4 py-2 text-sm font-semibold ring-1 ring-inset ring-gray-300 focus:z-20 focus:outline-offset-0',
                page === currentPage
                  ? 'z-10 bg-primary-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600'
                  : 'text-gray-900 hover:bg-gray-50 focus-ring',
              ]"
              @click="goToPage(page)"
            >
              {{ page }}
            </button>
            <span
              v-else
              class="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300"
            >
              ...
            </span>
          </template>

          <!-- Next button -->
          <button
            :disabled="currentPage >= totalPages"
            :class="[
              'relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0',
              currentPage >= totalPages
                ? 'cursor-not-allowed opacity-50'
                : 'hover:text-gray-500 focus-ring',
            ]"
            @click="goToPage(currentPage + 1)"
          >
            <span class="sr-only">次のページ</span>
            <ChevronRightIcon class="h-5 w-5" aria-hidden="true" />
          </button>
        </nav>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/vue/20/solid';
import Button from './Button.vue';

interface Props {
  currentPage: number;
  totalPages: number;
  total: number;
  perPage: number;
  maxVisiblePages?: number;
}

interface Emits {
  (e: 'page-change', page: number): void;
}

const props = withDefaults(defineProps<Props>(), {
  maxVisiblePages: 7,
});

const emit = defineEmits<Emits>();

const startItem = computed(() => {
  return (props.currentPage - 1) * props.perPage + 1;
});

const endItem = computed(() => {
  return Math.min(props.currentPage * props.perPage, props.total);
});

const visiblePages = computed(() => {
  const pages: (number | string)[] = [];
  const { currentPage, totalPages, maxVisiblePages } = props;

  if (totalPages <= maxVisiblePages) {
    // Show all pages if total is less than max visible
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
  } else {
    // Always show first page
    pages.push(1);

    const startPage = Math.max(2, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 3);

    // Add ellipsis after first page if needed
    if (startPage > 2) {
      pages.push('...');
    }

    // Add middle pages
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    // Add ellipsis before last page if needed
    if (endPage < totalPages - 1) {
      pages.push('...');
    }

    // Always show last page if more than 1 page
    if (totalPages > 1) {
      pages.push(totalPages);
    }
  }

  return pages;
});

const goToPage = (page: number) => {
  if (page >= 1 && page <= props.totalPages && page !== props.currentPage) {
    emit('page-change', page);
  }
};
</script>
