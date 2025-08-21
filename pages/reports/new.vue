<template>
  <div class="min-h-screen bg-background">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex items-center space-x-4 mb-4">
          <Button variant="ghost" @click="$router.back()"> ← 戻る </Button>
        </div>
        <h1 class="text-3xl font-bold text-secondary">新しい報告を作成</h1>
        <p class="mt-2 text-gray">{{ COPY.newGuidance }}</p>
      </div>

      <!-- Single Page Form -->
      <Card title="インシデント報告">
        <div class="space-y-6">
          <!-- Original Content Input -->
          <div>
            <label class="block text-sm font-medium text-secondary mb-2">
              本文 <span class="text-error">*</span>
            </label>
            <textarea
              v-model="initialContent"
              rows="8"
              class="w-full px-3 py-2 border border-gray-300 rounded-token-md focus-ring resize-none"
              placeholder="メール送信時の確認不足により、宛先を間違えて送信してしまいました。今後は送信前に宛先を二重チェックする仕組みを作りたいと思います。具体的には..."
            ></textarea>
            <p class="mt-2 text-sm text-gray">
              発生した問題の詳細をできるだけ具体的に記述してください。AIが自動的にタイトル、カテゴリ、改善案を生成します。
            </p>
          </div>

          <!-- AI Generate Button -->
          <div class="mt-2 flex justify-end">
            <Button
              variant="primary"
              :disabled="!initialContent.trim() || generating"
              :loading="generating"
              @click="generateReport"
              class="px-8 py-3"
            >
              <span v-if="generating">AI生成中...</span>
              <span v-else>AI生成</span>
            </Button>
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
              <Input v-model="report.occurredAt" label="発生日時" type="date" required />
            </div>

            <!-- Content -->
            <div>
              <label class="block text-sm font-medium text-secondary mb-2">
                内容（AI整理済み）
              </label>
              <textarea
                v-model="report.content"
                rows="8"
                class="w-full px-3 py-2 border border-gray-300 rounded-token-md focus-ring resize-none"
                placeholder="AI生成後に内容が表示されます"
              ></textarea>
            </div>

            <!-- Improvement Suggestions -->
            <div>
              <label class="block text-sm font-medium text-secondary mb-2">
                改善案（AI提案）
              </label>
              <textarea
                v-model="report.improvements"
                rows="6"
                class="w-full px-3 py-2 border border-gray-300 rounded-token-md focus-ring resize-none"
                placeholder="AI生成後に改善案が表示されます"
              ></textarea>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex justify-between pt-6">
            <Button variant="ghost" @click="$router.back()"> キャンセル </Button>
            <div class="flex space-x-3">
              <Button variant="secondary" @click="clearContent"> クリア </Button>
              <Button variant="secondary" @click="saveDraft"> 下書き保存 </Button>
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

        <template #footer>
          <div class="flex justify-center space-x-3">
            <Button variant="secondary" @click="createAnother"> 新しい報告を作成 </Button>
            <Button variant="primary" @click="goToReportsList"> 報告一覧へ </Button>
          </div>
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
const initialContent = ref(
  'メール送信時の確認不足により、宛先を間違えて送信してしまいました。今後は送信前に宛先を二重チェックする仕組みを作りたいと思います。具体的には、送信ボタンを押す前に確認ダイアログを表示し、宛先リストを再度確認できるようにしたいと考えています。',
);
const generating = ref(false);
const submitting = ref(false);
const showSuccessDialog = ref(false);

const report = ref<Report>({
  title: '',
  category: '',
  occurredAt: new Date().toISOString().split('T')[0],
  content: '',
  improvements: '',
});

// Options
const categoryOptions = [
  { value: '情報漏洩・誤送信', label: '情報漏洩・誤送信' },
  { value: 'システム障害', label: 'システム障害' },
  { value: '作業ミス', label: '作業ミス' },
  { value: 'コミュニケーション', label: 'コミュニケーション' },
  { value: 'その他', label: 'その他' },
];

