import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  Square,
  Pause,
  Play,
  Upload,
  Sparkles,
  ArrowRight,
  Volume2,
  CheckCircle2,
  AlertCircle,
  FileAudio,
  Radio,
  Zap,
} from 'lucide-react';
import { AudioRecorder, RecorderState } from '../utils/audioRecorder';
import { SUPPORTED_LANGUAGES, getLanguageByCode } from '../utils/languages';
import { formatDuration } from '../utils/formatters';
import { requestTranscription, requestTranslation } from '../utils/api';
import { RecordingItem } from '../types';
import { ttsPlayer } from '../utils/ttsPlayer';

interface RecordingViewProps {
  onSaveRecording: (item: RecordingItem) => void;
  onOpenTranslatorWithText: (text: string, sourceLangCode: string) => void;
  defaultTargetLang: string;
}

export const RecordingView: React.FC<RecordingViewProps> = ({
  onSaveRecording,
  onOpenTranslatorWithText,
  defaultTargetLang,
}) => {
  const [recorderState, setRecorderState] = useState<RecorderState>({
    isRecording: false,
    isPaused: false,
    durationSec: 0,
    volumeLevel: 0,
    waveform: new Array(32).fill(6),
  });

  const [selectedSourceLang, setSelectedSourceLang] = useState<string>('auto');
  const [targetLang, setTargetLang] = useState<string>(defaultTargetLang || 'en');
  const [autoTranslateDirectly, setAutoTranslateDirectly] = useState<boolean>(true);

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processingStep, setProcessingStep] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Audio object state after recording finishes
  const [recordedAudio, setRecordedAudio] = useState<{
    blob: Blob | null;
    audioUrl: string | null;
    base64: string | null;
    mimeType: string;
    durationSec: number;
  } | null>(null);

  // Recent completed result preview
  const [lastProcessedItem, setLastProcessedItem] = useState<RecordingItem | null>(null);

  const recorderRef = useRef<AudioRecorder | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    recorderRef.current = new AudioRecorder((state) => {
      setRecorderState(state);
    });

    return () => {
      if (recorderRef.current && recorderRef.current.isRecordingActive()) {
        recorderRef.current.stop().catch(() => {});
      }
      ttsPlayer.stop();
    };
  }, []);

  const handleStartRecording = async () => {
    setErrorMessage(null);
    setRecordedAudio(null);
    try {
      if (!recorderRef.current) {
        recorderRef.current = new AudioRecorder(setRecorderState);
      }
      await recorderRef.current.start();
    } catch (err: any) {
      console.error('Mic access error:', err);
      setErrorMessage(
        'Mikrofon erişimi sağlanamadı. Tarayıcı izinlerini kontrol edin veya aşağıdaki hazır ses örneklerinden birini deneyin.'
      );
    }
  };

  const handlePauseResume = () => {
    if (!recorderRef.current) return;
    if (recorderState.isPaused) {
      recorderRef.current.resume();
    } else {
      recorderRef.current.pause();
    }
  };

  const handleStopRecording = async () => {
    if (!recorderRef.current) return;
    try {
      const result = await recorderRef.current.stop();
      const url = URL.createObjectURL(result.blob);
      setRecordedAudio({
        blob: result.blob,
        audioUrl: url,
        base64: result.base64,
        mimeType: result.mimeType,
        durationSec: result.durationSec,
      });

      // Auto transcribe if enabled
      handleProcessAudio(result.base64, result.mimeType, result.durationSec, url);
    } catch (err: any) {
      console.error('Stop error:', err);
      setErrorMessage('Kayıt durdurulurken hata oluştu: ' + (err.message || ''));
    }
  };

  const handleProcessAudio = async (
    base64: string,
    mimeType: string,
    durationSec: number,
    audioUrl?: string
  ) => {
    setIsProcessing(true);
    setErrorMessage(null);
    try {
      setProcessingStep('Ses Gemini 3.8 Flash yapay zekasına iletiliyor...');
      const transcribeRes = await requestTranscription(
        base64,
        mimeType,
        selectedSourceLang !== 'auto' ? selectedSourceLang : undefined
      );

      let translationResult: any = undefined;

      if (autoTranslateDirectly && transcribeRes.transcript) {
        setProcessingStep(`Metin "${getLanguageByCode(targetLang).name}" diline çevriliyor...`);
        try {
          translationResult = await requestTranslation(
            transcribeRes.transcript,
            transcribeRes.detectedLanguageCode || selectedSourceLang,
            targetLang,
            'Standart'
          );
        } catch (transErr) {
          console.warn('Translation step warning:', transErr);
        }
      }

      setProcessingStep('Kayıt hafızaya kaydediliyor...');
      const newItem: RecordingItem = {
        id: `rec-${Date.now()}`,
        title: transcribeRes.summary
          ? transcribeRes.summary.slice(0, 36) + '...'
          : `Ses Kaydı #${new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}`,
        timestamp: Date.now(),
        duration: durationSec,
        audioUrl: audioUrl,
        audioBase64: base64,
        audioMimeType: mimeType,
        transcript: transcribeRes.transcript || '(Konuşma tespit edilemedi)',
        detectedLanguage: transcribeRes.detectedLanguage || 'Türkçe',
        detectedLanguageCode: transcribeRes.detectedLanguageCode || 'tr',
        confidence: transcribeRes.confidence ?? 0.96,
        segments: transcribeRes.segments || [],
        summary: transcribeRes.summary,
        actionPoints: transcribeRes.actionPoints,
        category: 'Genel',
        tags: [transcribeRes.detectedLanguage || 'Türkçe', 'Ses Kaydı'],
        isFavorite: false,
        cloudSynced: false,
        translation: translationResult
          ? {
              targetLang: targetLang,
              targetLangName: getLanguageByCode(targetLang).name,
              translatedText: translationResult.translatedText,
              pronunciation: translationResult.pronunciation,
              tone: translationResult.tone,
              translatedAt: Date.now(),
              keyTerms: translationResult.keyTerms,
              alternativeTranslations: translationResult.alternativeTranslations,
            }
          : undefined,
      };

      onSaveRecording(newItem);
      setLastProcessedItem(newItem);
    } catch (err: any) {
      console.error('Transcription error:', err);
      setErrorMessage(err.message || 'Ses metne dönüştürülürken bir hata oluştu.');
    } finally {
      setIsProcessing(false);
      setProcessingStep('');
    }
  };

  // Handle local audio file upload (.mp3, .wav, .m4a, .webm)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const result = reader.result as string;
      const base64 = result.includes(',') ? result.split(',')[1] : result;
      const url = URL.createObjectURL(file);
      setRecordedAudio({
        blob: file,
        audioUrl: url,
        base64,
        mimeType: file.type || 'audio/webm',
        durationSec: 15, // estimated
      });

      handleProcessAudio(base64, file.type || 'audio/webm', 15, url);
    };
    reader.readAsDataURL(file);
  };

  // Sample quick test presets
  const handleLoadPresetAudio = (presetType: 'tr-meeting' | 'en-travel' | 'de-tech') => {
    let mockTranscript = '';
    let mockLang = 'Türkçe';
    let mockCode = 'tr';
    let mockSummary = '';

    if (presetType === 'tr-meeting') {
      mockTranscript =
        'Yapay zeka ses çeviri projemizde mobil arayüz tasarımı ve bulut yedekleme mimarisi tamamlandı. Kullanıcılarımız tek tuşla ses kaydı yapıp anında 20 farklı dile çevirebiliyor.';
      mockLang = 'Türkçe';
      mockCode = 'tr';
      mockSummary = 'Sesli çeviri projesinin arayüz ve bulut yedekleme durumu.';
    } else if (presetType === 'en-travel') {
      mockTranscript =
        'Excuse me, could you tell me how to get to the central train station? And is there a ticket machine nearby that accepts credit cards?';
      mockLang = 'İngilizce';
      mockCode = 'en';
      mockSummary = 'Tren istasyonu ve bilet makinesi konumu sorgusu.';
    } else {
      mockTranscript =
        'Guten Tag! Die Cloud-Sicherungsfunktion wurde erfolgreich integriert und schützt alle Sprachaufzeichnungen mit hoher Zuverlässigkeit.';
      mockLang = 'Almanca';
      mockCode = 'de';
      mockSummary = 'Bulut yedekleme entegrasyonu güvenilirlik raporu.';
    }

    setIsProcessing(true);
    setProcessingStep('Örnek ses işleniyor...');

    setTimeout(async () => {
      let translationResult: any = undefined;
      try {
        translationResult = await requestTranslation(
          mockTranscript,
          mockCode,
          targetLang,
          'Standart'
        );
      } catch {
        translationResult = {
          translatedText: `[${getLanguageByCode(targetLang).name} Çevirisi]: ${mockTranscript}`,
        };
      }

      const item: RecordingItem = {
        id: `rec-demo-${Date.now()}`,
        title: mockSummary.slice(0, 32),
        timestamp: Date.now(),
        duration: 18,
        transcript: mockTranscript,
        detectedLanguage: mockLang,
        detectedLanguageCode: mockCode,
        confidence: 0.99,
        summary: mockSummary,
        category: 'Genel',
        tags: [mockLang, 'Demo'],
        isFavorite: false,
        cloudSynced: false,
        translation: {
          targetLang: targetLang,
          targetLangName: getLanguageByCode(targetLang).name,
          translatedText: translationResult?.translatedText || mockTranscript,
          tone: 'Standart',
          translatedAt: Date.now(),
          keyTerms: translationResult?.keyTerms,
        },
      };

      onSaveRecording(item);
      setLastProcessedItem(item);
      setIsProcessing(false);
      setProcessingStep('');
    }, 600);
  };

  return (
    <div className="flex-1 w-full h-full overflow-y-auto px-4 py-5 flex flex-col justify-between">
      {/* Top Header & Settings */}
      <div className="w-full space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <Mic className="w-5 h-5 text-indigo-500" />
              Ses Kaydedici & Çevirici
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Konuşun, yapay zeka metne dönüştürsün ve anında çevirsin.
            </p>
          </div>

          {/* Hidden File Input for audio upload */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="audio/*"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
            title="Cihazdan Ses Dosyası Yükle"
          >
            <Upload className="w-3.5 h-3.5 text-indigo-500" />
            <span className="hidden sm:inline">Ses Yükle</span>
          </button>
        </div>

        {/* Translation Preferences Bar */}
        <div className="p-3 rounded-2xl bg-slate-100/80 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 flex-1 min-w-[200px]">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Hedef Dil:</span>
            <select
              value={targetLang}
              onChange={(e) => setTargetLang(e.target.value)}
              className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.flag} {lang.name}
                </option>
              ))}
            </select>
          </div>

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={autoTranslateDirectly}
              onChange={(e) => setAutoTranslateDirectly(e.target.checked)}
              className="rounded text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
            />
            <span className="text-slate-700 dark:text-slate-300 text-xs">
              Kayıt Bitince Otomatik Çevir
            </span>
          </label>
        </div>
      </div>

      {/* Center Visualization & Giant Record Button */}
      <div className="my-auto py-6 flex flex-col items-center justify-center space-y-6">
        {/* Timer display */}
        <div className="text-center">
          <div className="text-4xl font-extrabold tracking-tight font-mono text-slate-900 dark:text-white">
            {formatDuration(recorderState.durationSec)}
          </div>
          <div className="flex items-center justify-center gap-2 mt-1.5">
            {recorderState.isRecording ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                {recorderState.isPaused ? 'Kayıt Duraklatıldı' : 'Ses Kaydediliyor...'}
              </span>
            ) : isProcessing ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                <Sparkles className="w-3 h-3 animate-spin" />
                {processingStep || 'İşleniyor...'}
              </span>
            ) : (
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Kayıt için mikrofona dokunun
              </span>
            )}
          </div>
        </div>

        {/* Dynamic Waveform Visualizer */}
        <div className="w-full max-w-xs h-16 bg-slate-200/50 dark:bg-slate-900/50 rounded-2xl p-2.5 flex items-center justify-center gap-1 overflow-hidden border border-slate-200 dark:border-slate-800/80">
          {recorderState.isRecording ? (
            recorderState.waveform.map((barHeight, idx) => (
              <div
                key={idx}
                className="w-1.5 bg-gradient-to-t from-indigo-500 to-rose-400 rounded-full transition-all duration-75"
                style={{
                  height: `${Math.max(10, Math.min(100, barHeight))}%`,
                  opacity: recorderState.isPaused ? 0.4 : 0.9,
                }}
              />
            ))
          ) : (
            <div className="flex items-center gap-1 opacity-40">
              {Array.from({ length: 24 }).map((_, i) => (
                <div
                  key={i}
                  className="w-1.5 bg-slate-400 dark:bg-slate-600 rounded-full"
                  style={{ height: `${12 + Math.sin(i * 0.5) * 8}px` }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Master Recording Trigger Button */}
        <div className="relative flex items-center justify-center">
          {/* Animated glow ring when recording */}
          {recorderState.isRecording && !recorderState.isPaused && (
            <div className="absolute inset-0 -m-3 rounded-full bg-rose-500/20 animate-pulse-ring" />
          )}

          {!recorderState.isRecording ? (
            <button
              onClick={handleStartRecording}
              disabled={isProcessing}
              className={`w-20 h-20 rounded-full flex items-center justify-center shadow-xl transition-all duration-200 cursor-pointer ${
                isProcessing
                  ? 'bg-slate-400 cursor-not-allowed opacity-60'
                  : 'bg-gradient-to-tr from-rose-600 via-rose-500 to-indigo-600 text-white hover:scale-105 active:scale-95 shadow-rose-500/30'
              }`}
              aria-label="Ses Kaydını Başlat"
            >
              <Mic className="w-8 h-8" />
            </button>
          ) : (
            <div className="flex items-center gap-4">
              {/* Pause / Resume Button */}
              <button
                onClick={handlePauseResume}
                className="w-12 h-12 rounded-full bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 flex items-center justify-center transition-colors cursor-pointer"
                title={recorderState.isPaused ? 'Devam Et' : 'Duraklat'}
              >
                {recorderState.isPaused ? (
                  <Play className="w-5 h-5 ml-0.5 text-emerald-500" />
                ) : (
                  <Pause className="w-5 h-5" />
                )}
              </button>

              {/* Stop & Transcribe Button */}
              <button
                onClick={handleStopRecording}
                className="w-20 h-20 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex flex-col items-center justify-center shadow-xl shadow-rose-600/40 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                aria-label="Kaydı Durdur ve Metne Dönüştür"
              >
                <Square className="w-6 h-6 fill-current" />
                <span className="text-[10px] font-bold mt-1">BİTİR</span>
              </button>
            </div>
          )}
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="w-full p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="flex-1">{errorMessage}</div>
          </div>
        )}

        {/* Quick Demo Voice Presets */}
        <div className="w-full pt-1">
          <div className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider text-center mb-2 flex items-center justify-center gap-1.5">
            <Zap className="w-3 h-3 text-amber-500" />
            <span>Hızlı Test Örnekleri (Tek Tıkla Dene)</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleLoadPresetAudio('tr-meeting')}
              disabled={recorderState.isRecording || isProcessing}
              className="p-2 rounded-xl text-left bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500 transition-all cursor-pointer text-xs"
            >
              <div className="font-semibold text-slate-800 dark:text-slate-200">🇹🇷 İş Toplantısı</div>
              <div className="text-[10px] text-slate-500 truncate">Proje & Arayüz</div>
            </button>

            <button
              onClick={() => handleLoadPresetAudio('en-travel')}
              disabled={recorderState.isRecording || isProcessing}
              className="p-2 rounded-xl text-left bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500 transition-all cursor-pointer text-xs"
            >
              <div className="font-semibold text-slate-800 dark:text-slate-200">🇬🇧 Seyahat / Metro</div>
              <div className="text-[10px] text-slate-500 truncate">Yol tarifi diyaloğu</div>
            </button>

            <button
              onClick={() => handleLoadPresetAudio('de-tech')}
              disabled={recorderState.isRecording || isProcessing}
              className="p-2 rounded-xl text-left bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500 transition-all cursor-pointer text-xs"
            >
              <div className="font-semibold text-slate-800 dark:text-slate-200">🇩🇪 Bulut Yedekleme</div>
              <div className="text-[10px] text-slate-500 truncate">Teknoloji sunumu</div>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Live Result Card (if a recording was just transcribed) */}
      {lastProcessedItem && (
        <div className="w-full mt-4 p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-950/60 shadow-lg space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                Son Transkripsiyon Başarılı
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                {lastProcessedItem.detectedLanguage}
              </span>
            </div>

            <button
              onClick={() =>
                onOpenTranslatorWithText(
                  lastProcessedItem.transcript,
                  lastProcessedItem.detectedLanguageCode
                )
              }
              className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
            >
              Çevirmende Aç <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="text-xs text-slate-700 dark:text-slate-300 line-clamp-2 bg-slate-50 dark:bg-slate-950 p-2 rounded-xl border border-slate-200/50 dark:border-slate-800">
            "{lastProcessedItem.transcript}"
          </div>

          {lastProcessedItem.translation && (
            <div className="pt-1 flex items-center justify-between text-xs border-t border-slate-100 dark:border-slate-800/80">
              <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                <span className="font-semibold text-indigo-500">
                  {lastProcessedItem.translation.targetLangName}:
                </span>
                <span className="line-clamp-1 italic text-[11px]">
                  {lastProcessedItem.translation.translatedText}
                </span>
              </div>

              {/* TTS Listen button */}
              <button
                onClick={() =>
                  ttsPlayer.speak(lastProcessedItem.translation!.translatedText, {
                    langCode: getLanguageByCode(lastProcessedItem.translation!.targetLang)
                      .ttsVoiceCode,
                  })
                }
                className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 transition-colors cursor-pointer"
                title="Çeviriyi Sesli Dinle"
              >
                <Volume2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
