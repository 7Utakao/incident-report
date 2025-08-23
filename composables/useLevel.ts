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

/**
 * 当日レベルアップしたかチェック（真のレベルアップのみ検知）
 */
export function checkTodayLevelUp(storageKey: string, currentXp: number): boolean {
  if (typeof window === 'undefined') return false;

  const today = new Date().toDateString();
  const stored = localStorage.getItem(storageKey);
  const currentLevel = calculateLevel(currentXp);

  if (!stored) {
    // 初回アクセス時は現在のレベルを保存
    localStorage.setItem(
      storageKey,
      JSON.stringify({
        date: today,
        level: currentLevel.level,
        xp: currentXp,
        levelUpShown: false,
      }),
    );
    return false;
  }

  try {
    const data = JSON.parse(stored);

    // 日付が変わった場合は更新
    if (data.date !== today) {
      localStorage.setItem(
        storageKey,
        JSON.stringify({
          date: today,
          level: currentLevel.level,
          xp: currentXp,
          levelUpShown: false,
        }),
      );
      return false;
    }

    // 既にレベルアップメッセージを表示済みの場合は false
    if (data.levelUpShown) {
      // XPが増えていれば更新（レベルアップフラグは維持）
      if (currentXp > data.xp) {
        localStorage.setItem(
          storageKey,
          JSON.stringify({
            date: today,
            level: currentLevel.level,
            xp: currentXp,
            levelUpShown: true,
          }),
        );
      }
      return false;
    }

    // 真のレベルアップ検知：
    // 1. レベルが上がっている
    // 2. 前回のXPと現在のXPでレベルが変わった瞬間
    const oldLevel = calculateLevel(data.xp).level;
    const hasLeveledUp = currentLevel.level > oldLevel;

    if (hasLeveledUp) {
      // レベルアップした場合は保存データを更新し、フラグを立てる
      localStorage.setItem(
        storageKey,
        JSON.stringify({
          date: today,
          level: currentLevel.level,
          xp: currentXp,
          levelUpShown: true,
        }),
      );
      return true;
    }

    // レベルアップしていない場合でもXPが増えていれば更新
    if (currentXp > data.xp) {
      localStorage.setItem(
        storageKey,
        JSON.stringify({
          date: today,
          level: currentLevel.level,
          xp: currentXp,
          levelUpShown: false,
        }),
      );
    }

    return false;
  } catch (error) {
    console.error('Error checking level up:', error);
    return false;
  }
}
