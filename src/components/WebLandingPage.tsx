import React, { useState } from 'react';
import {
  Mic,
  Languages,
  Volume2,
  Cloud,
  Smartphone,
  Download,
  QrCode,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  GitBranch,
  Layers,
  ChevronRight,
  Sun,
  Moon,
  Zap,
  Globe,
  Radio,
  FileText,
} from 'lucide-react';
import { QRCodeCard } from './QRCodeCard';
import { DownloadModal } from './DownloadModal';
import { VersionState, triggerSimulatedUpdate } from '../utils/version';

interface WebLandingPageProps {
  versionState: VersionState;
  onUpdateVersionState: (newState: VersionState) => void;
  onLaunchApp: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export const WebLandingPage: React.FC<WebLandingPageProps> = ({
  versionState,
  onUpdateVersionState,
  onLaunchApp,
  theme,
  onToggleTheme,
}) => {
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState<boolean>(false);
  const [isUpdatingVersion, setIsUpdatingVersion] = useState<boolean>(false);
  const [updateToast, setUpdateToast] = useState<string | null>(null);

  const handleSimulateVersionUpdate = (type: 'patch' | 'minor' | 'major') => {
    setIsUpdatingVersion(true);
    setTimeout(() => {
      const newState = triggerSimulatedUpdate(versionState, type);
      onUpdateVersionState(newState);
      setIsUpdatingVersion(false);
      setUpdateToast(`Tebrikler! Sürüm v${newState.currentVersion} (Build #${newState.buildNumber}) başarıyla yayımlandı.`);
      setTimeout(() => setUpdateToast(null), 4000);
    }, 600);
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col font-sans transition-colors duration-300">
      {/* 1. Top Navigation Bar */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/80 dark:bg-slate-950/80 border-b border-slate-200/80 dark:border-slate-800/80 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-indigo-600 to-rose-500 flex items-center justify-center text-white shadow-md shadow-indigo-600/20">
            <Mic className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">
                SesliCevir Pro
              </span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold font-mono bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 animate-pulse">
                v{versionState.currentVersion}
              </span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 hidden sm:block">
              Yapay Zeka Destekli Ses Kaydı & Çeviri Portalı
            </p>
          </div>
        </div>

        <nav className="flex items-center gap-2 sm:gap-4">
          <a
            href="#features"
            className="text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hidden md:inline-block transition-colors"
          >
            Özellikler
          </a>
          <a
            href="#download"
            className="text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hidden md:inline-block transition-colors"
          >
            Telefona İndir (QR)
          </a>
          <a
            href="#changelog"
            className="text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hidden md:inline-block transition-colors"
          >
            Sürüm Geçmişi
          </a>

          {/* Theme toggle */}
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors cursor-pointer"
            aria-label="Tema Değiştir"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700" />
            )}
          </button>

          {/* Direct download modal CTA */}
          <button
            onClick={() => setIsDownloadModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-indigo-500" />
            <span className="hidden sm:inline">İndir (PWA)</span>
          </button>

          {/* Launch app button */}
          <button
            onClick={onLaunchApp}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white shadow-lg shadow-indigo-600/30 transition-all cursor-pointer active:scale-95"
          >
            <span>Uygulamayı Aç</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </nav>
      </header>

      {/* Floating Update Toast */}
      {updateToast && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-slate-900 text-white border border-indigo-500/40 shadow-2xl flex items-center gap-3 animate-bounce">
          <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
          <div className="text-xs font-medium">{updateToast}</div>
        </div>
      )}

      {/* 2. Hero Section: Headline, QR Code Card, Quick Actions */}
      <section className="w-full max-w-6xl mx-auto px-4 sm:px-8 pt-10 sm:pt-16 pb-12 sm:pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Headlines & Call to Actions */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Yapay Zeka Destekli Mobil Ses & Çeviri Portalı</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-950 dark:text-white leading-[1.15]">
              Konuşulan Sesleri Kaydedin,{' '}
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-rose-500 bg-clip-text text-transparent">
                Anında Metne ve 20+ Dile
              </span>{' '}
              Dönüştürün.
            </h1>

            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl">
              Google Gemini 3.8 Flash multimodal yapay zeka gücüyle ses kayıtlarınızı kusursuz transkripte edin,
              istediğiniz dünya diline çevirin, doğal ses tonlarıyla dinleyin ve güvenli bulutta saklayın.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => setIsDownloadModalOpen(true)}
                className="px-6 py-3.5 rounded-2xl text-sm font-bold bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white shadow-xl shadow-indigo-600/30 active:scale-95 transition-all flex items-center gap-2.5 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Telefona İndir & Kur</span>
              </button>

