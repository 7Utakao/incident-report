<template>
  <div class="overflow-hidden rounded-token-lg border border-gray-200 bg-white">
    <div v-if="loading" class="p-8 text-center">
      <div
        class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"
      ></div>
      <p class="mt-2 text-gray">読み込み中...</p>
    </div>

    <div v-else class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th
              v-for="column in columns"
              :key="column.key"
              :class="[
                'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
                column.sortable ? 'cursor-pointer hover:bg-gray-100 select-none' : '',
              ]"
              @click="column.sortable ? handleSort(column.key) : null"
            >
              <div class="flex items-center space-x-1">
                <span>{{ column.label }}</span>
                <div v-if="column.sortable" class="flex flex-col">
                  <ChevronUpIcon
                    :class="[
                      'h-3 w-3',
                      sortKey === column.key && sortOrder === 'asc'
                        ? 'text-primary-600'
                        : 'text-gray-300',
                    ]"
                  />
                  <ChevronDownIcon
                    :class="[
                      'h-3 w-3 -mt-1',
                      sortKey === column.key && sortOrder === 'desc'
                        ? 'text-primary-600'
                        : 'text-gray-300',
                    ]"
                  />
                </div>
              </div>
            </th>
            <th
              v-if="$slots.actions"
              class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              操作
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr
            v-for="(item, index) in sortedData"
            :key="getRowKey(item, index)"
            :class="[
              'hover:bg-gray-50 transition-colors duration-150',
              rowClickable ? 'cursor-pointer' : '',
            ]"
            @click="rowClickable ? $emit('row-click', item, index) : null"
          >
            <td
              v-for="column in columns"
              :key="column.key"
              class="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
            >
              <slot
                :name="`cell-${column.key}`"
                :item="item"
                :value="getNestedValue(item, column.key)"
                :index="index"
              >
                {{ formatCellValue(getNestedValue(item, column.key), column) }}
              </slot>
            </td>
            <td
              v-if="$slots.actions"
              class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"
            >
              <slot name="actions" :item="item" :index="index" />
            </td>
          </tr>

          <!-- Empty state -->
          <tr v-if="sortedData.length === 0">
            <td
              :colspan="columns.length + ($slots.actions ? 1 : 0)"
              class="px-6 py-12 text-center text-gray-500"
            >
              <slot name="empty">
                <div class="text-center">
                  <p class="text-lg font-medium">データがありません</p>
                  <p class="text-sm mt-1">条件を変更して再度お試しください</p>
                </div>
              </slot>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/vue/20/solid';

export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  formatter?: (value: any) => string;
  width?: string;
}

interface Props {
  columns: TableColumn[];
  data: any[];
  loading?: boolean;
  rowClickable?: boolean;
  defaultSortKey?: string;
  defaultSortOrder?: 'asc' | 'desc';
  rowKey?: string | ((item: any, index: number) => string | number);
}

interface Emits {
  (e: 'row-click', item: any, index: number): void;
  (e: 'sort', key: string, order: 'asc' | 'desc'): void;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  rowClickable: false,
  defaultSortOrder: 'asc',
});

const emit = defineEmits<Emits>();

const sortKey = ref<string>(props.defaultSortKey || '');
const sortOrder = ref<'asc' | 'desc'>(props.defaultSortOrder);

const sortedData = computed(() => {
  if (!sortKey.value) return props.data;

  return [...props.data].sort((a, b) => {
    const aValue = getNestedValue(a, sortKey.value);
    const bValue = getNestedValue(b, sortKey.value);

    if (aValue === bValue) return 0;

    const comparison = aValue < bValue ? -1 : 1;
    return sortOrder.value === 'asc' ? comparison : -comparison;
  });
});

const handleSort = (key: string) => {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortKey.value = key;
    sortOrder.value = 'asc';
  }

  emit('sort', sortKey.value, sortOrder.value);
};

const getNestedValue = (obj: any, path: string): any => {
  return path.split('.').reduce((current, key) => current?.[key], obj);
};

const formatCellValue = (value: any, column: TableColumn): string => {
  if (value === null || value === undefined) return '-';

  if (column.formatter) {
    return column.formatter(value);
  }

  return String(value);
};

const getRowKey = (item: any, index: number): string | number => {
  if (typeof props.rowKey === 'function') {
    return props.rowKey(item, index);
  }

  if (typeof props.rowKey === 'string') {
    return getNestedValue(item, props.rowKey) || index;
  }

  return item.id || index;
};
</script>
