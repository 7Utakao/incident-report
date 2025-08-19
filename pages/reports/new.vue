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

      <!-- Step Indicator -->
      <div class="mb-8">
        <div class="flex items-center justify-center space-x-4">
          <div class="flex items-center">
            <div
              :class="[
                'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
                currentStep >= 1 ? 'bg-primary-500 text-white' : 'bg-gray-200 text-gray-500',
              ]"
            >
              1
            </div>
            <span class="ml-2 text-sm font-medium text-gray-700">本文入力</span>
          </div>
          <div class="w-16 h-0.5 bg-gray-200"></div>
          <div class="flex items-center">
            <div
              :class="[
                'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
                currentStep >= 2 ? 'bg-primary-500 text-white' : 'bg-gray-200 text-gray-500',
              ]"
            >
              2
            </div>
            <span class="ml-2 text-sm font-medium text-gray-700">AI生成・編集</span>
          </div>
          <div class="w-16 h-0.5 bg-gray-200"></div>
          <div class="flex items-center">
            <div
              :class="[
                'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
                currentStep >= 3 ? 'bg-primary-500 text-white' : 'bg-gray-200 text-gray-500',
              ]"
            >
              3
            </div>
            <span class="ml-2 text-sm font-medium text-gray-700">投稿</span>
          </div>
        </div>
      </div>

      <!-- Step 1: Initial Input -->
      <Card v-if="currentStep === 1" title="インシデントの詳細を入力">
        <div class="space-y-6">
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

          <div class="flex justify-between">
            <Button variant="ghost" @click="$router.back()"> キャンセル </Button>
            <div class="flex space-x-3">
              <Button variant="secondary" @click="clearContent"> クリア </Button>
              <Button
                variant="primary"
                :disabled="!initialContent.trim()"
                :loading="generating"
                @click="generateReport"
              >
                AI生成
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <!-- Step 2: AI Generated Results -->
      <Card v-if="currentStep === 2" title="AI生成結果 - 確認・編集">
        <div class="space-y-6">
          <!-- Original Content (preserved) -->
          <div>
            <label class="block text-sm font-medium text-secondary mb-2">
              元の本文 <span class="text-xs text-gray-500">（再生成時に参照されます）</span>
            </label>
            <textarea
              v-model="initialContent"
              rows="4"
              class="w-full px-3 py-2 border border-gray-300 rounded-token-md focus-ring resize-none bg-gray-50"
              placeholder="元の本文がここに表示されます"
            ></textarea>
          </div>

          <!-- Title -->
          <div>
            <Input v-model="report.title" label="タイトル" placeholder="タイトルを入力" required />
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
            ></textarea>
          </div>

          <!-- Improvement Suggestions -->
          <div>
            <label class="block text-sm font-medium text-secondary mb-2"> 改善案（AI提案） </label>
            <textarea
              v-model="report.improvements"
              rows="6"
              class="w-full px-3 py-2 border border-gray-300 rounded-token-md focus-ring resize-none"
            ></textarea>
          </div>

          <div class="flex justify-between">
            <Button variant="ghost" @click="goBackToStep1"> 戻る </Button>
            <div class="flex space-x-3">
              <Button variant="secondary" :loading="generating" @click="regenerateReport">
                再生成
              </Button>
              <Button variant="ghost" @click="saveDraft"> 下書き保存 </Button>
              <Button variant="primary" :disabled="!isFormValid" @click="proceedToSubmit">
                投稿へ進む
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <!-- Step 3: Final Confirmation -->
      <Card v-if="currentStep === 3" title="投稿確認">
        <div class="space-y-6">
          <!-- Preview -->
          <div class="bg-gray-50 p-6 rounded-token-lg">
            <h3 class="text-lg font-semibold text-secondary mb-4">投稿内容プレビュー</h3>

            <div class="space-y-4">
              <div>
                <span class="text-sm font-medium text-gray-600">タイトル:</span>
                <p class="text-secondary">{{ report.title }}</p>
              </div>

              <div>
                <span class="text-sm font-medium text-gray-600">カテゴリ:</span>
                <Badge :variant="getCategoryVariant(report.category)" class="ml-2">
                  {{ getCategoryLabel(report.category) }}
                </Badge>
              </div>

              <div>
                <span class="text-sm font-medium text-gray-600">発生日時:</span>
                <p class="text-secondary">{{ formatDate(report.occurredAt) }}</p>
              </div>

              <div>
                <span class="text-sm font-medium text-gray-600">内容:</span>
                <div class="mt-1 whitespace-pre-wrap text-secondary">{{ report.content }}</div>
              </div>

              <div>
                <span class="text-sm font-medium text-gray-600">改善案:</span>
                <div class="mt-1 whitespace-pre-wrap text-secondary">{{ report.improvements }}</div>
              </div>
            </div>
          </div>

          <div class="flex justify-between">
            <Button variant="ghost" @click="goBackToStep2"> 編集に戻る </Button>
            <div class="flex space-x-3">
              <Button variant="secondary" @click="saveDraft"> 下書き保存 </Button>
              <Button variant="primary" :loading="submitting" @click="submitReport">
                投稿する
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <!-- Success Dialog -->
      <Dialog :open="showSuccessDialog" title="投稿完了" @close="showSuccessDialog = false">
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
const currentStep = ref(1);
const initialContent = ref('');
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
  return option?.label ?? value;
};