              <button
                onClick={onLaunchApp}
                className="px-6 py-3.5 rounded-2xl text-sm font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 shadow-sm active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Smartphone className="w-4 h-4 text-indigo-500" />
                <span>Web'de Canlı Dene</span>
              </button>
            </div>

            {/* Highlights Bar */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-200 dark:border-slate-800/80 text-xs">
              <div>
                <div className="font-extrabold text-base text-slate-900 dark:text-white">20+ Dil</div>
                <div className="text-slate-500 dark:text-slate-400 text-[11px]">Doğal Çeviri & Ton</div>
              </div>
              <div>
                <div className="font-extrabold text-base text-slate-900 dark:text-white">Sıfır Gecikme</div>
                <div className="text-slate-500 dark:text-slate-400 text-[11px]">Web Speech TTS</div>
              </div>
              <div>
                <div className="font-extrabold text-base text-slate-900 dark:text-white">AES-256</div>
                <div className="text-slate-500 dark:text-slate-400 text-[11px]">Bulut Senkronizasyonu</div>
              </div>
            </div>
          </div>

          {/* Right Column: Hero QR Code Card */}
          <div id="download" className="lg:col-span-5 flex justify-center">
            <div className="w-full max-w-sm">
              <QRCodeCard
                version={versionState.currentVersion}
                onOpenDownloadModal={() => setIsDownloadModalOpen(true)}
              />
            </div>
          </div>
        </div>
      </section>

      {/* 3. Features Section */}
      <section id="features" className="w-full py-16 bg-white dark:bg-slate-900/50 border-y border-slate-200 dark:border-slate-800/80">
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-8 space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Zap className="w-3.5 h-3.5" />
              <span>Gelişmiş Teknolojiler</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Her Konuşmayı Anlayan, Çeviren ve Seslendiren Güçlü Altyapı
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Toplantılardan ders notlarına, seyahat diyaloglarından röportajlara kadar tüm ses ihtiyaçlarınızı tek uygulamada birleştirdik.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 hover:border-indigo-500/50 transition-all">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                <Radio className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Canlı Ses Kaydı & Frekans Dalgası
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Web Audio API ve AnalyserNode ile 60 FPS gerçek zamanlı desibel ölçümü, dinamik ses dalgası görselleştiricisi ve duraklat/devam et kontrolleri.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 hover:border-indigo-500/50 transition-all">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Gemini 3.8 Flash AI Transkripsiyon
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Konuşmaları yüksek doğrulukla metne dönüştürür. Zaman damgaları, konuşmacı ayrımı ve otomatik toplantı özeti çıkarır.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 hover:border-indigo-500/50 transition-all">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Languages className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                20+ Dil Çevirisi & Ton Ayarı
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                İngilizce, Almanca, Fransızca, İspanyolca, Rusça, Arapça ve daha fazlası. Resmi, günlük, iş veya akademik ton seçenekleriyle.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 hover:border-indigo-500/50 transition-all">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Volume2 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Kusursuz Telaffuzla Sesli Dinleme
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Web Speech API Text-to-Speech motoru ile çevrilen metinleri native aksanla sesli dinleyin. Hız ve ton kontrolü ile dil öğrenimini kolaylaştırın.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 hover:border-indigo-500/50 transition-all">
              <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
                <Cloud className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Bulut Yedekleme & Kodla Eşleşme
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                6 haneli senkronizasyon kodu ile kayıtlarınızı farklı telefonlar veya bilgisayarlar arasında anında geri yükleyin.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 hover:border-indigo-500/50 transition-all">
              <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <Smartphone className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                PWA ile Telefona Doğrudan Yükleme
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Uygulama mağazası indirmesine gerek kalmadan, QR kodu okutarak telefonun ana ekranına gerçek bir uygulama gibi eklenir.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Version Management & Changelog Section ("Her güncellemede sürüm numarası değişsin") */}
      <section id="changelog" className="w-full py-16 max-w-5xl mx-auto px-4 sm:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <GitBranch className="w-5 h-5 text-indigo-500" />
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Sürüm Yönetimi & Değişiklik Günlüğü (Changelog)
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Her güncellemede sürüm numarası ve derleme kimliği dinamik olarak artırılır.
            </p>
          </div>

