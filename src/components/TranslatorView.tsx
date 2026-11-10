import React, { useState, useEffect } from 'react';
import {
  Languages,
  ArrowRightLeft,
  Volume2,
  Copy,
  Check,
  Sparkles,
  Share2,
  BookmarkPlus,
  Mic,
  RotateCcw,
  BookOpen,
  VolumeX,
} from 'lucide-react';
import { SUPPORTED_LANGUAGES, getLanguageByCode } from '../utils/languages';
import { requestTranslation } from '../utils/api';
import { ttsPlayer, TTSState } from '../utils/ttsPlayer';
import { RecordingItem } from '../types';

interface TranslatorViewProps {
  initialText?: string;
  initialSourceLang?: string;
  defaultTargetLang?: string;
  onSaveToHistory: (item: RecordingItem) => void;
}

export const TranslatorView: React.FC<TranslatorViewProps> = ({
  initialText = '',
  initialSourceLang = 'tr',
  defaultTargetLang = 'en',
  onSaveToHistory,
}) => {
  const [sourceLang, setSourceLang] = useState<string>(initialSourceLang);
  const [targetLang, setTargetLang] = useState<string>(defaultTargetLang);
  const [inputText, setInputText] = useState<string>(initialText);
  const [translatedText, setTranslatedText] = useState<string>('');
  const [pronunciation, setPronunciation] = useState<string>('');
  const [keyTerms, setKeyTerms] = useState<Array<{ term: string; translation: string; meaning?: string }>>([]);
  const [alternativePhrasings, setAlternativePhrasings] = useState<string[]>([]);
  const [tone, setTone] = useState<string>('Standart');

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);

  // TTS audio state
  const [ttsState, setTtsState] = useState<TTSState>({
    isPlaying: false,
    isPaused: false,
    currentText: '',
    progress: 0,
    supported: true,
  });

  useEffect(() => {
    const unsub = ttsPlayer.subscribe(setTtsState);
    return () => unsub();
  }, []);

  useEffect(() => {
    if (initialText) {
      setInputText(initialText);
    }
  }, [initialText]);

  const handleSwapLanguages = () => {
    if (sourceLang === 'auto') return;
    const oldSource = sourceLang;
    const oldTarget = targetLang;
    setSourceLang(oldTarget);
    setTargetLang(oldSource);
    if (translatedText) {
      setInputText(translatedText);
      setTranslatedText('');
    }
  };

  const handleTranslate = async () => {
    if (!inputText || !inputText.trim()) return;

    setIsLoading(true);
    setError(null);
    setIsSaved(false);

    try {
      const res = await requestTranslation(inputText, sourceLang, targetLang, tone);
      setTranslatedText(res.translatedText);
      setPronunciation(res.pronunciation || '');
      setKeyTerms(res.keyTerms || []);
      setAlternativePhrasings(res.alternativeTranslations || []);
    } catch (err: any) {
      console.error('Translation error:', err);
      setError(err.message || 'Çeviri yapılırken bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleListenSpeech = (textToSpeak: string, langCode: string) => {
    if (ttsState.isPlaying && !ttsState.isPaused) {
      ttsPlayer.pause();
      return;
    }
    if (ttsState.isPaused) {
      ttsPlayer.resume();
      return;
    }

    const langObj = getLanguageByCode(langCode);
    ttsPlayer.speak(textToSpeak, {
      langCode: langObj.ttsVoiceCode,
      rate: playbackSpeed,
    });
  };

  const handleStopSpeech = () => {
    ttsPlayer.stop();
  };

  const handleCopyText = (text: string) => {
    if (!navigator.clipboard) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveToHistory = () => {
    if (!inputText || !translatedText) return;

    const sourceLangObj = getLanguageByCode(sourceLang === 'auto' ? 'tr' : sourceLang);
    const targetLangObj = getLanguageByCode(targetLang);

    const newItem: RecordingItem = {
      id: `trans-${Date.now()}`,
      title: `${sourceLangObj.name} ➔ ${targetLangObj.name} Çevirisi`,
      timestamp: Date.now(),
      duration: 5,
      transcript: inputText,
      detectedLanguage: sourceLangObj.name,
      detectedLanguageCode: sourceLangObj.code,
      confidence: 1.0,
      category: 'Çeviri',
      tags: ['Metin Çevirisi', targetLangObj.name],
      isFavorite: false,
      cloudSynced: false,
      translation: {
        targetLang: targetLang,
        targetLangName: targetLangObj.name,
        translatedText: translatedText,
        pronunciation: pronunciation,
        tone: tone,
        translatedAt: Date.now(),
        keyTerms: keyTerms,
        alternativeTranslations: alternativePhrasings,
      },
    };

    onSaveToHistory(newItem);
    setIsSaved(true);
  };

  const tones = ['Standart', 'Günlük / Samimi', 'Resmi / Nezaket', 'İş / Profesyonel', 'Akademik'];

  return (
    <div className="flex-1 w-full h-full overflow-y-auto px-4 py-5 flex flex-col space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Languages className="w-5 h-5 text-indigo-500" />
            Akıllı Çevirmen & Sesli Okuma
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Yapay zekayla çok dilli çeviri yapın ve doğru telaffuzla sesli dinleyin.
          </p>
        </div>
      </div>

      {/* Language Switcher Bar */}
      <div className="p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between gap-2">
        {/* Source Language Picker */}
        <div className="flex-1 min-w-0">
          <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Kaynak Dil
          </label>
          <select
            value={sourceLang}
            onChange={(e) => setSourceLang(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800/80 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="auto">✨ Otomatik Algıla</option>
            {SUPPORTED_LANGUAGES.map((l) => (
              <option key={`src-${l.code}`} value={l.code}>
                {l.flag} {l.name}
              </option>
            ))}
          </select>
        </div>

        {/* Swap Button */}
        <button
          onClick={handleSwapLanguages}
          disabled={sourceLang === 'auto'}
          className={`p-2 rounded-xl mt-4 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer ${
            sourceLang === 'auto'
              ? 'opacity-40 cursor-not-allowed'
              : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-indigo-600 dark:text-indigo-400'
          }`}
          title="Dilleri Değiştir"
          aria-label="Kaynak ve hedef dili değiştir"
        >
          <ArrowRightLeft className="w-4 h-4" />
        </button>

        {/* Target Language Picker */}
        <div className="flex-1 min-w-0">
          <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Hedef Dil
          </label>
          <select
            value={targetLang}
            onChange={(e) => setTargetLang(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800/80 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
          >
            {SUPPORTED_LANGUAGES.map((l) => (
              <option key={`tgt-${l.code}`} value={l.code}>
                {l.flag} {l.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tone Selection Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 shrink-0">
          Ton:
        </span>
        {tones.map((t) => (
          <button
            key={t}
            onClick={() => setTone(t)}
            className={`px-2.5 py-1 rounded-full text-[11px] font-medium shrink-0 transition-colors cursor-pointer ${
              tone === t
                ? 'bg-indigo-600 text-white font-semibold'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Input Text Box */}
      <div className="relative rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm p-3.5 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all">
        <div className="flex items-center justify-between mb-2 text-xs">
          <span className="font-semibold text-slate-700 dark:text-slate-300">
            {getLanguageByCode(sourceLang === 'auto' ? 'tr' : sourceLang).name} Metni
          </span>
          <div className="flex items-center gap-2">
            {inputText && (
              <button
                onClick={() => setInputText('')}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                title="Temizle"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
            <span className="text-[10px] text-slate-400 font-mono">{inputText.length} krk</span>
          </div>
        </div>

        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Çevirmek istediğiniz metni buraya yazın veya yapıştırın..."
          rows={3}
          className="w-full resize-none bg-transparent text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
        />

        {/* Input bottom action toolbar */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-1.5">
            {/* Listen Source Text */}
            {inputText.trim() && (
              <button
                onClick={() =>
                  handleListenSpeech(inputText, sourceLang === 'auto' ? 'tr' : sourceLang)
                }
                className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title="Kaynak Metni Dinle"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            )}
          </div>

          <button
            onClick={handleTranslate}
            disabled={isLoading || !inputText.trim()}
            className={`px-4 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-md transition-all cursor-pointer ${
              isLoading || !inputText.trim()
                ? 'bg-slate-300 dark:bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/30 active:scale-95'
            }`}
          >
            {isLoading ? (
              <>
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
                <span>Çevriliyor...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Çevir</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error notification */}
      {error && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs">
          {error}
        </div>
      )}

      {/* Output / Translation Result Box */}
      {translatedText && (
        <div className="rounded-2xl bg-gradient-to-br from-indigo-50/70 to-slate-50 dark:from-slate-900 dark:to-indigo-950/20 border border-indigo-200/80 dark:border-indigo-900/60 shadow-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-base">{getLanguageByCode(targetLang).flag}</span>
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                {getLanguageByCode(targetLang).name} Çevirisi
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-indigo-500/15 text-indigo-700 dark:text-indigo-300">
                {tone}
              </span>
            </div>

            {/* Playback speed toggle */}
            <div className="flex items-center gap-1 bg-white/70 dark:bg-slate-800/70 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700 text-[10px]">
              {[0.8, 1.0, 1.25].map((speed) => (
                <button
                  key={speed}
                  onClick={() => setPlaybackSpeed(speed)}
                  className={`px-1.5 py-0.5 rounded font-mono font-medium cursor-pointer ${
                    playbackSpeed === speed
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>
          </div>

          {/* Translated text body */}
          <div className="text-sm font-medium text-slate-900 dark:text-slate-100 leading-relaxed bg-white/60 dark:bg-slate-950/60 p-3 rounded-xl border border-indigo-100 dark:border-indigo-950">
            {translatedText}
          </div>

          {/* Phonetic Pronunciation Guide */}
          {pronunciation && (
            <div className="text-xs text-indigo-700 dark:text-indigo-300 italic flex items-center gap-1.5">
              <span className="font-semibold not-italic">🗣️ Telaffuz:</span>
              <span>{pronunciation}</span>
            </div>
          )}

          {/* Bottom Audio Player Bar with "Sesli Dinle" */}
          <div className="flex items-center justify-between pt-2 border-t border-indigo-100 dark:border-indigo-900/40">
            <div className="flex items-center gap-2">
              {/* PRIMARY TTS BUTTON */}
              <button
                onClick={() => handleListenSpeech(translatedText, targetLang)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm ${
                  ttsState.isPlaying
                    ? 'bg-rose-500 text-white animate-pulse'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                }`}
                title="Çevrilen Metni Sesli Oku"
              >
                <Volume2 className="w-4 h-4" />
                <span>
                  {ttsState.isPlaying
                    ? ttsState.isPaused
                      ? 'Devam Et'
                      : 'Durdur'
                    : 'Sesli Dinle'}
                </span>
              </button>

              {ttsState.isPlaying && (
                <button
                  onClick={handleStopSpeech}
                  className="p-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 transition-colors cursor-pointer"
                  title="Sesi Tamamen Kapat"
                >
                  <VolumeX className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Actions: Copy & Save */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handleCopyText(translatedText)}
                className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                title="Kopyala"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </button>

              <button
                onClick={handleSaveToHistory}
                disabled={isSaved}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                  isSaved
                    ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
                    : 'text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700'
                }`}
                title="Kayıtlara Ekle"
              >
                <BookmarkPlus className="w-3.5 h-3.5" />
                <span>{isSaved ? 'Kaydedildi' : 'Kaydet'}</span>
              </button>
            </div>
          </div>

          {/* Key Terms / Vocabulary Breakdown */}
          {keyTerms && keyTerms.length > 0 && (
            <div className="pt-2 border-t border-indigo-100 dark:border-indigo-900/40 space-y-1.5">
              <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                <span>Önemli Kelimeler & Açıklamalar</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {keyTerms.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-2 rounded-xl bg-white/70 dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-800 text-xs"
                  >
                    <div className="font-semibold text-slate-800 dark:text-slate-200">
                      {item.term} ➔ <span className="text-indigo-600 dark:text-indigo-400">{item.translation}</span>
                    </div>
                    {item.meaning && (
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {item.meaning}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Alternative Phrasings */}
          {alternativePhrasings && alternativePhrasings.length > 0 && (
            <div className="pt-1 text-xs text-slate-600 dark:text-slate-400">
              <span className="font-semibold">Alternatif İfade: </span>
              <span className="italic">{alternativePhrasings[0]}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
