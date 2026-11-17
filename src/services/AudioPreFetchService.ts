import { AudioManager } from './AudioManager';

export interface AudioPreFetchProgress {
  total: number;
  loaded: number;
  percentage: number;
  currentSound: string;
  isComplete: boolean;
}

/** Legacy preload API retained while startup now only hints the selected scene's track. */
class NativeAudioPreFetchService {
  private listeners = new Set<(progress: AudioPreFetchProgress) => void>();
  private progress: AudioPreFetchProgress = { total: 0, loaded: 0, percentage: 100, currentSound: '', isComplete: true };

  async preFetchAllAudio(): Promise<void> {
    // Effects are synthesized on demand and TTS voices belong to the operating system.
    // Do not create AudioContext or allocate AudioBuffers during app startup.
    AudioManager.preloadScene('learn');
    this.progress = { total: 1, loaded: 1, percentage: 100, currentSound: 'Learning music metadata', isComplete: true };
    this.listeners.forEach((listener) => listener(this.progress));
  }

  subscribeProgress(callback: (progress: AudioPreFetchProgress) => void): () => void {
    this.listeners.add(callback);
    callback(this.progress);
    return () => this.listeners.delete(callback);
  }
}

export const AudioPreFetchService = new NativeAudioPreFetchService();
