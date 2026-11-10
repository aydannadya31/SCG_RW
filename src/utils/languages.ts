import { Language } from '../types';

export const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'tr', name: 'Türkçe', nativeName: 'Türkçe', flag: '🇹🇷', ttsVoiceCode: 'tr-TR' },
  { code: 'en', name: 'İngilizce', nativeName: 'English', flag: '🇬🇧', ttsVoiceCode: 'en-US' },
  { code: 'de', name: 'Almanca', nativeName: 'Deutsch', flag: '🇩🇪', ttsVoiceCode: 'de-DE' },
  { code: 'fr', name: 'Fransızca', nativeName: 'Français', flag: '🇫🇷', ttsVoiceCode: 'fr-FR' },
  { code: 'es', name: 'İspanyolca', nativeName: 'Español', flag: '🇪🇸', ttsVoiceCode: 'es-ES' },
  { code: 'it', name: 'İtalyanca', nativeName: 'Italiano', flag: '🇮🇹', ttsVoiceCode: 'it-IT' },
  { code: 'ru', name: 'Rusça', nativeName: 'Русский', flag: '🇷🇺', ttsVoiceCode: 'ru-RU' },
  { code: 'ar', name: 'Arapça', nativeName: 'العربية', flag: '🇸🇦', ttsVoiceCode: 'ar-SA' },
  { code: 'zh', name: 'Çince (Basitleştirilmiş)', nativeName: '中文', flag: '🇨🇳', ttsVoiceCode: 'zh-CN' },
  { code: 'ja', name: 'Japonca', nativeName: '日本語', flag: '🇯🇵', ttsVoiceCode: 'ja-JP' },
  { code: 'ko', name: 'Korece', nativeName: '한국어', flag: '🇰🇷', ttsVoiceCode: 'ko-KR' },
  { code: 'pt', name: 'Portekizce', nativeName: 'Português', flag: '🇵🇹', ttsVoiceCode: 'pt-PT' },
  { code: 'nl', name: 'Felemenkçe', nativeName: 'Nederlands', flag: '🇳🇱', ttsVoiceCode: 'nl-NL' },
  { code: 'fa', name: 'Farsça', nativeName: 'فارسی', flag: '🇮🇷', ttsVoiceCode: 'fa-IR' },
  { code: 'hi', name: 'Hintçe', nativeName: 'हिन्दी', flag: '🇮🇳', ttsVoiceCode: 'hi-IN' },
  { code: 'az', name: 'Azerbaycan Türkçesi', nativeName: 'Azərbaycan', flag: '🇦🇿', ttsVoiceCode: 'az-AZ' },
  { code: 'uk', name: 'Ukraynaca', nativeName: 'Українська', flag: '🇺🇦', ttsVoiceCode: 'uk-UA' },
  { code: 'pl', name: 'Lehçe', nativeName: 'Polski', flag: '🇵🇱', ttsVoiceCode: 'pl-PL' },
  { code: 'sv', name: 'İsveççe', nativeName: 'Svenska', flag: '🇸🇪', ttsVoiceCode: 'sv-SE' },
  { code: 'el', name: 'Yunanca', nativeName: 'Ελληνικά', flag: '🇬🇷', ttsVoiceCode: 'el-GR' },
];

export function getLanguageByCode(code: string): Language {
  const found = SUPPORTED_LANGUAGES.find((l) => l.code.toLowerCase() === code.toLowerCase());
  if (found) return found;
  return SUPPORTED_LANGUAGES[0];
}

export function getLanguageByName(name: string): Language {
  const normalized = name.toLowerCase().trim();
  const found = SUPPORTED_LANGUAGES.find(
    (l) =>
      l.name.toLowerCase() === normalized ||
      l.nativeName.toLowerCase() === normalized ||
      l.code.toLowerCase() === normalized
  );
  if (found) return found;
  return SUPPORTED_LANGUAGES[0];
}
