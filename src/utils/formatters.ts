import { RecordingItem, TranscriptSegment } from '../types';

/**
 * Formats duration in seconds to MM:SS or HH:MM:SS
 */
export function formatDuration(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const totalSecs = Math.floor(seconds);
  const hrs = Math.floor(totalSecs / 3600);
  const mins = Math.floor((totalSecs % 3600) / 60);
  const secs = totalSecs % 60;

  const mm = mins.toString().padStart(2, '0');
  const ss = secs.toString().padStart(2, '0');

  if (hrs > 0) {
    const hh = hrs.toString().padStart(2, '0');
    return `${hh}:${mm}:${ss}`;
  }
  return `${mm}:${ss}`;
}

/**
 * Formats timestamp to readable Turkish date & time
 */
export function formatDate(timestamp: number): string {
  try {
    const date = new Date(timestamp);
    return date.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return 'Bilinmeyen Tarih';
  }
}

/**
 * Converts seconds into SRT subtitle timestamp format: 00:01:23,450
 */
export function formatSrtTimestamp(seconds: number): string {
  const totalMs = Math.floor(seconds * 1000);
  const ms = (totalMs % 1000).toString().padStart(3, '0');
  const totalSecs = Math.floor(seconds);
  const hrs = Math.floor(totalSecs / 3600).toString().padStart(2, '0');
  const mins = Math.floor((totalSecs % 3600) / 60).toString().padStart(2, '0');
  const secs = (totalSecs % 60).toString().padStart(2, '0');
  return `${hrs}:${mins}:${secs},${ms}`;
}

/**
 * Generates an SRT subtitle file string from segments or single transcript
 */
export function generateSrt(segments?: TranscriptSegment[], fullText?: string, durationSec: number = 5): string {
  if (segments && segments.length > 0) {
    return segments
      .map((seg, idx) => {
        const start = formatSrtTimestamp(seg.startSec);
        const end = formatSrtTimestamp(seg.endSec);
        const speaker = seg.speaker ? `[${seg.speaker}] ` : '';
        return `${idx + 1}\n${start} --> ${end}\n${speaker}${seg.text.trim()}\n`;
      })
      .join('\n');
  }

  // Fallback if no segments: single SRT block
  const start = formatSrtTimestamp(0);
  const end = formatSrtTimestamp(durationSec > 0 ? durationSec : 5);
  return `1\n${start} --> ${end}\n${fullText || ''}\n`;
}

/**
 * Generates formatted Markdown report for an audio recording & translation
 */
export function generateMarkdown(item: RecordingItem): string {
  let md = `# ${item.title}\n\n`;
  md += `- **Tarih:** ${formatDate(item.timestamp)}\n`;
  md += `- **Süre:** ${formatDuration(item.duration)}\n`;
  md += `- **Algılanan Dil:** ${item.detectedLanguage}\n`;
  md += `- **Kategori:** ${item.category}\n`;
  if (item.tags && item.tags.length > 0) {
    md += `- **Etiketler:** ${item.tags.join(', ')}\n`;
  }
  md += `\n---\n\n`;

  if (item.summary) {
    md += `## 📋 Özet & Ana Fikir\n${item.summary}\n\n`;
  }

  if (item.actionPoints && item.actionPoints.length > 0) {
    md += `## 🎯 Aksiyon Maddeleri / Notlar\n`;
    item.actionPoints.forEach((point) => {
      md += `- ${point}\n`;
    });
    md += `\n`;
  }

  md += `## 🎙️ Orijinal Konuşma Metni (Transkripsiyon)\n`;
  if (item.segments && item.segments.length > 0) {
    item.segments.forEach((seg) => {
      const time = `[${formatDuration(seg.startSec)} - ${formatDuration(seg.endSec)}]`;
      const spk = seg.speaker ? `**${seg.speaker}:** ` : '';
      md += `${time} ${spk}${seg.text}\n\n`;
    });
  } else {
    md += `${item.transcript || '(Metin yok)'}\n\n`;
  }

  if (item.translation) {
    md += `---\n\n## 🌐 Çeviri (${item.translation.targetLangName})\n`;
    md += `${item.translation.translatedText}\n\n`;
    if (item.translation.pronunciation) {
      md += `*Telaffuz:* _${item.translation.pronunciation}_\n\n`;
    }
    if (item.translation.keyTerms && item.translation.keyTerms.length > 0) {
      md += `### 💡 Anahtar Kelimeler\n`;
      item.translation.keyTerms.forEach((k) => {
        md += `- **${k.term}**: ${k.translation}${k.meaning ? ` (${k.meaning})` : ''}\n`;
      });
      md += `\n`;
    }
  }

  md += `\n_SesliCevir Pro tarafından oluşturuldu._\n`;
  return md;
}

/**
 * Generates random 6-character sync code for cross-device cloud sync
 */
export function generateSyncCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `SC-${code}`;
}

/**
 * Validates imported JSON string
 */
export function validateImportJson(jsonStr: string): { valid: boolean; items?: RecordingItem[]; error?: string } {
  try {
    const parsed = JSON.parse(jsonStr);
    const candidateList = Array.isArray(parsed) ? parsed : parsed.items;
    if (!Array.isArray(candidateList)) {
      return { valid: false, error: 'Geçersiz veri biçimi: Liste bulunamadı.' };
    }
    const validItems: RecordingItem[] = candidateList.filter((item: any) => {
      return item && typeof item.id === 'string' && typeof item.title === 'string';
    });
    if (validItems.length === 0) {
      return { valid: false, error: 'Yüklenebilecek geçerli kayıt bulunamadı.' };
    }
    return { valid: true, items: validItems };
  } catch (err: any) {
    return { valid: false, error: `JSON ayrıştırma hatası: ${err.message}` };
  }
}
