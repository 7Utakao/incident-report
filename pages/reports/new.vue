<template>
  <div class="min-h-screen bg-background">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex items-center space-x-4 mb-4">
          <Button variant="ghost" @click="handleBack"> ← 戻る </Button>
        </div>
        <h1 class="text-2xl font-bold text-secondary">新しい報告を作成</h1>
        <p class="mt-2 text-gray">
          つまずき・気づきを入力しましょう。AIがタイトル・カテゴリ・改善案を提案します。
        </p>
      </div>

      <!-- Single Page Form -->
      <Card>
        <div class="space-y-6">
          <!-- Original Content Input -->
          <div>
            <label class="block text-sm font-medium text-secondary mb-2">
              本文 <span class="text-error">*</span>
            </label>
            <textarea
              v-model="initialContent"
              rows="6"
              class="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-400 focus:border-emerald-400 resize-none bg-white dark:bg-white dark:border-slate-200 dark:text-gray-900"
              placeholder="例：会議資料を別の取引先へ誤送信。すぐに連絡・回収依頼を行い影響調査中。原因は宛先オートコンプリートの選択ミス。"
            ></textarea>
            <p class="mt-2 text-xs text-slate-500">※ 入力内容は後から自由に編集できます。</p>
          </div>

          <!-- AI Generate Button -->
          <div class="mt-2 flex justify-end">
            <button
              type="button"
              :disabled="!initialContent.trim() || generating"
              @click="generateReport"
              class="inline-flex items-center gap-2 rounded-lg bg-emerald-600 text-white px-3 py-2 text-sm hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg
                v-if="!generating"
                xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M5 8h14M7 12h10M9 16h6" />
              </svg>
              <div
                v-if="generating"
                class="animate-spin rounded-full h-4 w-4 border-b-2 border-current"
              ></div>
              <span v-if="generating">AI生成中...</span>
              <span v-else>AI提案</span>
            </button>
          </div>

          <!-- Generated Form Fields -->
          <div class="space-y-6">
            <!-- Title -->
            <div>
              <Input
                v-model="report.title"
                label="タイトル"
                placeholder="タイトルを入力"
                required
              />
            </div>

            <!-- Category -->
            <div>
              <Select
                v-model="report.category"
                label="カテゴリ"
                :options="categoryOptions"
                placeholder="カテゴリを選択"
                required
              />
            </div>

            <!-- Date -->
            <div>
              <Input v-model="report.occurredAt" label="作成日時" type="date" required />
            </div>

            <!-- Content -->
            <div>
              <label class="block text-sm font-medium text-secondary mb-2"> 内容 </label>
              <textarea
                v-model="report.content"
                rows="5"
                class="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-400 focus:border-emerald-400 resize-none bg-white dark:bg-white dark:border-slate-200 dark:text-gray-900"
                placeholder="経緯・影響・対応などを簡潔に"
              ></textarea>
            </div>

            <!-- Improvement Suggestions -->
            <div>
              <label class="block text-sm font-medium text-secondary mb-2"> 改善案 </label>
              <textarea
                v-model="report.improvements"
                rows="5"
                class="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-400 focus:border-emerald-400 resize-none bg-white dark:bg-white dark:border-slate-200 dark:text-gray-900"
                placeholder="宛先は最後に入力するルール化、ダブルチェックを運用に組み込む など"
              ></textarea>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex justify-between pt-6">
            <Button variant="ghost" @click="handleCancel"> キャンセル </Button>
            <div class="flex space-x-3">
              <Button variant="secondary" @click="clearContent"> クリア </Button>
              <Button
                variant="primary"
                :disabled="!isFormValid"
                :loading="submitting"
                @click="submitReport"
              >
                投稿する
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <!-- Success Dialog -->
      <Dialog :open="showSuccessDialog" title="投稿完了" @close="handleDialogClose">
        <div class="text-center py-4">
          <div class="text-6xl mb-4">✅</div>
          <p class="text-lg font-medium text-secondary mb-2">報告が正常に投稿されました</p>
          <p class="text-gray">改善提案として記録され、チーム全体で共有されます。</p>
        </div>

        <template #actions>
          <div class="!flex !justify-between !items-center !w-full !grid-cols-none !gap-0">
            <Button variant="secondary" @click="createAnother"> 新しい報告を作成 </Button>
            <Button variant="primary" @click="goToReportsList"> 報告一覧へ </Button>
          </div>
        </template>
      </Dialog>

      <!-- Confirmation Dialog -->
      <Dialog
        :open="showConfirmDialog"
        title="入力内容を破棄しますか？"
        @close="showConfirmDialog = false"
      >
        <div class="py-4">
          <p class="text-gray">
            入力した内容や生成されたデータが失われます。本当に画面を離れますか？
          </p>
        </div>

        <template #actions>
          <Button variant="secondary" @click="onCancelLeave"> いいえ </Button>
          <Button variant="primary" @click="onConfirmLeave"> はい </Button>
        </template>
      </Dialog>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { COPY } from '~/constants/copy';