// Computed
const isFormValid = computed(() => {
  return (
    report.value.title.trim() &&
    report.value.category &&
    report.value.occurredAt &&
    report.value.content.trim()
  );
});

// Methods
const getCategoryVariant = (
  category: string,
): 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'outline' => {
  const variants: Record<
    string,
    'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'outline'
  > = {
    '情報漏洩・誤送信': 'error',
    システム障害: 'warning',
    作業ミス: 'primary',
    コミュニケーション: 'secondary',
    その他: 'default',
  };
  return variants[category] || 'default';
};

const getCategoryLabel = (value: string): string => {
  const option = categoryOptions.find((opt) => opt.value === value);
  return option?.label || value;
};

const formatDate = (dateString: string) => {
  return format(new Date(dateString), 'yyyy年MM月dd日', { locale: ja });
};

const clearContent = () => {
  initialContent.value = '';
};

const generateReport = async () => {
  if (!initialContent.value.trim()) return;

  // 二重送信防止
  if (generating.value) return;

  try {
    generating.value = true;
    console.log('🚀 AI生成開始');

    const { ai } = useApi();
    const result = await ai.generate(initialContent.value.trim());

    console.log('✅ AI生成結果:', result);

    // フォームへ反映
    report.value = {
      title: String(result.title || 'AI生成タイトル'),
      category: String(result.category || 'その他'),
      occurredAt: new Date().toISOString().split('T')[0],
      content: String(result.summary || initialContent.value),
      improvements: Array.isArray(result.improvements)
        ? result.improvements.join('\n')
        : String(result.improvements || '改善案を検討してください'),
    };

    console.log('✅ Report mapped successfully:', report.value);
    console.log('🎉 AI生成が正常に完了しました！');
  } catch (error: any) {
    // 失敗理由の見える化
    console.error('ai/generate failed:', error);

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

const saveDraft = async () => {
  try {
    const draftData = {
      initialContent: initialContent.value,
      report: report.value,
      timestamp: new Date().toISOString(),
    };

    // Save to localStorage (in a real app, this would be saved to a server)
    if (process.client) {
      const existingDrafts = JSON.parse(localStorage.getItem('reportDrafts') || '[]');
      const draftId = `draft_${Date.now()}`;

      existingDrafts.push({
        id: draftId,
        ...draftData,
        title: report.value.title || '無題の下書き',
      });

      localStorage.setItem('reportDrafts', JSON.stringify(existingDrafts));

      // Show success message (in a real app, you'd use a toast notification)
      alert('下書きを保存しました');
    }
  } catch (error) {
    console.error('Draft save error:', error);
    alert('下書きの保存に失敗しました');
  }
};

const submitReport = async () => {
  try {
    submitting.value = true;

    // 実際のAPI呼び出し
    const { reports } = useApi();
    await reports.create({
      title: report.value.title,
      body: report.value.content,
      category: report.value.category,
      createdAt: report.value.occurredAt,
    });

    showSuccessDialog.value = true;
  } catch (error: any) {
    console.error('Report submission failed:', error);
    alert(`投稿に失敗しました: ${error.message || error}`);
  } finally {
    submitting.value = false;
  }
};

const createAnother = () => {
  showSuccessDialog.value = false;
  initialContent.value = '';
  report.value = {
    title: '',
    category: '',
    occurredAt: new Date().toISOString().split('T')[0],
    content: '',
    improvements: '',
  };
};

const handleDialogClose = () => {
  showSuccessDialog.value = false;
  // モーダルを閉じた時にフォームを初期化
  initialContent.value = '';
  report.value = {
    title: '',
    category: '',
    occurredAt: new Date().toISOString().split('T')[0],
    content: '',
    improvements: '',
  };
};

const goToReportsList = () => {
  showSuccessDialog.value = false;
  navigateTo('/reports');
};

// Meta
useHead({
  title: '新しい報告を作成 - 報告システム',
});
</script>
