import React from 'react';
import {
  Settings2,
  Moon,
  Sun,
  Volume2,
  Smartphone,
  Layers,
  MapPin,
  CheckCircle2,
  Clock,
  Shield,
  Cpu,
  Database,
  Radio,
  FileCode,
  Terminal,
} from 'lucide-react';
import { AppSettings } from '../types';
import { SUPPORTED_LANGUAGES } from '../utils/languages';
import { VersionState } from '../utils/version';
import { QrCode, Download, RefreshCw, Globe } from 'lucide-react';

interface SettingsRoadmapViewProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  isPhoneMode: boolean;
  onTogglePhoneMode: () => void;
  versionState: VersionState;
  onSimulateUpdate: (type: 'patch' | 'minor' | 'major') => void;
  onOpenDownloadModal: () => void;
  onOpenLandingPage: () => void;
}

export const SettingsRoadmapView: React.FC<SettingsRoadmapViewProps> = ({
  settings,
  onUpdateSettings,
  isPhoneMode,
  onTogglePhoneMode,
  versionState,
  onSimulateUpdate,
  onOpenDownloadModal,
  onOpenLandingPage,
}) => {
  return (
    <div className="flex-1 w-full h-full overflow-y-auto px-4 py-5 flex flex-col space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <Settings2 className="w-5 h-5 text-indigo-500" />
          Ayarlar & Mimari Yol Haritası
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Uygulama tercihleri, sistem mimarisi ve ölçeklenebilir gelişim planı.
        </p>
      </div>

      {/* Sürüm Bilgisi & QR Kod İndirme Kartı */}
      <div className="p-4 rounded-3xl bg-gradient-to-br from-indigo-900 to-slate-900 text-white shadow-lg space-y-3 border border-indigo-500/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-200">
              Uygulama Sürümü
            </span>
          </div>
          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-full bg-white/10 text-white border border-white/20">
            Build #{versionState.buildNumber}
          </span>
        </div>

        <div className="flex items-baseline justify-between">
          <div>
            <div className="text-2xl font-extrabold font-mono tracking-tight">
              v{versionState.currentVersion}
            </div>
            <div className="text-[11px] text-indigo-200">
              Son Güncelleme: {versionState.lastUpdated}
            </div>
          </div>

          {/* Simulate version update */}
          <button
            onClick={() => onSimulateUpdate('patch')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-semibold transition-colors cursor-pointer"
            title="Yeni yama sürümünü simüle et (+0.0.1)"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Sürüm Güncelle (+0.0.1)</span>
          </button>
        </div>

        {/* Action buttons: Web Page & QR Download */}
        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/10">
          <button
            onClick={onOpenDownloadModal}
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs transition-colors cursor-pointer shadow-md"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Telefona İndir (QR)</span>
          </button>

          <button
            onClick={onOpenLandingPage}
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition-colors cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Web Tanıtım Sayfası</span>
          </button>
        </div>
      </div>

      {/* 1. App Preferences Section */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Uygulama Tercihleri
        </h2>

        {/* Theme Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs">
            {settings.theme === 'dark' ? (
              <Moon className="w-4 h-4 text-indigo-400" />
            ) : (
              <Sun className="w-4 h-4 text-amber-500" />
            )}
            <div>
              <div className="font-semibold text-slate-900 dark:text-white">Karanlık Mod</div>
              <div className="text-[11px] text-slate-400">Göz yormayan gece teması</div>
            </div>
          </div>

          <button
            onClick={() => onUpdateSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' })}
            className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-200 ${
              settings.theme === 'dark' ? 'bg-indigo-600 justify-end' : 'bg-slate-300 justify-start'
            }`}
          >
            <div className="w-4 h-4 rounded-full bg-white shadow-md" />
          </button>
        </div>

        {/* Phone Frame Toggle */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 text-xs">
            <Smartphone className="w-4 h-4 text-indigo-500" />
            <div>
              <div className="font-semibold text-slate-900 dark:text-white">
                Telefon Çerçevesi Mockup
              </div>
              <div className="text-[11px] text-slate-400">Akıllı telefon kasası içinde göster</div>
            </div>
          </div>

          <button
            onClick={onTogglePhoneMode}
            className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-200 ${
              isPhoneMode ? 'bg-indigo-600 justify-end' : 'bg-slate-300 justify-start'
            }`}
          >
            <div className="w-4 h-4 rounded-full bg-white shadow-md" />
          </button>
        </div>

        {/* TTS Speech Rate */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5 text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-emerald-500" />
              <span className="font-semibold text-slate-900 dark:text-white">
                Sesli Dinleme (TTS) Hızı
              </span>
            </div>
            <span className="font-mono text-[11px] font-bold text-indigo-500">
              {settings.ttsRate}x
            </span>
          </div>

          <input
            type="range"
            min="0.5"
            max="1.5"
            step="0.1"
            value={settings.ttsRate}
            onChange={(e) => onUpdateSettings({ ttsRate: parseFloat(e.target.value) })}
            className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
          />
        </div>

        {/* Default Target Language */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
          <div>
            <div className="font-semibold text-slate-900 dark:text-white">Varsayılan Çeviri Dili</div>
            <div className="text-[11px] text-slate-400">Yeni kayıtlarda otomatik seçilen hedef dil</div>
          </div>

          <select
            value={settings.defaultTargetLang}
            onChange={(e) => onUpdateSettings({ defaultTargetLang: e.target.value })}
            className="bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1 text-xs font-medium cursor-pointer"
          >
            {SUPPORTED_LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.flag} {l.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 2. Scalable Architecture Overview Section */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
          <Layers className="w-4 h-4" />
          <h2 className="text-xs font-bold uppercase tracking-wider">
            Ölçeklenebilir Mimari & Kod Yapısı
          </h2>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-300">
          Proje, mikroservis ve modüler full-stack katmanlı mimariye uygun olarak inşa edilmiştir:
        </p>

        <div className="space-y-2 text-xs">
          <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700 flex items-start gap-2.5">
            <Smartphone className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-slate-900 dark:text-white">
                1. Sunum & Arayüz Katmanı (UI/UX)
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                React 19 + Tailwind v4 + Motion tabanlı, mobil-öncelikli dokunmatik kontroller, karanlık/aydınlık tema ve sezgisel tab menüsü.
              </p>
            </div>
          </div>

          <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700 flex items-start gap-2.5">
            <Radio className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-slate-900 dark:text-white">
                2. Ses İşleme & Web Audio Motoru
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                MediaRecorder + AudioContext AnalyserNode ile 60fps gerçek zamanlı frekans dalgası, desibel ölçümü ve ses dosyası dışa aktarımı.
              </p>
            </div>
          </div>

          <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700 flex items-start gap-2.5">
            <Cpu className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-slate-900 dark:text-white">
                3. Sunucu Tarafı Yapay Zeka Motoru (Gemini 3.8 Flash)
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Express proxy üzerinden güvenli SDK çağrıları. Multimodal ses transkripsiyonu, zaman damgaları, konuşmacı ayrımı ve çok dilli çeviri.
              </p>
            </div>
          </div>

          <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700 flex items-start gap-2.5">
            <Volume2 className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-slate-900 dark:text-white">
                4. Sesli Dinleme & TTS Katmanı (Speech Synthesis)
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Yerel donanım hızlandırmalı Web Speech API ile sıfır gecikmeli, 20+ dünya dilinde doğru telaffuzla sesli okuma ve hız ayarı.
              </p>
            </div>
          </div>

          <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700 flex items-start gap-2.5">
            <Database className="w-4 h-4 text-cyan-500 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-slate-900 dark:text-white">
                5. Güvenli Bulut Yedekleme & Çapraz Cihaz Senkronizasyonu
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Cihazlar arası eşleşme için 6 haneli benzersiz senkronizasyon kodu, JSON yedeği ve SRT altyazı üretimi.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Detailed Roadmap Section */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
          <MapPin className="w-4 h-4" />
          <h2 className="text-xs font-bold uppercase tracking-wider">
            Detaylı Geliştirme Yol Haritası (Roadmap)
          </h2>
        </div>

        <div className="space-y-3 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
          {/* Phase 1 */}
          <div className="relative flex items-start gap-3 pl-2">
            <div className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] z-10 shrink-0 mt-0.5 ring-4 ring-white dark:ring-slate-900">
              ✓
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-xs text-slate-900 dark:text-white">
                  Faz 1: Çekirdek Ses & Çeviri Motoru
                </span>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-500/10 text-emerald-600">
                  Tamamlandı
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Canlı ses kaydı, dinamik dalga boyu görselleştiricisi, Gemini 3.8 Flash transkripsiyonu, 20+ dil çevirisi ve TTS sesli okuma.
              </p>
            </div>
          </div>

          {/* Phase 2 */}
          <div className="relative flex items-start gap-3 pl-2">
            <div className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] z-10 shrink-0 mt-0.5 ring-4 ring-white dark:ring-slate-900">
              ✓
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-xs text-slate-900 dark:text-white">
                  Faz 2: Bulut Senkronizasyonu & Karanlık Mod
                </span>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-500/10 text-emerald-600">
                  Tamamlandı
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Cihazlar arası senkronizasyon kodu, buluta yedekleme, SRT/TXT/Markdown rapor dışa aktarma ve mobil çerçeve tasarımı.
              </p>
            </div>
          </div>

          {/* Phase 3 */}
          <div className="relative flex items-start gap-3 pl-2">
            <div className="w-4 h-4 rounded-full bg-indigo-500 text-white flex items-center justify-center text-[10px] z-10 shrink-0 mt-0.5 ring-4 ring-white dark:ring-slate-900">
              3
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-xs text-slate-900 dark:text-white">
                  Faz 3: Canlı Çift Yönlü Tercüme (Live API)
                </span>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-indigo-500/10 text-indigo-600">
                  Aktif Geliştirme
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                İki farklı dilde konuşan kullanıcı için bölünmüş ekran yüz yüze simultane tercüme modu ve arka plan gürültü yalıtımı.
              </p>
            </div>
          </div>

          {/* Phase 4 */}
          <div className="relative flex items-start gap-3 pl-2">
            <div className="w-4 h-4 rounded-full bg-slate-300 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center text-[10px] z-10 shrink-0 mt-0.5 ring-4 ring-white dark:ring-slate-900">
              4
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-xs text-slate-900 dark:text-white">
                  Faz 4: Kurumsal Güvenlik & Offline WASM
                </span>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500">
                  Gelecek Planı
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                İnternetsiz çevrimdışı Whisper/WASM modelleri, kurumsal tekil oturum açma (SSO) ve otomatik Cloud Run ölçekleme entegrasyonu.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
