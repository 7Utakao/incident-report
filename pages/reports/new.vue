<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="bg-white shadow rounded-lg">
        <div class="px-6 py-4 border-b border-gray-200">
          <h1 class="text-xl font-semibold text-gray-900">新規インシデントレポート</h1>
        </div>

        <form @submit.prevent="submitReport" class="p-6 space-y-6">
          <!-- タイトル -->
          <div>
            <label for="title" class="block text-sm font-medium text-gray-700 mb-2">
              タイトル <span class="text-red-500">*</span>
            </label>
            <input
              id="title"
              v-model="form.title"
              type="text"
              required
              maxlength="200"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="インシデントのタイトルを入力してください"
            />
            <p class="mt-1 text-sm text-gray-500">{{ form.title.length }}/200文字</p>
          </div>

          <!-- 本文 -->
          <div>
            <label for="body" class="block text-sm font-medium text-gray-700 mb-2">
              本文 <span class="text-red-500">*</span>
            </label>
            <textarea
              id="body"
              v-model="form.body"
              required
              maxlength="5000"
              rows="8"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="インシデントの詳細を記述してください。個人名、顧客名、メールアドレス、電話番号などの機密情報は含めないでください。"
            />
            <p class="mt-1 text-sm text-gray-500">{{ form.body.length }}/5000文字</p>
          </div>

          <!-- 送信ボタン -->
          <div class="flex justify-end space-x-3">
            <button
              type="button"
              @click="router.push('/reports')"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              キャンセル
            </button>
            <button
              type="submit"
              :disabled="loading || !form.title.trim() || !form.body.trim()"
              class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="loading" class="flex items-center">
                <svg
                  class="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    class="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    stroke-width="4"
                  ></circle>
                  <path
                    class="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                送信中...
              </span>
              <span v-else>送信</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- 結果モーダル -->
    <TransitionRoot as="template" :show="showModal">
      <Dialog as="div" class="relative z-10" @close="closeModal">
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
                class="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl sm:p-6"
              >
                <div>
                  <div
                    class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100"
                  >
                    <CheckIcon class="h-6 w-6 text-green-600" aria-hidden="true" />
                  </div>
                  <div class="mt-3 text-center sm:mt-5">
                    <DialogTitle as="h3" class="text-lg font-semibold leading-6 text-gray-900">
                      レポートが正常に作成されました
                    </DialogTitle>

                    <div v-if="result" class="mt-4 text-left">
                      <!-- AI処理結果 -->
                      <div class="bg-gray-50 rounded-lg p-4 space-y-4">
                        <div>
                          <h4 class="text-sm font-medium text-gray-700">要約</h4>
                          <p class="mt-1 text-sm text-gray-900">{{ result.aiResult.summary }}</p>
                        </div>

                        <div>
                          <h4 class="text-sm font-medium text-gray-700">カテゴリ</h4>
                          <span
                            class="mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            {{ result.aiResult.category }}
                          </span>
                        </div>

                        <div>
                          <h4 class="text-sm font-medium text-gray-700">タグ</h4>
                          <div class="mt-1 flex flex-wrap gap-1">
                            <span
                              v-for="tag in result.aiResult.tags"
                              :key="tag"
                              class="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800"
                            >
                              {{ tag }}
                            </span>
                          </div>
                        </div>

                        <div v-if="result.aiResult.suggestedReplacements.length > 0">
                          <h4 class="text-sm font-medium text-gray-700">匿名化処理</h4>
                          <div class="mt-1 space-y-1">
                            <div
                              v-for="replacement in result.aiResult.suggestedReplacements"
                              :key="replacement.from"
                              class="text-xs text-gray-600"
                            >
                              「{{ replacement.from }}」→「{{ replacement.to }}」
                            </div>
                          </div>
                        </div>

                        <div
                          v-if="result.flags.containsDisallowed"
                          class="bg-yellow-50 border border-yellow-200 rounded p-3"
                        >
                          <div class="flex">
                            <ExclamationTriangleIcon
                              class="h-5 w-5 text-yellow-400"
                              aria-hidden="true"
                            />
                            <div class="ml-3">
                              <p class="text-sm text-yellow-700">
                                不適切な情報が検出され、自動的に匿名化されました。
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                  <button
                    type="button"
                    class="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 sm:col-start-2"
                    @click="goToReports"
                  >
                    一覧を見る
                  </button>
                  <button
                    type="button"
                    class="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:col-start-1 sm:mt-0"
                    @click="closeModal"
                  >
                    閉じる
                  </button>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>

    <!-- NGワード確認モーダル -->
    <TransitionRoot as="template" :show="showConfirmModal">
      <Dialog as="div" class="relative z-10" @close="closeConfirmModal">
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
                class="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl sm:p-6"
              >
                <div>
                  <div
                    class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100"
                  >
                    <ExclamationTriangleIcon class="h-6 w-6 text-yellow-600" aria-hidden="true" />
                  </div>
                  <div class="mt-3 text-center sm:mt-5">
                    <DialogTitle as="h3" class="text-lg font-semibold leading-6 text-gray-900">
                      機密情報が検出されました
                    </DialogTitle>

                    <div class="mt-4 text-left">
                      <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <p class="text-sm text-yellow-800 mb-3">
                          以下の情報が検出され、自動的に匿名化されました。このまま登録してもよろしいですか？
                        </p>

                        <div
                          v-if="result && result.aiResult.suggestedReplacements.length > 0"
                          class="space-y-2"
                        >
                          <div
                            v-for="replacement in result.aiResult.suggestedReplacements"
                            :key="replacement.from"
                            class="flex items-center justify-between bg-white rounded px-3 py-2 text-sm"
                          >
                            <span class="text-red-600 font-medium">{{ replacement.from }}</span>
                            <span class="text-gray-400">→</span>
                            <span class="text-green-600 font-medium">{{ replacement.to }}</span>
                          </div>
                        </div>
                      </div>

                      <div class="mt-4 bg-gray-50 rounded-lg p-4">
                        <h4 class="text-sm font-medium text-gray-700 mb-2">
                          匿名化後の本文プレビュー
                        </h4>
                        <p class="text-sm text-gray-900 whitespace-pre-wrap">
                          {{ result?.aiResult.anonymizedText }}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                  <button
                    type="button"
                    class="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 sm:col-start-2"
                    @click="confirmSubmit"
                  >
                    このまま登録する
                  </button>
                  <button
                    type="button"
                    class="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:col-start-1 sm:mt-0"
                    @click="cancelSubmit"
                  >
                    修正して再送信
                  </button>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>
  </div>
