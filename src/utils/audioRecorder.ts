/**
 * Audio Recording and AudioContext Visualizer Utility
 * Manages MediaRecorder, AudioContext analyser, volume metering and base64 export
 */

export interface RecorderState {
  isRecording: boolean;
  isPaused: boolean;
  durationSec: number;
  volumeLevel: number; // 0 to 100
  waveform: number[]; // 32 normalized bars
}

export type RecorderStateCallback = (state: RecorderState) => void;

export class AudioRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private audioStream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private dataArray: Uint8Array | null = null;
  private chunks: Blob[] = [];
  private timerInterval: any = null;
  private animFrameId: any = null;
  private durationSec = 0;
  private startTime = 0;
  private pausedTime = 0;
  private onStateChange: RecorderStateCallback | null = null;

  constructor(callback?: RecorderStateCallback) {
    if (callback) this.onStateChange = callback;
  }

  public setCallback(callback: RecorderStateCallback) {
    this.onStateChange = callback;
  }

  private notify(volumeLevel = 0, waveform: number[] = new Array(32).fill(0)) {
    if (this.onStateChange) {
      this.onStateChange({
        isRecording: this.mediaRecorder?.state === 'recording',
        isPaused: this.mediaRecorder?.state === 'paused',
        durationSec: this.durationSec,
        volumeLevel,
        waveform,
      });
    }
  }

  public async start(): Promise<boolean> {
    try {
      this.chunks = [];
      this.durationSec = 0;

      // Request microphone stream
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      this.audioStream = stream;

      // Setup Web Audio API Analyser
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.audioContext = new AudioCtx();
        const source = this.audioContext.createMediaStreamSource(stream);
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 64;
        source.connect(this.analyser);
        this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
      }

      // Determine best supported mimeType
      let mimeType = 'audio/webm';
      if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        mimeType = 'audio/webm;codecs=opus';
      } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
        mimeType = 'audio/mp4';
      } else if (MediaRecorder.isTypeSupported('audio/ogg')) {
        mimeType = 'audio/ogg';
      }

      const recorder = new MediaRecorder(stream, { mimeType });
      this.mediaRecorder = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          this.chunks.push(e.data);
        }
      };

      recorder.start(250); // collect chunk every 250ms
      this.startTime = Date.now();

      // Duration counter
      this.timerInterval = setInterval(() => {
        if (this.mediaRecorder?.state === 'recording') {
          this.durationSec = Math.floor((Date.now() - this.startTime - this.pausedTime) / 1000);
        }
      }, 200);

      // Visualizer loop
      this.startVisualizerLoop();

      this.notify(10);
      return true;
    } catch (err) {
      console.error('Error starting audio recording:', err);
      throw err;
    }
  }

  private startVisualizerLoop() {
    const loop = () => {
      if (!this.mediaRecorder || this.mediaRecorder.state === 'inactive') {
        return;
      }

      let volume = 0;
      const bars: number[] = new Array(32).fill(5);

      if (this.analyser && this.dataArray && this.mediaRecorder.state === 'recording') {
        this.analyser.getByteFrequencyData(this.dataArray as any);
        let sum = 0;
        for (let i = 0; i < this.dataArray.length; i++) {
          sum += this.dataArray[i];
          if (i < 32) {
            bars[i] = Math.max(8, (this.dataArray[i] / 255) * 100);
          }
        }
        const avg = sum / this.dataArray.length;
        volume = Math.min(100, Math.round((avg / 128) * 100));
      } else if (this.mediaRecorder.state === 'paused') {
        volume = 0;
      }

      this.notify(volume, bars);
      this.animFrameId = requestAnimationFrame(loop);
    };

    this.animFrameId = requestAnimationFrame(loop);
  }

  public pause() {
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.pause();
      this.notify(0);
    }
  }

  public resume() {
    if (this.mediaRecorder && this.mediaRecorder.state === 'paused') {
      this.mediaRecorder.resume();
      this.notify();
    }
  }

  public async stop(): Promise<{ blob: Blob; mimeType: string; durationSec: number; base64: string }> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('Kayıt başlatılmadı'));
        return;
      }

      const mimeType = this.mediaRecorder.mimeType || 'audio/webm';
      const duration = this.durationSec;

      this.mediaRecorder.onstop = async () => {
        try {
          if (this.timerInterval) clearInterval(this.timerInterval);
          if (this.animFrameId) cancelAnimationFrame(this.animFrameId);

          if (this.audioStream) {
            this.audioStream.getTracks().forEach((track) => track.stop());
            this.audioStream = null;
          }
          if (this.audioContext && this.audioContext.state !== 'closed') {
            await this.audioContext.close();
            this.audioContext = null;
          }

          const blob = new Blob(this.chunks, { type: mimeType });
          const base64 = await blobToBase64(blob);

          this.notify(0);
          resolve({ blob, mimeType, durationSec: Math.max(1, duration), base64 });
        } catch (err) {
          reject(err);
        }
      };

      if (this.mediaRecorder.state !== 'inactive') {
        this.mediaRecorder.stop();
      } else {
        this.mediaRecorder.onstop(new Event('stop'));
      }
    });
  }

  public isRecordingActive(): boolean {
    return !!this.mediaRecorder && this.mediaRecorder.state === 'recording';
  }
}

/**
 * Converts a Blob to base64 string (without the data:...;base64, prefix)
 */
export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      const base64 = result.includes(',') ? result.split(',')[1] : result;
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
