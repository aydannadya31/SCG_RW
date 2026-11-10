import { RecordingItem, TranslationData } from '../types';

export interface TranscribeResponse {
  transcript: string;
  detectedLanguage: string;
  detectedLanguageCode: string;
  confidence?: number;
  summary?: string;
  actionPoints?: string[];
  segments?: Array<{
    id: string;
    startSec: number;
    endSec: number;
    text: string;
    speaker?: string;
  }>;
}

export interface TranslateResponse {
  translatedText: string;
  detectedSourceLanguage?: string;
  pronunciation?: string;
  tone?: string;
  keyTerms?: Array<{
    term: string;
    translation: string;
    meaning?: string;
  }>;
  alternativeTranslations?: string[];
}

export async function requestTranscription(
  audioBase64: string,
  mimeType: string,
  sourceLang?: string
): Promise<TranscribeResponse> {
  const res = await fetch('/api/transcribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ audioBase64, mimeType, sourceLang }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: 'Transkripsiyon isteği başarısız oldu.' }));
    throw new Error(errorData.error || `Sunucu hatası (${res.status})`);
  }

  return res.json();
}

export async function requestTranslation(
  text: string,
  sourceLang: string = 'auto',
  targetLang: string = 'en',
  tone: string = 'Standart'
): Promise<TranslateResponse> {
  const res = await fetch('/api/translate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, sourceLang, targetLang, tone }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: 'Çeviri isteği başarısız oldu.' }));
    throw new Error(errorData.error || `Sunucu hatası (${res.status})`);
  }

  return res.json();
}

export async function requestAnalysis(text: string): Promise<{
  summary: string;
  keyPoints: string[];
  category: 'Toplantı' | 'Röportaj' | 'Ders' | 'Kişisel' | 'Çeviri' | 'Genel';
  sentiment: string;
}> {
  const res = await fetch('/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Analiz başarısız.' }));
    throw new Error(err.error || `Sunucu hatası (${res.status})`);
  }

  return res.json();
}

export async function syncToCloud(
  syncCode: string,
  items: RecordingItem[],
  passphraseHash?: string
): Promise<{ success: boolean; syncCode: string; savedAt: number; itemCount: number; message: string }> {
  const res = await fetch('/api/cloud/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      syncCode,
      items,
      passphraseHash,
      clientTimestamp: Date.now(),
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Bulut senkronizasyonu başarısız.' }));
    throw new Error(err.error || `Sunucu hatası (${res.status})`);
  }

  return res.json();
}

export async function restoreFromCloud(syncCode: string): Promise<{ success: boolean; backup: any }> {
  const res = await fetch(`/api/cloud/restore/${encodeURIComponent(syncCode.trim())}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Bulut yedeği bulunamadı.' }));
    throw new Error(err.error || `Sunucu hatası (${res.status})`);
  }
  return res.json();
}

export async function checkCloudStatus(): Promise<{
  status: string;
  cloudStorageAvailable: boolean;
  activeBackupCount: number;
  aiModelConfigured: boolean;
}> {
  const res = await fetch('/api/cloud/status');
  if (!res.ok) throw new Error('Bulut durumu kontrol edilemedi.');
  return res.json();
}
