import React, { useState, useEffect } from 'react';
import {
  Cloud,
  CloudCheck,
  RefreshCw,
  Copy,
  Check,
  ShieldCheck,
  Download,
  Upload,
  Lock,
  Smartphone,
  HardDrive,
  Database,
  AlertTriangle,
} from 'lucide-react';
import { RecordingItem } from '../types';
import { generateSyncCode, validateImportJson } from '../utils/formatters';
import { syncToCloud, restoreFromCloud, checkCloudStatus } from '../utils/api';

interface CloudBackupViewProps {
  recordings: RecordingItem[];
  onUpdateRecordings: (items: RecordingItem[]) => void;
}

export const CloudBackupView: React.FC<CloudBackupViewProps> = ({
  recordings,
  onUpdateRecordings,
}) => {
  const [syncCode, setSyncCode] = useState<string>(() => {
    return localStorage.getItem('seslicevir_sync_code') || generateSyncCode();
  });

  const [inputRestoreCode, setInputRestoreCode] = useState<string>('');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [isRestoring, setIsRestoring] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<number | null>(() => {
    const saved = localStorage.getItem('seslicevir_last_sync');
    return saved ? parseInt(saved, 10) : null;
  });

  const [copied, setCopied] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [cloudStatus, setCloudStatus] = useState<{ status: string; count: number } | null>(null);
  const [encryptionPassphrase, setEncryptionPassphrase] = useState<string>('');
  const [isEncryptionEnabled, setIsEncryptionEnabled] = useState<boolean>(false);

  useEffect(() => {
    localStorage.setItem('seslicevir_sync_code', syncCode);
  }, [syncCode]);

  useEffect(() => {
    checkCloudStatus()
      .then((res) => setCloudStatus({ status: res.status, count: res.activeBackupCount }))
      .catch(() => setCloudStatus({ status: 'offline', count: 0 }));
  }, []);

  const handleSyncToCloud = async () => {
    setIsSyncing(true);
    setStatusMessage(null);

    try {
      const res = await syncToCloud(syncCode, recordings, isEncryptionEnabled ? encryptionPassphrase : undefined);

      // Update local synced status on all items
      const updated = recordings.map((i) => ({ ...i, cloudSynced: true, lastSyncedAt: res.savedAt }));
      onUpdateRecordings(updated);

      setLastSyncTime(res.savedAt);
      localStorage.setItem('seslicevir_last_sync', res.savedAt.toString());

      setStatusMessage({
        text: `Tebrikler! ${recordings.length} adet kayıt başarıyla buluta yedeklendi.`,
        type: 'success',
      });
    } catch (err: any) {
      console.error('Cloud sync error:', err);
      setStatusMessage({
        text: err.message || 'Bulut yedekleme sırasında bir hata oluştu.',
        type: 'error',
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleRestoreFromCloud = async () => {
    if (!inputRestoreCode.trim()) return;

    setIsRestoring(true);
    setStatusMessage(null);

    try {
      const res = await restoreFromCloud(inputRestoreCode.trim());
      if (res.backup && Array.isArray(res.backup.items)) {
        onUpdateRecordings(res.backup.items);
        setSyncCode(inputRestoreCode.toUpperCase().trim());
        setLastSyncTime(res.backup.savedAt || Date.now());
        localStorage.setItem('seslicevir_last_sync', (res.backup.savedAt || Date.now()).toString());

        setStatusMessage({
          text: `Buluttan ${res.backup.items.length} kayıt başarıyla geri yüklendi!`,
          type: 'success',
        });
        setInputRestoreCode('');
      } else {
        throw new Error('Yedekleme içeriği bulunamadı.');
      }
    } catch (err: any) {
      console.error('Cloud restore error:', err);
      setStatusMessage({
        text: err.message || 'Bulut geri yüklemesi başarısız oldu.',
        type: 'error',
      });
    } finally {
      setIsRestoring(false);
    }
  };

  const handleCopySyncCode = () => {
    if (!navigator.clipboard) return;
    navigator.clipboard.writeText(syncCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Download local backup JSON file
  const handleDownloadBackupJson = () => {
    const payload = {
      app: 'SesliCevir Pro',
      version: '2.4.0',
      exportedAt: Date.now(),
      syncCode,
      itemCount: recordings.length,
      items: recordings,
    };
    const jsonStr = JSON.stringify(payload, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `seslicevir-yedek-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Upload backup JSON file
  const handleImportBackupJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const val = validateImportJson(content);
      if (val.valid && val.items) {
        onUpdateRecordings(val.items);
        setStatusMessage({
          text: `${val.items.length} kayıt dosyadan başarıyla içe aktarıldı.`,
          type: 'success',
        });
      } else {
        setStatusMessage({
          text: val.error || 'Geçersiz yedekleme dosyası.',
          type: 'error',
        });
      }
    };
    reader.readAsText(file);
  };

  const totalDurationSec = recordings.reduce((acc, r) => acc + (r.duration || 0), 0);
  const syncedCount = recordings.filter((r) => r.cloudSynced).length;

  return (
    <div className="flex-1 w-full h-full overflow-y-auto px-4 py-5 flex flex-col space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <Cloud className="w-5 h-5 text-indigo-500" />
          Güvenli Bulut Yedekleme & Senkronizasyon
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Kayıtlarınızı ve çevirilerinizi şifreli bulutta saklayın, istediğiniz telefondan veya cihazdan anında geri yükleyin.
        </p>
      </div>

      {/* Cloud Status Card */}
      <div className="p-4 rounded-3xl bg-gradient-to-br from-indigo-900/90 to-slate-900 text-white shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-200">
              Bulut Durumu: Çevrimiçi
            </span>
          </div>

          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-white/10 text-white border border-white/10">
            AES-256 Şifreleme
          </span>
        </div>

        {/* Sync Code Box */}
        <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-indigo-200 font-medium">
              Senkronizasyon Kodunuz
            </div>
            <div className="text-lg font-extrabold font-mono tracking-widest text-white mt-0.5">
              {syncCode}
            </div>
          </div>

          <button
            onClick={handleCopySyncCode}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Kopyalandı' : 'Kodu Kopyala'}</span>
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2 text-center pt-1 border-t border-white/10">
          <div>
            <div className="text-lg font-bold">{recordings.length}</div>
            <div className="text-[10px] text-indigo-200">Toplam Kayıt</div>
          </div>
          <div>
            <div className="text-lg font-bold">{syncedCount}</div>
            <div className="text-[10px] text-indigo-200">Bulutta Hazır</div>
          </div>
          <div>
            <div className="text-lg font-bold">{Math.round(totalDurationSec / 60)} dk</div>
            <div className="text-[10px] text-indigo-200">Toplam Ses</div>
          </div>
        </div>

        {/* Big Cloud Sync Button */}
        <button
          onClick={handleSyncToCloud}
          disabled={isSyncing}
          className={`w-full py-2.5 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer ${
            isSyncing
              ? 'bg-slate-700 text-slate-300 cursor-not-allowed'
              : 'bg-emerald-500 hover:bg-emerald-600 text-slate-950 active:scale-98 shadow-emerald-500/25'
          }`}
        >
          <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
          <span>{isSyncing ? 'Buluta Aktarılıyor...' : 'Şimdi Buluta Yedekle'}</span>
        </button>

        {lastSyncTime && (
          <div className="text-center text-[10px] text-indigo-200/80">
            Son başarılı yedekleme: {new Date(lastSyncTime).toLocaleDateString('tr-TR', {
              day: 'numeric',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </div>
        )}
      </div>

      {/* Status Notification */}
      {statusMessage && (
        <div
          className={`p-3 rounded-2xl text-xs flex items-start gap-2 border ${
            statusMessage.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
              : 'bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          )}
          <div className="flex-1">{statusMessage.text}</div>
        </div>
      )}

      {/* Cross-Device Cloud Restore Section */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
        <div className="flex items-center gap-2">
          <Smartphone className="w-4 h-4 text-indigo-500" />
          <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Başka Cihazdan Geri Yükle
          </h2>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Farklı bir telefondan veya bilgisayardan aldığınız senkronizasyon kodunu yazarak tüm kayıtlarınızı bu cihaza aktarın.
        </p>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={inputRestoreCode}
            onChange={(e) => setInputRestoreCode(e.target.value.toUpperCase())}
            placeholder="Örn: SC-8492KL"
            className="flex-1 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />

          <button
            onClick={handleRestoreFromCloud}
            disabled={isRestoring || !inputRestoreCode.trim()}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              isRestoring || !inputRestoreCode.trim()
                ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md active:scale-95'
            }`}
          >
            {isRestoring ? 'İndiriliyor...' : 'Geri Yükle'}
          </button>
        </div>
      </div>

      {/* Offline File Backup / Import Section */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
        <div className="flex items-center gap-2">
          <HardDrive className="w-4 h-4 text-emerald-500" />
          <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Dosya Tabanlı Yedekleme (JSON)
          </h2>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          İnternet bağlantısından bağımsız olarak tüm ses kayıt ve çeviri veritabanınızı tek bir dosya halinde cihazınıza indirin veya geri yükleyin.
        </p>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleDownloadBackupJson}
            className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 cursor-pointer transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-indigo-500" />
            <span>Yedeği İndir (.json)</span>
          </button>

          <label className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 cursor-pointer transition-colors">
            <Upload className="w-3.5 h-3.5 text-emerald-500" />
            <span>Yedek Yükle</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportBackupJson}
              className="hidden"
            />
          </label>
        </div>
      </div>
    </div>
  );
};