// Router
const router = useRouter();

// Components
import Card from '~/components/ui/Card.vue';
import Button from '~/components/ui/Button.vue';
import Input from '~/components/ui/Input.vue';
import Select from '~/components/ui/Select.vue';
import Badge from '~/components/ui/Badge.vue';
import Dialog from '~/components/ui/Dialog.vue';

// Types
interface Report {
  title: string;
  category: string;
  occurredAt: string;
  content: string;
  improvements: string;
}

// Reactive data
const initialContent = ref('');
const generating = ref(false);
const submitting = ref(false);
const showSuccessDialog = ref(false);
const showConfirmDialog = ref(false);
const showValidationDialog = ref(false);
const validationResult = ref<any>(null);
let pendingNavigation: {
  to: any;
  from: any;
  next: import('vue-router').NavigationGuardNext;
} | null = null;

const report = ref<Report>({
  title: '',
  category: '',
  occurredAt: new Date().toISOString().split('T')[0],
  content: '',
  improvements: '',
});

// カテゴリオプション
import { getCategoryOptions } from '~/constants/categories';
const categoryOptions = getCategoryOptions();

// Computed
const isFormValid = computed(() => {
  return (
    report.value.title.trim() &&
    report.value.category &&
    report.value.occurredAt &&
    report.value.content.trim()
  );
});

// 入力内容があるかどうかを判定
const hasUserInput = computed(() => {
  return (
    initialContent.value.trim() ||
    report.value.title.trim() ||
    report.value.content.trim() ||
    report.value.improvements.trim() ||
    generating.value
  );
});

// Methods
const getCategoryLabel = (value: string): string => {
  const option = categoryOptions.find((opt: any) => opt.value === value);
  return option?.label || value;
};

const formatDate = (dateString: string) => {
  return format(new Date(dateString), 'yyyy年MM月dd日', { locale: ja });
};

const clearContent = () => {
  initialContent.value = '';
  report.value = {
    title: '',
    category: '',
    occurredAt: new Date().toISOString().split('T')[0],
    content: '',
    improvements: '',
  };
};

const handleBack = () => {
  router.back(); // Vue Routerガードが自動的に確認ダイアログを表示
};

const handleCancel = () => {
  navigateTo('/reports'); // Vue Routerガードが自動的に確認ダイアログを表示
};

const onConfirmLeave = () => {
  if (!pendingNavigation) return;
  pendingNavigation = null;
  showConfirmDialog.value = false;

  // 常にレポート一覧に戻る
  navigateTo('/reports');
};

const onCancelLeave = () => {
  pendingNavigation = null;
  showConfirmDialog.value = false;
  // ダイアログを閉じるだけで、ナビゲーションはキャンセル
};

