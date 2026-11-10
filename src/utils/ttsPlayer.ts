/**
 * Web Speech API Text-to-Speech (TTS) Engine
 * Provides multi-lingual speech synthesis with voice selection, pitch, rate, and playback state callbacks
 */

export interface TTSState {
  isPlaying: boolean;
  isPaused: boolean;
  currentText: string;
  progress: number; // 0 to 1
  supported: boolean;
}

export type TTSStateListener = (state: TTSState) => void;

class TTSPlayer {
  private utterance: SpeechSynthesisUtterance | null = null;
  private listeners: Set<TTSStateListener> = new Set();
  private state: TTSState = {
    isPlaying: false,
    isPaused: false,
    currentText: '',
    progress: 0,
    supported: typeof window !== 'undefined' && 'speechSynthesis' in window,
  };

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = () => {
        // Voices loaded
      };
    }
  }

  public subscribe(listener: TTSStateListener): () => void {
    this.listeners.add(listener);
    listener(this.state);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private updateState(partial: Partial<TTSState>) {
    this.state = { ...this.state, ...partial };
    this.listeners.forEach((fn) => fn(this.state));
  }

  public getVoices(): SpeechSynthesisVoice[] {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return [];
    return window.speechSynthesis.getVoices();
  }

  /**
   * Finds the best voice for a given language code (e.g. 'tr-TR', 'en-US', 'de-DE')
   */
  public findVoiceForLang(langCode: string): SpeechSynthesisVoice | null {
    const voices = this.getVoices();
    if (!voices.length) return null;

    const code = langCode.toLowerCase().replace('_', '-');
    const primaryPrefix = code.split('-')[0];

    // 1. Exact match e.g. "tr-TR"
    let match = voices.find((v) => v.lang.toLowerCase().replace('_', '-') === code);
    if (match) return match;

    // 2. Starts with primary prefix e.g. "tr"
    match = voices.find((v) => v.lang.toLowerCase().startsWith(primaryPrefix));
    if (match) return match;

    return null;
  }

  public speak(
    text: string,
    options: {
      langCode?: string;
      rate?: number;
      pitch?: number;
      onEnd?: () => void;
      onError?: (err: any) => void;
    } = {}
  ): void {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      console.warn('Speech synthesis not supported in this browser environment');
      return;
    }

    this.stop();

    if (!text || !text.trim()) return;

    const trimmed = text.trim();
    const utterance = new SpeechSynthesisUtterance(trimmed);
    this.utterance = utterance;

    const langCode = options.langCode || 'tr-TR';
    utterance.lang = langCode;

    const voice = this.findVoiceForLang(langCode);
    if (voice) {
      utterance.voice = voice;
    }

    utterance.rate = Math.max(0.5, Math.min(2.0, options.rate ?? 1.0));
    utterance.pitch = Math.max(0.5, Math.min(1.5, options.pitch ?? 1.0));

    utterance.onstart = () => {
      this.updateState({
        isPlaying: true,
        isPaused: false,
        currentText: trimmed,
        progress: 0,
      });
    };

    utterance.onpause = () => {
      this.updateState({ isPaused: true });
    };

    utterance.onresume = () => {
      this.updateState({ isPaused: false });
    };

    utterance.onend = () => {
      this.updateState({
        isPlaying: false,
        isPaused: false,
        currentText: '',
        progress: 1,
      });
      options.onEnd?.();
    };

    utterance.onerror = (e) => {
      this.updateState({
        isPlaying: false,
        isPaused: false,
        currentText: '',
      });
      options.onError?.(e);
    };

    utterance.onboundary = (e) => {
      if (trimmed.length > 0) {
        const progress = Math.min(1, e.charIndex / trimmed.length);
        this.updateState({ progress });
      }
    };

    window.speechSynthesis.speak(utterance);
  }

  public pause(): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      if (this.state.isPlaying && !this.state.isPaused) {
        window.speechSynthesis.pause();
        this.updateState({ isPaused: true });
      }
    }
  }

  public resume(): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      if (this.state.isPlaying && this.state.isPaused) {
        window.speechSynthesis.resume();
        this.updateState({ isPaused: false });
      }
    }
  }

  public stop(): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      this.updateState({
        isPlaying: false,
        isPaused: false,
        currentText: '',
        progress: 0,
      });
    }
  }

  public isSupported(): boolean {
    return this.state.supported;
  }
}

export const ttsPlayer = new TTSPlayer();
