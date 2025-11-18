/**
 * SoundManager - Web Audio API sound system
 * Ported from sfx.cpp
 */

export class SoundManager {
  private audioContext: AudioContext | null = null;
  private sounds: Map<string, AudioBuffer> = new Map();
  private loadingPromises: Promise<void>[] = [];
  private masterVolume: number = 0.7;
  private soundEnabled: boolean = true;

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
   * Load a sound file
   */
  async loadSound(name: string, path: string): Promise<void> {
    if (!this.audioContext) {
      console.warn('Audio context not available');
      return;
    }

    const promise = fetch(path)
      .then(response => response.arrayBuffer())
      .then(arrayBuffer => this.audioContext!.decodeAudioData(arrayBuffer))
      .then(audioBuffer => {
        this.sounds.set(name, audioBuffer);
        console.log(`Loaded sound: ${name}`);
      })
      .catch(error => {
        console.error(`Failed to load sound ${name}:`, error);
      });

    this.loadingPromises.push(promise);
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
   */
  playSound(name: string, volume: number = 1.0): void {
    if (!this.soundEnabled || !this.audioContext) {
      return;
    }

    const buffer = this.sounds.get(name);
    if (!buffer) {
      console.warn(`Sound not found: ${name}`);
      return;
    }

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
      console.error(`Error playing sound ${name}:`, error);
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
}
