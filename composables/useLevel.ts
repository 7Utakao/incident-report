import { computed, ref, isRef, type Ref } from 'vue';

// レベル名（9段階）
export const LEVEL_NAMES = [
  'ひよっこ',
  'たねまき',
  '見習い',
  '研究者',
  '冒険者',
  '達人',
  '師範',
  '先導者',
  '伝道師',
];

// レベル n → n+1 に必要な件数
export const STEP_NEED = [5, 10, 15, 20, 30, 70, 150, 200]; // 1→2, 2→3, ...

export interface LevelInfo {
  level: number;
  name: string;
  progress: number; // 0-100の進捗率
  remaining: number; // 次のレベルまでの残り件数
  currentXp: number; // 現在のXP
  nextLevelXp: number; // 次のレベルに必要なXP
}

/**
 * XPからレベル情報を計算する
 */
export function calculateLevel(xp: number): LevelInfo {
  let level = 1;
  let accumulatedXp = 0;

  // 現在のレベルを計算
  for (let i = 0; i < STEP_NEED.length; i++) {
    const stepNeed = STEP_NEED[i];
    if (stepNeed && xp < accumulatedXp + stepNeed) {
      // このレベルの範囲内にいる
      break;
    }
    accumulatedXp += stepNeed || 0;
    level++;
  }

  // 最大レベルに達している場合
  if (level > STEP_NEED.length) {
    level = STEP_NEED.length + 1;
    const name = LEVEL_NAMES[Math.min(level - 1, LEVEL_NAMES.length - 1)] || 'マスター';
    return {
      level,
      name,
      progress: 100,
      remaining: 0,
      currentXp: xp,
      nextLevelXp: xp,
    };
  }

  // 次のレベルに必要なXP
  const stepIndex = level - 1;
  const nextStepNeed = stepIndex < STEP_NEED.length ? STEP_NEED[stepIndex] || 0 : 0;
  const currentLevelXp = xp - accumulatedXp;
  const remaining = Math.max(0, nextStepNeed - currentLevelXp);
  const progress =
    nextStepNeed > 0 ? Math.min(100, Math.round((currentLevelXp / nextStepNeed) * 100)) : 100;

  // レベル名
  const name = LEVEL_NAMES[Math.min(level - 1, LEVEL_NAMES.length - 1)] || 'マスター';

  return {
    level,
    name,
    progress,
    remaining,
    currentXp: xp,
    nextLevelXp: accumulatedXp + nextStepNeed,
  };
}

/**
 * レベルアップ検知用のcomposable
 */
export function useLevel(xp: Ref<number> | number) {
  const xpRef = isRef(xp) ? xp : ref(xp);

  const levelInfo = computed(() => calculateLevel(xpRef.value));

  return {
    level: computed(() => levelInfo.value.level),
    name: computed(() => levelInfo.value.name),
    progress: computed(() => levelInfo.value.progress),
    remaining: computed(() => levelInfo.value.remaining),
    levelInfo,
  };
}

/**
 * レベルアップ検知
 */
export function checkLevelUp(oldXp: number, newXp: number): boolean {
  const oldLevel = calculateLevel(oldXp).level;
  const newLevel = calculateLevel(newXp).level;
  return newLevel > oldLevel;
}

// 堅牢なレベルアップ判定のための型定義
interface LevelState {
  lastXp: number;
  lastLevel: number;
  lastShownLevel?: number;
  lastShownDate?: string; // 'YYYY-MM-DD'
}

// 累積XP閾値テーブルを生成
function generateThresholds(): number[] {
  const thresholds = [0]; // レベル1は0XPから
  let accumulated = 0;

  for (const stepNeed of STEP_NEED) {
    if (stepNeed) {
      accumulated += stepNeed;
      thresholds.push(accumulated);
    }
  }

  return thresholds;
}

const THRESHOLDS = generateThresholds();

/**
 * XPからレベルを計算（累積閾値ベース）
 */
function levelFromXp(xp: number): number {
  let level = 1;
  for (let i = 0; i < THRESHOLDS.length; i++) {
    const threshold = THRESHOLDS[i];
    if (threshold !== undefined && xp >= threshold) {
      level = i + 1;
    } else {
      break;
    }
  }
  return Math.min(level, LEVEL_NAMES.length);
}

/**
 * 今日の日付文字列を取得
 */
function todayStr(d = new Date()): string {
  return d.toISOString().slice(0, 10);
}

/**
 * レベル状態を読み込み
 */
function readLevelState(storageKey: string): LevelState {
  if (typeof window === 'undefined') return { lastXp: 0, lastLevel: 1 };

  try {
    const raw = localStorage.getItem(storageKey);
    return raw ? JSON.parse(raw) : { lastXp: 0, lastLevel: 1 };
  } catch {
    return { lastXp: 0, lastLevel: 1 };
  }
}

/**
 * レベル状態を保存
 */
function writeLevelState(storageKey: string, state: LevelState): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(storageKey, JSON.stringify(state));
  }
}

/**
 * レベルアップ直後だけ true を返す（1回きり）
 * 複数件投稿での取りこぼしや重複表示を完全に防止
 */
export function checkLevelUpJustNow(storageKey: string, currentXp: number): boolean {
  const state = readLevelState(storageKey);
  const prevLevel = state.lastLevel ?? levelFromXp(state.lastXp ?? 0);
  const currLevel = levelFromXp(currentXp);

  const justLeveled = currLevel > prevLevel;
  const shownTodaySameLevel =
    state.lastShownLevel === currLevel && state.lastShownDate === todayStr();

  // 常に最新状態を保存
  state.lastXp = currentXp;
  state.lastLevel = currLevel;

  if (justLeveled && !shownTodaySameLevel) {
    state.lastShownLevel = currLevel;
    state.lastShownDate = todayStr();
    writeLevelState(storageKey, state);
    return true;
  }

  writeLevelState(storageKey, state);
  return false;
}

/**
 * 当日レベルアップしたかチェック（後方互換性のため残す）
 * @deprecated checkLevelUpJustNow を使用してください
 */
export function checkTodayLevelUp(storageKey: string, currentXp: number): boolean {
  return checkLevelUpJustNow(storageKey, currentXp);
}
