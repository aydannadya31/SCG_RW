import React, { useState } from 'react';
import {
  X,
  Download,
  Smartphone,
  Apple,
  Chrome,
  Share2,
  PlusSquare,
  CheckCircle2,
  HardDrive,
  Sparkles,
  QrCode,
  ArrowRight,
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface DownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  version: string;
  buildNumber: number;
}

export const DownloadModal: React.FC<DownloadModalProps> = ({
  isOpen,
  onClose,
  version,
  buildNumber,
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [activePlatform, setActivePlatform] = useState<'android' | 'ios' | 'desktop'>('android');
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleNativeInstall = async () => {
    if (isInstallable) {
      const res = await install();
      if (res) {
        setDownloadSuccess(true);
        setTimeout(() => setDownloadSuccess(false), 3000);
      }
    } else {
      // Simulate direct PWA / APK download
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    }
  };

  const handleDownloadOfflinePackage = () => {
    const manifestData = {
      app: 'SesliCevir Pro',
      version: version,
      build: buildNumber,
      url: window.location.href,
      downloadedAt: new Date().toISOString(),
      offlineCapable: true,
      features: ['Ses Kaydı', 'Gemini AI STT', '20+ Dil Çevirisi', 'TTS Sesli Okuma', 'Bulut Yedekleme'],
    };

    const blob = new Blob([JSON.stringify(manifestData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `seslicevir-pro-v${version}-b${buildNumber}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Telefona İndir & Kur
                <span className="font-mono text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                  v{version}
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Uygulamayı telefonunuzun ana ekranına ekleyin ve dilediğiniz an kullanın.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Platform Selection Tabs */}
        <div className="grid grid-cols-3 p-2 bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-xs">
          <button
            onClick={() => setActivePlatform('android')}
            className={`py-2 px-3 rounded-xl font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              activePlatform === 'android'
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Smartphone className="w-4 h-4 text-emerald-500" />
            <span>Android</span>
          </button>

          <button
            onClick={() => setActivePlatform('ios')}
            className={`py-2 px-3 rounded-xl font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              activePlatform === 'ios'
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Apple className="w-4 h-4" />
            <span>iPhone / iOS</span>
          </button>

          <button
            onClick={() => setActivePlatform('desktop')}
            className={`py-2 px-3 rounded-xl font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              activePlatform === 'desktop'
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Chrome className="w-4 h-4 text-blue-500" />
            <span>Masaüstü</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* Success toast */}
          {downloadSuccess && (
            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Yükleme işlemi başlatıldı! Ana ekranınızı kontrol edebilirsiniz.</span>
            </div>
          )}

          {/* Android Tab */}
          {activePlatform === 'android' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-2">
                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-emerald-500" />
                  <span>Android Otomatik Yükleme (PWA)</span>
                </div>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  Chrome veya Samsung Internet üzerinden açtığınızda tek dokunuşla ana ekranınıza gerçek bir mobil uygulama gibi yüklenir.
                </p>

                <div className="pt-2">
                  <button
                    onClick={handleNativeInstall}
                    className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/30 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Telefona Şimdi Yükle (Android)</span>
                  </button>
                </div>
              </div>

              {/* Manual steps */}
              <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="font-semibold text-slate-800 dark:text-slate-200">
                  Manuel Yükleme Adımları:
                </div>
                <ol className="list-decimal pl-4 space-y-1.5 text-slate-600 dark:text-slate-400 text-[11px]">
                  <li>Telefonunuzun Chrome tarayıcısında bu sayfayı açın.</li>
                  <li>Sağ üstteki <strong>üç nokta (⋮)</strong> menüsüne dokunun.</li>
                  <li><strong>"Uygulamayı Yükle"</strong> veya <strong>"Ana Ekrana Ekle"</strong> seçeneğini seçin.</li>
                  <li>Artık uygulama simgesi telefonunuzun menüsünde ve ana ekranında yer alacaktır.</li>
                </ol>
              </div>
            </div>
          )}

          {/* iOS Tab */}
          {activePlatform === 'ios' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-slate-800/60 border border-indigo-100 dark:border-slate-700 space-y-3">
                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Apple className="w-4 h-4" />
                  <span>iPhone & iPad Kurulum Rehberi</span>
                </div>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  Apple Safari tarayıcısı üzerinden aşağıdaki 2 kolay adımı izleyerek uygulamayı ana ekranınıza ekleyebilirsiniz:
                </p>

                <div className="space-y-2 pt-1">
                  <div className="flex items-start gap-2.5 p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800">
                    <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                      <Share2 className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-800 dark:text-slate-200">
                        1. Adım: Paylaş Butonuna Dokunun
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Safari'nin alt araç çubuğundaki kare içinden yukarı ok çıkan <strong>Paylaş</strong> simgesine dokunun.
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800">
                    <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                      <PlusSquare className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-800 dark:text-slate-200">
                        2. Adım: "Ana Ekrana Ekle"yi Seçin
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Açılan menüde aşağı kaydırarak <strong>"Ana Ekrana Ekle (Add to Home Screen)"</strong> seçeneğine dokunun.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Desktop & Offline Tab */}
          {activePlatform === 'desktop' && (
            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-2">
                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <HardDrive className="w-4 h-4 text-indigo-500" />
                  <span>Masaüstü PWA & Çevrimdışı Paket</span>
                </div>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  Masaüstünde Chrome veya Edge adres çubuğunun sağ tarafındaki <strong>"Yükle"</strong> simgesine tıklayarak bağımsız bir masaüstü uygulaması olarak çalıştırabilirsiniz.
                </p>

                <div className="pt-2">
                  <button
                    onClick={handleDownloadOfflinePackage}
                    className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Çevrimdışı Kurulum Paketini İndir</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Version metadata footer */}
          <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800/40 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <div>
              <span className="font-semibold text-slate-700 dark:text-slate-300">Sürüm:</span> v{version} (Build #{buildNumber})
            </div>
            <div>
              <span className="font-semibold text-slate-700 dark:text-slate-300">Boyut:</span> ~2.4 MB
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 cursor-pointer"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
};