          {/* Version Update Simulation Trigger */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleSimulateVersionUpdate('patch')}
              disabled={isUpdatingVersion}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
              title="Yeni bir yama sürümü yayınla (v2.5.0 -> v2.5.1)"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isUpdatingVersion ? 'animate-spin' : ''}`} />
              <span>Sürümü Güncelle (+0.0.1)</span>
            </button>

            <button
              onClick={() => handleSimulateVersionUpdate('minor')}
              disabled={isUpdatingVersion}
              className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer disabled:opacity-60"
              title="Yeni özellik sürümü yayınla (v2.5.0 -> v2.6.0)"
            >
              <span>+0.1.0</span>
            </button>
          </div>
        </div>

        {/* Current Active Version Card */}
        <div className="p-5 rounded-3xl bg-gradient-to-r from-indigo-900/90 via-slate-900 to-slate-900 text-white shadow-xl space-y-3 border border-indigo-500/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                Yayındaki Aktif Sürüm
              </span>
            </div>
            <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-full bg-white/10 text-white border border-white/20">
              Build #{versionState.buildNumber}
            </span>
          </div>

          <div className="flex items-baseline gap-3">
            <div className="text-3xl font-extrabold font-mono tracking-tight text-white">
              v{versionState.currentVersion}
            </div>
            <div className="text-xs text-indigo-200">
              Son Güncelleme: {versionState.lastUpdated}
            </div>
          </div>

          <p className="text-xs text-slate-300">
            {versionState.history[0]?.title || 'En son kararlılık ve özellik güncellemesi.'}
          </p>

          <div className="pt-2 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-indigo-100">
            {versionState.history[0]?.changes.map((change, idx) => (
              <div key={idx} className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>{change}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline of Previous Releases */}
        <div className="space-y-4 pt-2">
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Önceki Güncelleme Notları
          </h3>

          <div className="space-y-3">
            {versionState.history.slice(1).map((release, idx) => (
              <div
                key={`${release.version}-${idx}`}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                      v{release.version}
                    </span>
                    <span className="font-bold text-xs text-slate-900 dark:text-white">
                      {release.title}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium">
                    {release.releaseDate}
                  </span>
                </div>

                <ul className="list-disc pl-5 space-y-1 text-slate-600 dark:text-slate-400 text-xs">
                  {release.changes.map((c, cIdx) => (
                    <li key={cIdx}>{c}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Footer */}
      <footer className="w-full py-8 mt-auto border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950 text-center text-xs text-slate-500 dark:text-slate-400 space-y-2">
        <div className="flex items-center justify-center gap-2 font-semibold text-slate-800 dark:text-slate-200">
          <Mic className="w-4 h-4 text-indigo-500" />
          <span>SesliCevir Pro • v{versionState.currentVersion}</span>
        </div>
        <p className="max-w-md mx-auto text-[11px]">
          Google Gemini 3.8 Flash, Web Audio API ve Web Speech Synthesis ile güçlendirilmiştir.
        </p>
      </footer>

      {/* Download & Installation Modal */}
      <DownloadModal
        isOpen={isDownloadModalOpen}
        onClose={() => setIsDownloadModalOpen(false)}
        version={versionState.currentVersion}
        buildNumber={versionState.buildNumber}
      />
    </div>
  );
};