</template>

<script setup lang="ts">
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue';
import { CheckIcon, ExclamationTriangleIcon } from '@heroicons/vue/24/outline';
import { useRuntimeConfig } from 'nuxt/app';
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';

// 型定義
interface AiResult {
  aiResult: {
    summary: string;
    category: string;
    tags: string[];
    anonymizedText: string;
    suggestedReplacements: { from: string; to: string }[];
  };
  flags: { containsDisallowed: boolean };
}

// メタデータ
definePageMeta({
  title: '新規レポート作成',
});

// リアクティブデータ
const form = reactive({
  title: '',
  body: '',
});

const loading = ref(false);
const showModal = ref(false);
const showConfirmModal = ref(false);
const result = ref<AiResult | null>(null);

// 設定
const config = useRuntimeConfig();
const router = useRouter();
const { getIdToken } = useIdToken();

// レポート送信
const submitReport = async () => {
  try {
    loading.value = true;

    // IDトークン取得（認証チェック）
    const token = await getIdToken();

    // API呼び出し
    const response = await $fetch(`${config.public.apiUrl}/reports`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : '',
      },
      body: {
        title: form.title.trim(),
        body: form.body.trim(),
      },
    });

    result.value = response;

    // NGワード検出時は確認モーダルを表示
    if (response.flags && response.flags.containsDisallowed) {
      showConfirmModal.value = true;
    } else {
      showModal.value = true;
      // フォームをリセット
      form.title = '';
      form.body = '';
    }
  } catch (error: any) {
    console.error('レポート送信エラー:', error);
    alert(`エラーが発生しました: ${error.message || 'レポートの送信に失敗しました'}`);
  } finally {
    loading.value = false;
  }
};

// モーダルを閉じる
const closeModal = () => {
  showModal.value = false;
  result.value = null;
};

// 確認モーダルを閉じる
const closeConfirmModal = () => {
  showConfirmModal.value = false;
};

// 匿名化を承認して送信
const confirmSubmit = () => {
  showConfirmModal.value = false;
  showModal.value = true;
  // フォームをリセット
  form.title = '';
  form.body = '';
};

// 修正のため送信をキャンセル
const cancelSubmit = () => {
  showConfirmModal.value = false;
  result.value = null;
};

// 一覧画面に遷移
const goToReports = () => {
  closeModal();
  router.push('/reports');
};
</script>
