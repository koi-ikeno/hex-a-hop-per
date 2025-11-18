/**
 * SoundManager - Web Audio API sound system
 * Ported from sfx.cpp
 * Phase 6: Added lazy loading support for better performance
 */

export class SoundManager {
  private audioContext: AudioContext | null = null;
  private sounds: Map<string, AudioBuffer> = new Map();
  private loadingPromises: Promise<void>[] = [];
  private soundPaths: Map<string, string> = new Map();
  private loadingInProgress: Map<string, Promise<void>> = new Map();
  private masterVolume: number = 0.7;
  private soundEnabled: boolean = true;
  private lazyLoadEnabled: boolean = true;

  constructor() {
    // Create audio context on first user interaction (browser requirement)
    this.initAudioContext();
  }

  /**
   * Initialize audio context (must be done after user interaction)
   */
  private initAudioContext(): void {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      console.log('Audio context created');
    } catch (error) {
      console.warn('Web Audio API not supported:', error);
    }
  }

  /**
   * Resume audio context (required by some browsers)
   */
  async resumeContext(): Promise<void> {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
      console.log('Audio context resumed');
    }
  }

  /**
   * Register a sound file for loading
   * Phase 6: Supports lazy loading
   * @param name - Sound identifier
   * @param path - Path to sound file
   * @param lazy - If true, sound will be loaded on first playback
   */
  async loadSound(name: string, path: string, lazy: boolean = false): Promise<void> {
    this.soundPaths.set(name, path);

    // If lazy loading is enabled and lazy flag is set, just register the path
    if (this.lazyLoadEnabled && lazy) {
      console.log(`Registered sound for lazy loading: ${name}`);
      return;
    }

    // Otherwise, load immediately
    await this.loadSoundImmediate(name, path);
  }

  /**
   * Load a sound file immediately
   * Phase 6: Internal method for actual loading
   */
  private async loadSoundImmediate(name: string, path: string): Promise<void> {
    if (!this.audioContext) {
      console.warn('Audio context not available');
      return;
    }

    // Check if already loaded
    if (this.sounds.has(name)) {
      return;
    }

    // Check if loading in progress
    if (this.loadingInProgress.has(name)) {
      return this.loadingInProgress.get(name);
    }

    const promise = fetch(path)
      .then(response => response.arrayBuffer())
      .then(arrayBuffer => this.audioContext!.decodeAudioData(arrayBuffer))
      .then(audioBuffer => {
        this.sounds.set(name, audioBuffer);
        this.loadingInProgress.delete(name);
        console.log(`Loaded sound: ${name}`);
      })
      .catch(error => {
        this.loadingInProgress.delete(name);
        console.error(`Failed to load sound ${name}:`, error);
      });

    this.loadingInProgress.set(name, promise);
    this.loadingPromises.push(promise);
    return promise;
  }

  /**
   * Wait for all sounds to load
   */
  async waitForSounds(): Promise<void> {
    await Promise.all(this.loadingPromises);
    this.loadingPromises = [];
  }

  /**
   * Play a sound effect
   * Phase 6: Supports lazy loading - will load on first play if not already loaded
   */
  playSound(name: string, volume: number = 1.0): void {
    if (!this.soundEnabled || !this.audioContext) {
      return;
    }

    const buffer = this.sounds.get(name);
    if (buffer) {
      // Sound is loaded, play immediately
      this.playSoundBuffer(buffer, volume);
    } else {
      // Sound not loaded yet, try lazy loading
      const path = this.soundPaths.get(name);
      if (path) {
        console.log(`Lazy loading sound: ${name}`);
        this.loadSoundImmediate(name, path).then(() => {
          const loadedBuffer = this.sounds.get(name);
          if (loadedBuffer) {
            this.playSoundBuffer(loadedBuffer, volume);
          }
        });
      } else {
        console.warn(`Sound not found: ${name}`);
      }
    }
  }

  /**
   * Play a sound buffer
   * Phase 6: Internal method to play audio buffer
   */
  private playSoundBuffer(buffer: AudioBuffer, volume: number): void {
    if (!this.audioContext) return;

    try {
      // Create source node
      const source = this.audioContext.createBufferSource();
      source.buffer = buffer;

      // Create gain node for volume control
      const gainNode = this.audioContext.createGain();
      gainNode.gain.value = this.masterVolume * volume;

      // Connect nodes
      source.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      // Play
      source.start(0);
    } catch (error) {
      console.error(`Error playing sound:`, error);
    }
  }

  /**
   * Set master volume (0.0 to 1.0)
   */
  setVolume(volume: number): void {
    this.masterVolume = Math.max(0, Math.min(1, volume));
  }

  /**
   * Enable/disable sound
   */
  setSoundEnabled(enabled: boolean): void {
    this.soundEnabled = enabled;
  }

  /**
   * Check if sound is enabled
   */
  isSoundEnabled(): boolean {
    return this.soundEnabled;
  }

  /**
   * Enable/disable lazy loading
   * Phase 6: Performance optimization
   */
  setLazyLoadEnabled(enabled: boolean): void {
    this.lazyLoadEnabled = enabled;
    console.log(`Sound lazy loading: ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Get number of loaded sounds
   */
  getLoadedCount(): number {
    return this.sounds.size;
  }

  /**
   * Get number of registered sounds
   */
  getRegisteredCount(): number {
    return this.soundPaths.size;
  }
}
