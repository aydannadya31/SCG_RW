export interface TranscriptSegment {
  id: string;
  startSec: number;
  endSec: number;
  text: string;
  speaker?: string;
}

export interface TranslationData {
  targetLang: string;
  targetLangName: string;
  translatedText: string;
  pronunciation?: string;
  tone?: string;
  translatedAt: number;
  keyTerms?: Array<{
    term: string;
    translation: string;
    meaning?: string;
  }>;
  alternativeTranslations?: string[];
}

export interface RecordingItem {
  id: string;
  title: string;
  timestamp: number;
  duration: number; // in seconds
  audioUrl?: string; // object URL or base64 data url
  audioBase64?: string;
  audioMimeType?: string;
  transcript: string;
  detectedLanguage: string;
  detectedLanguageCode: string;
  confidence?: number;
  segments?: TranscriptSegment[];
  summary?: string;
  actionPoints?: string[];
  translation?: TranslationData;
  isFavorite: boolean;
  category: 'Toplantı' | 'Röportaj' | 'Ders' | 'Kişisel' | 'Çeviri' | 'Genel';
  tags: string[];
  cloudSynced: boolean;
  lastSyncedAt?: number;
}

export interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  ttsVoiceCode: string;
}

export interface AppSettings {
  theme: 'dark' | 'light';
  autoTranscribe: boolean;
  autoTranslate: boolean;
  defaultSourceLang: string;
  defaultTargetLang: string;
  ttsRate: number; // 0.5 to 2.0
  ttsPitch: number; // 0.5 to 1.5
  phoneFrameMode: boolean;
  cloudSyncEnabled: boolean;
  cloudPassphrase?: string;
}

export interface CloudBackupPayload {
  syncCode: string;
  appVersion: string;
  createdAt: number;
  itemCount: number;
  totalDurationSec: number;
  items: RecordingItem[];
}
