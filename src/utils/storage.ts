import { AppSettings, RecordingItem } from '../types';

const STORAGE_KEY_RECORDINGS = 'seslicevir_recordings_v1';
const STORAGE_KEY_SETTINGS = 'seslicevir_settings_v1';

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark',
  autoTranscribe: true,
  autoTranslate: false,
  defaultSourceLang: 'tr',
  defaultTargetLang: 'en',
  ttsRate: 1.0,
  ttsPitch: 1.0,
  phoneFrameMode: false,
  cloudSyncEnabled: true,
  cloudPassphrase: '',
};

// Initial realistic seed items
const INITIAL_SEED_RECORDINGS: RecordingItem[] = [
  {
    id: 'seed-1',
    title: 'Yeni Ürün Lansmanı Toplantısı',
    timestamp: Date.now() - 1000 * 60 * 35, // 35 mins ago
    duration: 38,
    transcript:
      'Önümüzdeki çeyrekte mobil uygulamamızı kullanıcılarla buluşturmayı planlıyoruz. Özellikle ses tanıma ve gerçek zamanlı yapay zeka çevirisi özelliklerinin kusursuz çalışması kritik önem taşıyor.',
    detectedLanguage: 'Türkçe',
    detectedLanguageCode: 'tr',
    confidence: 0.98,
    category: 'Toplantı',
    tags: ['İş', 'Yapay Zeka', 'Mobil'],
    isFavorite: true,
    cloudSynced: true,
    lastSyncedAt: Date.now() - 1000 * 60 * 20,
    summary: 'Mobil uygulamanın ses tanıma ve AI çeviri yetenekleriyle önümüzdeki çeyrek lansmanına odaklanıldı.',
    actionPoints: [
      'Ses tanıma gecikme süresini optimize et',
      'Çeviri dil paketlerini doğrula',
      'Beta kullanıcı testi başlat',
    ],
    segments: [
      { id: 's1', startSec: 0, endSec: 12, text: 'Önümüzdeki çeyrekte mobil uygulamamızı kullanıcılarla buluşturmayı planlıyoruz.', speaker: 'Proje Yöneticisi' },
      { id: 's2', startSec: 12.5, endSec: 26, text: 'Özellikle ses tanıma ve gerçek zamanlı yapay zeka çevirisi özelliklerinin kusursuz çalışması kritik önem taşıyor.', speaker: 'Teknik Lider' },
      { id: 's3', startSec: 26.5, endSec: 38, text: 'Kullanıcı dostu arayüz ve karanlık mod desteğiyle harika bir deneyim sunacağız.', speaker: 'Tasarımcı' },
    ],
    translation: {
      targetLang: 'en',
      targetLangName: 'İngilizce',
      translatedText:
        'We plan to bring our mobile application to users in the upcoming quarter. Ensuring flawless voice recognition and real-time AI translation features is of critical importance.',
      pronunciation: 'wiː plæn tuː brɪŋ aʊər ˈmoʊbəl ˌæplɪˈkeɪʃən...',
      tone: 'İş / Profesyonel',
      translatedAt: Date.now() - 1000 * 60 * 30,
      keyTerms: [
        { term: 'flawless', translation: 'kusursuz', meaning: 'hatasız, mükemmel' },
        { term: 'voice recognition', translation: 'ses tanıma', meaning: 'konuşmayı algılama teknolojisi' },
      ],
      alternativeTranslations: [
        'Our goal is to launch our mobile app next quarter, prioritizing speech-to-text and AI translation.',
      ],
    },
  },
  {
    id: 'seed-2',
    title: 'Havalimanı & Otel Diyaloğu',
    timestamp: Date.now() - 1000 * 60 * 180, // 3 hours ago
    duration: 22,
    transcript:
      'Good evening! I have a reservation under the name Melek for three nights. Could you please also let me know where the nearest subway station is?',
    detectedLanguage: 'İngilizce',
    detectedLanguageCode: 'en',
    confidence: 0.99,
    category: 'Çeviri',
    tags: ['Seyahat', 'Otel', 'İngilizce'],
    isFavorite: false,
    cloudSynced: true,
    lastSyncedAt: Date.now() - 1000 * 60 * 170,
    summary: 'Otel giriş kaydı ve en yakın metro istasyonunun yön tarifi sorgusu.',
    actionPoints: ['Oda anahtarını al', 'Metro haritasını kaydet'],
    segments: [
      { id: 's2-1', startSec: 0, endSec: 10, text: 'Good evening! I have a reservation under the name Melek for three nights.', speaker: 'Misafir' },
      { id: 's2-2', startSec: 10.5, endSec: 22, text: 'Could you please also let me know where the nearest subway station is?', speaker: 'Misafir' },
    ],
    translation: {
      targetLang: 'tr',
      targetLangName: 'Türkçe',
      translatedText:
        'İyi akşamlar! Melek adına üç gecelik bir rezervasyonum var. Ayrıca lütfen en yakın metro istasyonunun nerede olduğunu da söyleyebilir misiniz?',
      tone: 'Resmi / Nezaket',
      translatedAt: Date.now() - 1000 * 60 * 175,
      keyTerms: [
        { term: 'reservation', translation: 'rezervasyon', meaning: 'önceden yer ayırtma' },
        { term: 'subway station', translation: 'metro istasyonu', meaning: 'yeraltı tren durağı' },
      ],
    },
  },
  {
    id: 'seed-3',
    title: 'Yapay Zeka ve Gelecek - Ders Notları',
    timestamp: Date.now() - 1000 * 60 * 60 * 24, // 1 day ago
    duration: 45,
    transcript:
      'Büyük dil modelleri ile ses işleme teknolojilerinin birleşimi, dil bariyerlerini tamamen ortadan kaldırıyor. Artık dünyanın herhangi bir yerindeki bir kişiyle kendi ana dilinizde kesintisiz iletişim kurabiliyorsunuz.',
    detectedLanguage: 'Türkçe',
    detectedLanguageCode: 'tr',
    confidence: 0.97,
    category: 'Ders',
    tags: ['Eğitim', 'Yapay Zeka'],
    isFavorite: true,
    cloudSynced: true,
    lastSyncedAt: Date.now() - 1000 * 60 * 60 * 23,
    summary: 'LLM ve konuşma işleme teknolojilerinin dil bariyerlerini kaldırması üzerine akademik not.',
    segments: [
      { id: 's3-1', startSec: 0, endSec: 20, text: 'Büyük dil modelleri ile ses işleme teknolojilerinin birleşimi, dil bariyerlerini tamamen ortadan kaldırıyor.', speaker: 'Eğitmen' },
      { id: 's3-2', startSec: 21, endSec: 45, text: 'Artık dünyanın herhangi bir yerindeki bir kişiyle kendi ana dilinizde kesintisiz iletişim kurabiliyorsunuz.', speaker: 'Eğitmen' },
    ],
    translation: {
      targetLang: 'de',
      targetLangName: 'Almanca',
      translatedText:
        'Die Kombination aus großen Sprachmodellen und Sprachverarbeitungstechnologien beseitigt Sprachbarrieren vollständig. Sie können nun mit jedem Menschen auf der Welt nahtlos in Ihrer Muttersprache kommunizieren.',
      tone: 'Akademik',
      translatedAt: Date.now() - 1000 * 60 * 60 * 23,
    },
  },
];

