import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { QrCode, Smartphone, Copy, Check, Download, ExternalLink, Sparkles, ShieldCheck } from 'lucide-react';

interface QRCodeCardProps {
  version: string;
  onOpenDownloadModal: () => void;
  customUrl?: string;
}

export const QRCodeCard: React.FC<QRCodeCardProps> = ({
  version,
  onOpenDownloadModal,
  customUrl,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [appUrl, setAppUrl] = useState<string>('');

  useEffect(() => {
    const targetUrl = customUrl || (typeof window !== 'undefined' ? window.location.href : 'https://seslicevir.app');
    setAppUrl(targetUrl);

    // Generate high quality QR code data URL
    QRCode.toDataURL(targetUrl, {
      width: 320,
      margin: 2,
      color: {
        dark: '#0f172a', // Deep slate
        light: '#ffffff', // Crisp white
      },
      errorCorrectionLevel: 'H', // High error correction
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('QR code generation error:', err));
  }, [customUrl]);

  const handleCopyLink = () => {
    if (!navigator.clipboard || !appUrl) return;
    navigator.clipboard.writeText(appUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative rounded-3xl p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden flex flex-col items-center text-center space-y-4">
      {/* Top Banner Tag */}
      <div className="w-full flex items-center justify-between">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
          <Smartphone className="w-3.5 h-3.5" />
          <span>Telefona Yükle</span>
        </div>

        <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
          v{version}
        </span>
      </div>

      {/* QR Code Container with Frame */}
      <div className="relative p-3 bg-white rounded-2xl shadow-inner border border-slate-100 dark:border-slate-800 flex items-center justify-center group">
        {/* Corner Viewfinder Accents */}
        <div className="absolute top-1.5 left-1.5 w-4 h-4 border-t-2 border-l-2 border-indigo-600 rounded-tl pointer-events-none" />
        <div className="absolute top-1.5 right-1.5 w-4 h-4 border-t-2 border-r-2 border-indigo-600 rounded-tr pointer-events-none" />
        <div className="absolute bottom-1.5 left-1.5 w-4 h-4 border-b-2 border-l-2 border-indigo-600 rounded-bl pointer-events-none" />
        <div className="absolute bottom-1.5 right-1.5 w-4 h-4 border-b-2 border-r-2 border-indigo-600 rounded-br pointer-events-none" />

        {qrDataUrl ? (
          <img
            src={qrDataUrl}
            alt="Telefona İndirmek İçin QR Kod"
            className="w-44 h-44 object-contain rounded-lg transition-transform duration-200 group-hover:scale-102"
          />
        ) : (
          <div className="w-44 h-44 flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-lg">
            <QrCode className="w-8 h-8 text-slate-400 animate-spin" />
          </div>
        )}
      </div>

      {/* Scan helper text */}
      <div className="space-y-1">
        <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center justify-center gap-1.5">
          <span>Kameranızla QR Kodu Okutun</span>
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
        </div>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-[240px] mx-auto leading-tight">
          Telefonunuzun kamerası veya QR okuyucusuyla tarayarak uygulamayı anında açın ve ana ekranınıza yükleyin.
        </p>
      </div>

      {/* Primary Actions */}
      <div className="w-full pt-1 space-y-2">
        <button
          onClick={onOpenDownloadModal}
          className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white shadow-lg shadow-indigo-600/30 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Telefona İndir & Kur</span>
        </button>

        <button
          onClick={handleCopyLink}
          className="w-full py-2 px-3 rounded-xl text-xs font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Bağlantı Kopyalandı!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Doğrudan Bağlantıyı Kopyala</span>
            </>
          )}
        </button>
      </div>

      {/* Security badge */}
      <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400">
        <ShieldCheck className="w-3 h-3 text-emerald-500" />
        <span>SSL Güvenli • Google Cloud & PWA Destekli</span>
      </div>
    </div>
  );
};
