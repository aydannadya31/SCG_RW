import React, { useState, useRef } from 'react';
import {
  FolderSync,
  Search,
  Star,
  Trash2,
  Play,
  Pause,
  Volume2,
  Cloud,
  CloudOff,
  Download,
  Share2,
  FileText,
  Subtitles,
  ExternalLink,
  X,
  Languages,
  Clock,
  Tag,
  ListOrdered,
} from 'lucide-react';
import { RecordingItem } from '../types';
import { formatDate, formatDuration, generateSrt, generateMarkdown } from '../utils/formatters';
import { getLanguageByCode } from '../utils/languages';
import { ttsPlayer } from '../utils/ttsPlayer';

interface HistoryViewProps {
  recordings: RecordingItem[];
  onToggleFavorite: (id: string) => void;
  onDeleteRecording: (id: string) => void;
  onOpenTranslator: (text: string, sourceLangCode: string) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  recordings,
  onToggleFavorite,
  onDeleteRecording,
  onOpenTranslator,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Tümü');
  const [activeItem, setActiveItem] = useState<RecordingItem | null>(null);

  // Audio playback state for recording cards
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const categories = ['Tümü', 'Favoriler', 'Çevrilenler', 'Toplantı', 'Ders', 'Röportaj', 'Çeviri'];

  // Filter recordings
  const filteredRecordings = recordings.filter((item) => {
    // Category filter
    if (selectedCategory === 'Favoriler' && !item.isFavorite) return false;
    if (selectedCategory === 'Çevrilenler' && !item.translation) return false;
    if (
      selectedCategory !== 'Tümü' &&
      selectedCategory !== 'Favoriler' &&
      selectedCategory !== 'Çevrilenler' &&
      item.category !== selectedCategory
    ) {
      return false;
    }

    // Search query filter
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const inTitle = item.title.toLowerCase().includes(q);
    const inTranscript = item.transcript.toLowerCase().includes(q);
    const inTranslation = item.translation?.translatedText.toLowerCase().includes(q);
    const inTags = item.tags?.some((t) => t.toLowerCase().includes(q));

    return inTitle || inTranscript || inTranslation || inTags;
  });

  const handlePlayAudio = (item: RecordingItem) => {
    if (playingAudioId === item.id) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setPlayingAudioId(null);
      return;
    }

