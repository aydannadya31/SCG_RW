export interface ReleaseEntry {
  version: string;
  buildNumber: number;
  releaseDate: string;
  title: string;
  changes: string[];
  isCurrent?: boolean;
}

export const INITIAL_RELEASE_HISTORY: ReleaseEntry[] = [
  {
    version: '2.5.0',
    buildNumber: 1085,
    releaseDate: '10 Kasım 2026',
    title: 'Web İndirme Portalı & Dinamik QR Kod Entegrasyonu',
    changes: [
      'Web tanıtım sayfası ve dinamik QR kod ile telefona tek tıkla yükleme',
      'PWA (Progressive Web App) akıllı yükleyici ve Android / iOS yükleme rehberi',
      'Her güncellemede otomatik artan sürüm numarası ve canlı değişiklik günlüğü (Changelog)',
      'Hızlı sürüm kontrolü ve anında güncelleme simülasyonu',
    ],
    isCurrent: true,
  },
  {
    version: '2.4.0',
    buildNumber: 1060,
    releaseDate: '10 Kasım 2026',
    title: 'Güvenli Bulut Yedekleme & Çapraz Cihaz Senkronizasyonu',
    changes: [
      '6 haneli senkronizasyon kodu ile cihazlar arası kesintisiz veri aktarımı',
      'AES-256 tabanlı bulut yedekleme ve kurtarma altyapısı',
      'SRT altyazı, TXT ve Markdown formatında rapor dışa aktarımı',
      'Telefon çerçevesi ve geniş ekran görünüm modları',
    ],
    isCurrent: false,
  },
  {
    version: '2.3.0',
    buildNumber: 1042,
    releaseDate: '9 Kasım 2026',
    title: 'Gemini 3.8 Flash Multimodal Ses & Çok Dilli Çeviri',
    changes: [
      'Google Gemini 3.8 Flash ile yüksek doğruluklu konuşmayı metne dönüştürme',
      '20+ dilde ton ayarlı (Resmi, Günlük, İş, Akademik) yapay zeka çevirisi',
      'Fonetik telaffuz rehberi ve önemli kelimeler sözlüğü',
    ],
    isCurrent: false,
  },
  {
    version: '2.0.0',
    buildNumber: 1001,
    releaseDate: '8 Kasım 2026',
    title: 'Çekirdek Ses Kaydedici & Web Speech TTS Motoru',
    changes: [
      'Web Audio API ile 60 FPS canlı frekans spektrumu ve desibel ölçümü',
      'Web Speech API ile sıfır gecikmeli çok dilli sesli okuma ve hız ayarı',
      'Karanlık ve aydınlık tema desteği',
    ],
    isCurrent: false,
  },
];

const STORAGE_KEY_VERSION = 'seslicevir_version_data_v1';

export interface VersionState {
  currentVersion: string;
  buildNumber: number;
  lastUpdated: string;
  history: ReleaseEntry[];
}

export function parseSemanticVersion(v: string): { major: number; minor: number; patch: number } {
  const clean = v.replace(/^v/i, '').trim();
  const parts = clean.split('.').map((p) => parseInt(p, 10) || 0);
  return {
    major: parts[0] ?? 2,
    minor: parts[1] ?? 5,
    patch: parts[2] ?? 0,
  };
}

export function formatSemanticVersion(major: number, minor: number, patch: number): string {
  return `${major}.${minor}.${patch}`;
}

export function bumpVersion(
  currentVersion: string,
  currentBuild: number,
  type: 'patch' | 'minor' | 'major' = 'patch'
): { nextVersion: string; nextBuild: number } {
  const { major, minor, patch } = parseSemanticVersion(currentVersion);
  let nextMajor = major;
  let nextMinor = minor;
  let nextPatch = patch;

  if (type === 'major') {
    nextMajor += 1;
    nextMinor = 0;
    nextPatch = 0;
  } else if (type === 'minor') {
    nextMinor += 1;
    nextPatch = 0;
  } else {
    nextPatch += 1;
  }

  return {
    nextVersion: formatSemanticVersion(nextMajor, nextMinor, nextPatch),
    nextBuild: currentBuild + 1,
  };
}

export function getVersionState(): VersionState {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY_VERSION) : null;
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.currentVersion && Array.isArray(parsed.history)) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading version state:', e);
  }

  const initial: VersionState = {
    currentVersion: INITIAL_RELEASE_HISTORY[0].version,
    buildNumber: INITIAL_RELEASE_HISTORY[0].buildNumber,
    lastUpdated: INITIAL_RELEASE_HISTORY[0].releaseDate,
    history: INITIAL_RELEASE_HISTORY,
  };

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY_VERSION, JSON.stringify(initial));
    } catch {}
  }

  return initial;
}

export function saveVersionState(state: VersionState): void {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY_VERSION, JSON.stringify(state));
    } catch (e) {
      console.error('Error saving version state:', e);
    }
  }
}

export function triggerSimulatedUpdate(
  currentState: VersionState,
  type: 'patch' | 'minor' | 'major' = 'patch',
  customTitle?: string
): VersionState {
  const { nextVersion, nextBuild } = bumpVersion(
    currentState.currentVersion,
    currentState.buildNumber,
    type
  );

  const now = new Date();
  const dateStr = now.toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const defaultTitle =
    type === 'major'
      ? 'Büyük Performans & Yeni Nesil Çeviri Güncellemesi'
      : type === 'minor'
      ? 'Gelişmiş Ses Filtresi & Yeni Dil Paketleri'
      : 'Kararlılık, Hız İyileştirmeleri & Hata Düzeltmeleri';

  const newEntry: ReleaseEntry = {
    version: nextVersion,
    buildNumber: nextBuild,
    releaseDate: dateStr,
    title: customTitle || defaultTitle,
    changes: [
      `Sürüm numarası v${nextVersion} (Build #${nextBuild}) olarak güncellendi`,
      'Ses işleme ve AI transkripsiyon yanıt süreleri optimize edildi',
      'QR kod bağlantısı ve mobil PWA indirme bileşeni doğrulandı',
    ],
    isCurrent: true,
  };

  const updatedHistory = [
    newEntry,
    ...currentState.history.map((h) => ({ ...h, isCurrent: false })),
  ];

  const newState: VersionState = {
    currentVersion: nextVersion,
    buildNumber: nextBuild,
    lastUpdated: dateStr,
    history: updatedHistory,
  };

  saveVersionState(newState);
  return newState;
}