const formatDate = (dateString: string) => {
  return format(new Date(dateString), 'yyyy年MM月dd日', { locale: ja });
};

const clearContent = () => {
  initialContent.value = '';
};

const generateReport = async () => {
  if (!initialContent.value.trim()) return;

  try {
    generating.value = true;

    // Mock AI generation delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Mock AI generated content
    report.value = {
      title: '機密資料の誤送信インシデント',
      category: '情報漏洩・誤送信',
      occurredAt: new Date().toISOString().split('T')[0],
      content: `【発生事象】
- 重要な会議資料を間違った取引先に送信
- 資料には機密情報が含まれていた

【原因】
- 宛先確認の不備
- 送信前のダブルチェック不足

【対応】
- 即座に先方へ連絡・削除依頼
- 上司への報告完了`,
      improvements: `1. 送信前の宛先確認チェックリストの作成
2. 機密資料送信時の上司承認制度の導入
3. メール送信遅延機能の活用
4. 定期的な情報セキュリティ研修の実施`,
    };

    currentStep.value = 2;
  } finally {
    generating.value = false;
  }
};

const regenerateReport = async () => {
  try {
    generating.value = true;
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Mock regenerated content with slight variations
    report.value.title = '重要資料の誤送信による情報漏洩リスク';
    report.value.improvements = `1. 送信前の宛先確認プロセスの強化
2. 機密レベル別の承認フローの確立
3. 自動送信遅延システムの導入
4. 情報セキュリティ意識向上研修の定期実施
5. インシデント対応マニュアルの整備`;
  } finally {
    generating.value = false;
  }
};

const saveDraft = async () => {
  try {
    const draftData = {
      initialContent: initialContent.value,
      report: report.value,
      currentStep: currentStep.value,
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

const goBackToStep1 = () => {
  currentStep.value = 1;
};

const proceedToSubmit = () => {
  currentStep.value = 3;
};

const goBackToStep2 = () => {
  currentStep.value = 2;
};

const submitReport = async () => {
  try {
    submitting.value = true;

    // Mock API submission
    await new Promise((resolve) => setTimeout(resolve, 1500));

    showSuccessDialog.value = true;
  } finally {
    submitting.value = false;
  }
};

const createAnother = () => {
  showSuccessDialog.value = false;
  currentStep.value = 1;
  initialContent.value = '';
  report.value = {
    title: '',
    category: '',
    occurredAt: new Date().toISOString().split('T')[0],
    content: '',
    improvements: '',
  };
};

const goToReportsList = async () => {
  showSuccessDialog.value = false;
  await navigateTo('/reports');
};

// Meta
useHead({
  title: '新しい報告を作成 - 報告システム',
});
</script>