const generateReport = async () => {
  if (!initialContent.value.trim()) return;

  // 二重送信防止
  if (generating.value) return;

  try {
    generating.value = true;
    const { ai } = useApi();
    const result = await ai.generate(initialContent.value.trim());

    // フォームへ反映
    report.value = {
      title: String(result.title || 'AI生成タイトル'),
      category: String(result.category || 'LEGACY_005'), // デフォルトは「その他」
      occurredAt: new Date().toISOString().split('T')[0],
      content: String(result.summary || initialContent.value),
      improvements: Array.isArray(result.improvements)
        ? result.improvements.join('\n')
        : String(result.improvements || '改善案を検討してください'),
    };
  } catch (error: any) {
    // 失敗理由の見える化

    // 503 Service Unavailable の場合は特別な処理
    if (error.statusCode === 503) {
      const retrySeconds = error.retryAfter || 2;
      alert(`サービスが一時的に過負荷状態です。\n${retrySeconds}秒後に再試行してください。`);
    } else if (error.message?.includes('実行中です')) {
      // 連続送信エラー
      alert('AI生成処理が実行中です。しばらくお待ちください。');
    } else if (error.message?.includes('お待ちください')) {
      // 間隔制限エラー
      alert(error.message);
    } else {
      // その他のエラー
      alert(`AI生成に失敗しました: ${error.message ?? error}`);
    }
  } finally {
    generating.value = false;
  }
};

const submitReport = async () => {
  try {
    submitting.value = true;

    // 投稿前バリデーション
    const { validate } = useApi();
    const validationData = {
      title: report.value.title,
      category: report.value.category,
      occurredAt: report.value.occurredAt,
      content: report.value.content,
      improvements: report.value.improvements,
    };

    const validation = await validate.report(validationData);

    // エラーがある場合は投稿をブロック
    if (!validation.valid) {
      alert(`投稿できません:\n${validation.errors.join('\n')}`);
      return;
    }

    // 警告がある場合は確認ダイアログを表示
    if (validation.warnings.length > 0 || validation.suggestedReplacements.length > 0) {
      let warningMessage = '以下の問題が検出されました:\n\n';

      if (validation.warnings.length > 0) {
        warningMessage += '⚠️ 警告:\n' + validation.warnings.join('\n') + '\n\n';
      }

      if (validation.suggestedReplacements.length > 0) {
        warningMessage += '🔍 検出された情報:\n';
        validation.suggestedReplacements.forEach((replacement: any) => {
          warningMessage += `- "${replacement.original}" → "${replacement.suggested}"\n`;
        });
        warningMessage += '\n';
      }

      warningMessage += 'このまま投稿しますか？';

      if (!confirm(warningMessage)) {
        return;
      }
    }

    // 送信データを準備
    const submitData = {
      title: report.value.title,
      body: report.value.content,
      category: report.value.category,
      createdAt: report.value.occurredAt,
      improvements: report.value.improvements, // 改善案を追加
    };

    // 実際のAPI呼び出し
    const { reports } = useApi();
    await reports.create(submitData);

    showSuccessDialog.value = true;
  } catch (error: any) {
    alert(`投稿に失敗しました: ${error.message || error}`);
  } finally {
    submitting.value = false;
  }
};

const createAnother = () => {
  showSuccessDialog.value = false;
  clearContent();
};

const handleDialogClose = () => {
  showSuccessDialog.value = false;
  clearContent();
};

const goToReportsList = () => {
  showSuccessDialog.value = false;
  navigateTo('/reports');
};

// Navigation guard - 一時的に無効化（モーダルの「はい」ボタンが反応しないため）
// TODO: 後でモーダルの動作を修正してから再有効化する
/*
onBeforeRouteLeave((to, from, next) => {
  if (hasUserInput.value && !showSuccessDialog.value) {
    pendingNavigation = { to, from, next };
    showConfirmDialog.value = true;
    next(false);
  } else {
    next();
  }
});
*/

// Meta
useHead({
  title: '新しい報告を作成 - 報告システム',
});

// 認証ガード
definePageMeta({
  middleware: 'auth',
  layout: 'app',
});
</script>
