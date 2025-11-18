/**
 * ProgressManager - Save and load game progress using LocalStorage
 */

export interface LevelProgress {
  completed: boolean;
  bestMoves: number;
  bestTime: number;
  stars: number; // 1-3 stars based on performance
  attempts: number;
}

export interface GameProgress {
  levels: Record<number, LevelProgress>;
  currentLevel: number;
  totalStars: number;
  soundEnabled: boolean;
  lastPlayed: number; // timestamp
}

const STORAGE_KEY = 'hexahop_progress';

export class ProgressManager {
  private progress: GameProgress;

  constructor() {
    this.progress = this.load();
  }

  /**
   * Load progress from LocalStorage
   */
  private load(): GameProgress {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        console.log('Progress loaded:', data);
        return data;
      }
    } catch (error) {
      console.error('Failed to load progress:', error);
    }

    // Default progress
    return {
      levels: {},
      currentLevel: 0,
      totalStars: 0,
      soundEnabled: true,
      lastPlayed: Date.now(),
    };
  }

  /**
   * Save progress to LocalStorage
   */
  private save(): void {
    try {
      this.progress.lastPlayed = Date.now();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.progress));
      console.log('Progress saved');
    } catch (error) {
      console.error('Failed to save progress:', error);
    }
  }

  /**
   * Get progress for a level
   */
  getLevelProgress(levelIndex: number): LevelProgress | null {
    return this.progress.levels[levelIndex] || null;
  }

  /**
   * Check if level is unlocked
   */
  isLevelUnlocked(levelIndex: number): boolean {
    // Level 0 is always unlocked
    if (levelIndex === 0) return true;

    // Check if previous level is completed
    const prevProgress = this.progress.levels[levelIndex - 1];
    return prevProgress?.completed || false;
  }

  /**
   * Calculate stars based on moves
   */
  private calculateStars(moves: number, greenTiles: number): number {
    // Perfect: moves === greenTiles
    if (moves === greenTiles) return 3;

    // Good: moves <= greenTiles * 1.5
    if (moves <= greenTiles * 1.5) return 2;

    // Completed
    return 1;
  }

  /**
   * Record level completion
   */
  completeLevel(
    levelIndex: number,
    moves: number,
    time: number,
    greenTiles: number
  ): void {
    const existing = this.progress.levels[levelIndex];
    const stars = this.calculateStars(moves, greenTiles);

    const newProgress: LevelProgress = {
      completed: true,
      bestMoves: existing?.bestMoves
        ? Math.min(existing.bestMoves, moves)
        : moves,
      bestTime: existing?.bestTime ? Math.min(existing.bestTime, time) : time,
      stars: existing?.stars ? Math.max(existing.stars, stars) : stars,
      attempts: (existing?.attempts || 0) + 1,
    };

    this.progress.levels[levelIndex] = newProgress;

    // Update total stars
    this.progress.totalStars = Object.values(this.progress.levels).reduce(
      (sum, level) => sum + level.stars,
      0
    );

    // Auto-advance to next level
    if (levelIndex === this.progress.currentLevel) {
      this.progress.currentLevel = levelIndex + 1;
    }

    this.save();
  }

  /**
   * Record level attempt (even if not completed)
   */
  recordAttempt(levelIndex: number): void {
    const existing = this.progress.levels[levelIndex];
    if (existing) {
      existing.attempts++;
    } else {
      this.progress.levels[levelIndex] = {
        completed: false,
        bestMoves: 0,
        bestTime: 0,
        stars: 0,
        attempts: 1,
      };
    }
    this.save();
  }

  /**
   * Get current level index
   */
  getCurrentLevel(): number {
    return this.progress.currentLevel;
  }

  /**
   * Set current level
   */
  setCurrentLevel(levelIndex: number): void {
    this.progress.currentLevel = levelIndex;
    this.save();
  }

  /**
   * Get total stars earned
   */
  getTotalStars(): number {
    return this.progress.totalStars;
  }

  /**
   * Get sound enabled state
   */
  isSoundEnabled(): boolean {
    return this.progress.soundEnabled;
  }

  /**
   * Set sound enabled state
   */
  setSoundEnabled(enabled: boolean): void {
    this.progress.soundEnabled = enabled;
    this.save();
  }

  /**
   * Get all progress data
   */
  getAllProgress(): GameProgress {
    return { ...this.progress };
  }

  /**
   * Reset all progress
   */
  resetAll(): void {
    this.progress = {
      levels: {},
      currentLevel: 0,
      totalStars: 0,
      soundEnabled: this.progress.soundEnabled,
      lastPlayed: Date.now(),
    };
    this.save();
    console.log('Progress reset');
  }

  /**
   * Get completion percentage
   */
  getCompletionPercentage(totalLevels: number): number {
    const completedLevels = Object.values(this.progress.levels).filter(
      (level) => level.completed
    ).length;
    return Math.round((completedLevels / totalLevels) * 100);
  }
}