    if (item.audioUrl || item.audioBase64) {
      const src = item.audioUrl || `data:${item.audioMimeType || 'audio/webm'};base64,${item.audioBase64}`;
      if (!audioRef.current) {
        audioRef.current = new Audio(src);
      } else {
        audioRef.current.src = src;
      }
      audioRef.current.onended = () => setPlayingAudioId(null);
      audioRef.current.play().catch(() => {
        // If audio playback fails, fall back to TTS
        handlePlayTts(item.transcript, item.detectedLanguageCode);
      });
      setPlayingAudioId(item.id);
    } else {
      // Fallback: TTS audio play
      handlePlayTts(item.transcript, item.detectedLanguageCode);
      setPlayingAudioId(item.id);
    }
  };

  const handlePlayTts = (text: string, langCode: string) => {
    const langObj = getLanguageByCode(langCode);
    ttsPlayer.speak(text, {
      langCode: langObj.ttsVoiceCode,
      onEnd: () => setPlayingAudioId(null),
    });
  };

  const handleDownloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 w-full h-full overflow-y-auto px-4 py-5 flex flex-col space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <FolderSync className="w-5 h-5 text-indigo-500" />
            Kayıtlar & Konuşma Geçmişi
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {recordings.length} kayıt kayıtlı • Çeviriler ve bulut senkronizasyonu
          </p>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Kayıtlar, konuşma metinleri veya çevirilerde ara..."
          className="w-full bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 placeholder-slate-400 pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs cursor-pointer"
          >
            Temizle
          </button>
        )}
      </div>

      {/* Filter Category Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1 rounded-full text-xs font-medium shrink-0 transition-colors cursor-pointer ${
              selectedCategory === cat
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Recordings List */}
      <div className="flex-1 space-y-2.5">
        {filteredRecordings.length === 0 ? (
          <div className="text-center py-12 px-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <FolderSync className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-50" />
            <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              Kayıt Bulunamadı
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
              Arama kriterlerinize uyan kayıt bulunamadı veya henüz bir ses kaydı yapılmadı.
            </p>
          </div>
        ) : (
          filteredRecordings.map((item) => {
            const isPlaying = playingAudioId === item.id;

            return (
              <div
                key={item.id}
                className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/90 shadow-sm hover:border-indigo-400/60 dark:hover:border-indigo-500/60 transition-all space-y-2"
              >
                {/* Top Row: Title, Date, Cloud status, Star */}
                <div className="flex items-start justify-between gap-2">
                  <div
                    onClick={() => setActiveItem(item)}
                    className="flex-1 cursor-pointer group min-w-0"
                  >
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-semibold text-xs text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                        {item.title}
                      </span>
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-500">
                        {formatDuration(item.duration)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(item.timestamp)}
                      </span>
                      <span>•</span>
                      <span>{item.detectedLanguage}</span>
                      {item.cloudSynced ? (
                        <span
                          className="flex items-center gap-0.5 text-emerald-500 font-medium"
                          title="Bulutta Yedeklendi"
                        >
                          <Cloud className="w-3 h-3" />
                          <span>Yedeklendi</span>
                        </span>
                      ) : (
                        <span
                          className="flex items-center gap-0.5 text-slate-400"
                          title="Yalnızca Yerel Cihazda"
                        >
                          <CloudOff className="w-3 h-3" />
                          <span>Yerel</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Top Right: Favorite & Delete */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => onToggleFavorite(item.id)}
                      className="p-1 text-slate-400 hover:text-amber-400 transition-colors cursor-pointer"
                      title="Favorilere Ekle"
                    >
                      <Star
                        className={`w-4 h-4 ${
                          item.isFavorite ? 'fill-amber-400 text-amber-400' : ''
                        }`}
                      />
                    </button>
                    <button
                      onClick={() => onDeleteRecording(item.id)}
                      className="p-1 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                      title="Kaydı Sil"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Middle Snippet: Transcript preview */}
                <div
                  onClick={() => setActiveItem(item)}
                  className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 cursor-pointer bg-slate-50/70 dark:bg-slate-950/40 p-2 rounded-xl"
                >
                  "{item.transcript}"
                </div>

                {/* Translation Preview (if available) */}
                {item.translation && (
                  <div
                    onClick={() => setActiveItem(item)}
                    className="p-2 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100/60 dark:border-indigo-900/40 flex items-center justify-between text-xs cursor-pointer"
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="font-semibold text-indigo-600 dark:text-indigo-400 shrink-0">
                        {item.translation.targetLangName}:
                      </span>
                      <span className="italic text-slate-700 dark:text-slate-300 truncate text-[11px]">
                        {item.translation.translatedText}
                      </span>
                    </div>
                  </div>
                )}

                {/* Bottom Action Bar */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800/60 text-xs">
                  {/* Play audio / Listen TTS button */}
                  <button
                    onClick={() => handlePlayAudio(item)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                      isPlaying
                        ? 'bg-rose-500 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200'
                    }`}
                  >
                    {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    <span className="text-[11px]">{isPlaying ? 'Durdur' : 'Dinle'}</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onOpenTranslator(item.transcript, item.detectedLanguageCode)}
                      className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                    >
                      <Languages className="w-3.5 h-3.5" />
                      <span>Çevir</span>
                    </button>

                    <button
                      onClick={() => setActiveItem(item)}
                      className="text-[11px] text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1 cursor-pointer"
                    >
                      Detaylar <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* DETAIL MODAL */}
      {activeItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg max-h-[85vh] bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  {activeItem.title}
                </h3>
                <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                  <span>{formatDate(activeItem.timestamp)}</span>
                  <span>•</span>
                  <span>{formatDuration(activeItem.duration)}</span>
                  <span>•</span>
                  <span>{activeItem.detectedLanguage}</span>
                </div>
              </div>

              <button
                onClick={() => setActiveItem(null)}
                className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
              {/* AI Summary (if present) */}
              {activeItem.summary && (
                <div className="p-3 rounded-2xl bg-indigo-50/70 dark:bg-slate-800/60 border border-indigo-100 dark:border-slate-700 space-y-1">
                  <div className="font-semibold text-indigo-700 dark:text-indigo-400">
                    📋 Akıllı Özet
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                    {activeItem.summary}
                  </p>
                </div>
              )}

              {/* Action Points */}
              {activeItem.actionPoints && activeItem.actionPoints.length > 0 && (
                <div className="p-3 rounded-2xl bg-emerald-50/60 dark:bg-slate-800/60 border border-emerald-100 dark:border-slate-700 space-y-1">
                  <div className="font-semibold text-emerald-700 dark:text-emerald-400">
                    🎯 Öne Çıkan Notlar
                  </div>
                  <ul className="list-disc pl-4 space-y-0.5 text-slate-700 dark:text-slate-300">
                    {activeItem.actionPoints.map((point, idx) => (
                      <li key={idx}>{point}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Original Transcript Section */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    🎙️ Orijinal Konuşma Metni
                  </span>
                  <button
                    onClick={() =>
                      handlePlayTts(activeItem.transcript, activeItem.detectedLanguageCode)
                    }
                    className="flex items-center gap-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Sesli Dinle</span>
                  </button>
                </div>

                {activeItem.segments && activeItem.segments.length > 0 ? (
                  <div className="space-y-2 bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 max-h-48 overflow-y-auto">
                    {activeItem.segments.map((seg) => (
                      <div key={seg.id} className="text-slate-700 dark:text-slate-300 leading-relaxed">
                        <span className="font-mono text-[10px] text-slate-400 mr-1.5">
                          [{formatDuration(seg.startSec)} - {formatDuration(seg.endSec)}]
                        </span>
                        {seg.speaker && (
                          <span className="font-semibold text-indigo-500 mr-1">
                            {seg.speaker}:
                          </span>
                        )}
                        <span>{seg.text}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 leading-relaxed border border-slate-200 dark:border-slate-800">
                    {activeItem.transcript}
                  </div>
                )}
              </div>

              {/* Translation Section */}
              {activeItem.translation && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      🌐 {activeItem.translation.targetLangName} Çevirisi
                    </span>
                    <button
                      onClick={() =>
                        handlePlayTts(
                          activeItem.translation!.translatedText,
                          activeItem.translation!.targetLang
                        )
                      }
                      className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>Çeviriyi Dinle</span>
                    </button>
                  </div>

                  <div className="p-3 rounded-2xl bg-indigo-50/40 dark:bg-slate-950 text-slate-800 dark:text-slate-200 leading-relaxed border border-indigo-100 dark:border-slate-800">
                    {activeItem.translation.translatedText}
                  </div>
                </div>
              )}

              {/* Export Buttons */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Dışa Aktarma & Paylaşım
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() =>
                      handleDownloadFile(activeItem.transcript, `${activeItem.title}.txt`, 'text/plain')
                    }
                    className="flex items-center justify-center gap-1.5 p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium text-slate-700 dark:text-slate-300 cursor-pointer text-xs"
                  >
                    <FileText className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Metin (.txt)</span>
                  </button>

                  <button
                    onClick={() =>
                      handleDownloadFile(
                        generateSrt(activeItem.segments, activeItem.transcript, activeItem.duration),
                        `${activeItem.title}.srt`,
                        'text/plain'
                      )
                    }
                    className="flex items-center justify-center gap-1.5 p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium text-slate-700 dark:text-slate-300 cursor-pointer text-xs"
                  >
                    <Subtitles className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Altyazı (.srt)</span>
                  </button>

                  <button
                    onClick={() =>
                      handleDownloadFile(
                        generateMarkdown(activeItem),
                        `${activeItem.title}.md`,
                        'text/markdown'
                      )
                    }
                    className="flex items-center justify-center gap-1.5 p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium text-slate-700 dark:text-slate-300 cursor-pointer text-xs"
                  >
                    <Download className="w-3.5 h-3.5 text-amber-500" />
                    <span>Rapor (.md)</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end">
              <button
                onClick={() => setActiveItem(null)}
                className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 cursor-pointer"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