export function getStoredRecordings(): RecordingItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_RECORDINGS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_RECORDINGS, JSON.stringify(INITIAL_SEED_RECORDINGS));
      return INITIAL_SEED_RECORDINGS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_SEED_RECORDINGS;
  } catch {
    return INITIAL_SEED_RECORDINGS;
  }
}

export function saveAllRecordings(items: RecordingItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_RECORDINGS, JSON.stringify(items));
  } catch (e) {
    console.error('Failed to save recordings to localStorage:', e);
  }
}

export function saveRecording(item: RecordingItem): RecordingItem[] {
  const current = getStoredRecordings();
  const existingIdx = current.findIndex((i) => i.id === item.id);
  let updated: RecordingItem[];
  if (existingIdx >= 0) {
    updated = [...current];
    updated[existingIdx] = item;
  } else {
    updated = [item, ...current];
  }
  saveAllRecordings(updated);
  return updated;
}

export function deleteRecording(id: string): RecordingItem[] {
  const current = getStoredRecordings();
  const updated = current.filter((i) => i.id !== id);
  saveAllRecordings(updated);
  return updated;
}

export function toggleFavorite(id: string): RecordingItem[] {
  const current = getStoredRecordings();
  const updated = current.map((i) => (i.id === id ? { ...i, isFavorite: !i.isFavorite } : i));
  saveAllRecordings(updated);
  return updated;
}

export function getAppSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SETTINGS);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveAppSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings:', e);
  }
}
