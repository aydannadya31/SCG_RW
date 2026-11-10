import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatDuration,
  formatSrtTimestamp,
  generateSrt,
  generateMarkdown,
  generateSyncCode,
  validateImportJson,
} from './formatters';
import { RecordingItem } from '../types';

test('formatDuration formats seconds properly', () => {
  assert.equal(formatDuration(0), '00:00');
  assert.equal(formatDuration(65), '01:05');
  assert.equal(formatDuration(3665), '01:01:05');
  assert.equal(formatDuration(-10), '00:00');
});

test('formatSrtTimestamp creates standard SRT timestamps', () => {
  assert.equal(formatSrtTimestamp(0), '00:00:00,000');
  assert.equal(formatSrtTimestamp(65.45), '00:01:05,450');
  assert.equal(formatSrtTimestamp(3600), '01:00:00,000');
});

test('generateSrt formats segmented subtitle', () => {
  const segments = [
    { id: '1', startSec: 0, endSec: 2.5, text: 'Merhaba dünya', speaker: 'Konuşmacı 1' },
    { id: '2', startSec: 2.5, endSec: 5.0, text: 'Bugün nasılsınız?', speaker: 'Konuşmacı 2' },
  ];
  const srt = generateSrt(segments);
  assert.match(srt, /1\n00:00:00,000 --> 00:00:02,500\n\[Konuşmacı 1\] Merhaba dünya/);
  assert.match(srt, /2\n00:00:02,500 --> 00:00:05,000\n\[Konuşmacı 2\] Bugün nasılsınız\?/);
});

test('generateMarkdown includes title, transcript, and translation', () => {
  const mockItem: RecordingItem = {
    id: 'test-1',
    title: 'Toplantı Kaydı',
    timestamp: 1700000000000,
    duration: 120,
    transcript: 'Proje teslim tarihi haftaya salı.',
    detectedLanguage: 'Türkçe',
    detectedLanguageCode: 'tr',
    category: 'Toplantı',
    tags: ['iş', 'proje'],
    isFavorite: true,
    cloudSynced: true,
    summary: 'Proje teslimi hakkında bilgilendirme.',
    actionPoints: ['Görevleri tamamla'],
    translation: {
      targetLang: 'en',
      targetLangName: 'İngilizce',
      translatedText: 'The project delivery date is next Tuesday.',
      translatedAt: 1700000010000,
    },
  };

  const md = generateMarkdown(mockItem);
  assert.match(md, /# Toplantı Kaydı/);
  assert.match(md, /Proje teslim tarihi haftaya salı/);
  assert.match(md, /The project delivery date is next Tuesday/);
  assert.match(md, /Aksiyon Maddeleri/);
});

test('generateSyncCode generates 9-char code with SC- prefix', () => {
  const code = generateSyncCode();
  assert.equal(code.startsWith('SC-'), true);
  assert.equal(code.length, 9);
});

test('validateImportJson validates valid and invalid JSON payloads', () => {
  const validJson = JSON.stringify([
    { id: '1', title: 'Test 1', timestamp: 12345, duration: 10, transcript: 'test', detectedLanguage: 'tr', detectedLanguageCode: 'tr', category: 'Genel', tags: [], isFavorite: false, cloudSynced: false },
  ]);
  const resValid = validateImportJson(validJson);
  assert.equal(resValid.valid, true);
  assert.equal(resValid.items?.length, 1);

  const resInvalid = validateImportJson('invalid json');
  assert.equal(resInvalid.valid, false);

  const resEmpty = validateImportJson('[]');
  assert.equal(resEmpty.valid, false);
});
