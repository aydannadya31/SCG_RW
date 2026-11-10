import React, { useState, useEffect } from 'react';
import { PhoneFrame } from './components/PhoneFrame';
import { NavigationBar, NavTab } from './components/NavigationBar';
import { RecordingView } from './components/RecordingView';
import { TranslatorView } from './components/TranslatorView';
import { HistoryView } from './components/HistoryView';
import { CloudBackupView } from './components/CloudBackupView';
import { SettingsRoadmapView } from './components/SettingsRoadmapView';
import { RecordingItem, AppSettings } from './types';
import {
  getStoredRecordings,
  saveRecording,
  deleteRecording,
  toggleFavorite,
  getAppSettings,
  saveAppSettings,
  saveAllRecordings,
} from './utils/storage';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('record');
  const [recordings, setRecordings] = useState<RecordingItem[]>([]);
  const [settings, setSettings] = useState<AppSettings>(getAppSettings);

  // Cross-view bridge: pass text directly into translator view
  const [translatorInitialData, setTranslatorInitialData] = useState<{
    text: string;
    sourceLangCode: string;
  }>({
    text: '',
    sourceLangCode: 'tr',
  });

  // Load recordings on mount
  useEffect(() => {
    const loaded = getStoredRecordings();
    setRecordings(loaded);
  }, []);

  // Sync theme with HTML class
  useEffect(() => {
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    saveAppSettings(settings);
  }, [settings]);

  // Handlers
  const handleSaveRecording = (item: RecordingItem) => {
    const updated = saveRecording(item);
    setRecordings(updated);
  };

  const handleUpdateRecordings = (items: RecordingItem[]) => {
    saveAllRecordings(items);
    setRecordings(items);
  };

  const handleDeleteRecording = (id: string) => {
    const updated = deleteRecording(id);
    setRecordings(updated);
  };

  const handleToggleFavorite = (id: string) => {
    const updated = toggleFavorite(id);
    setRecordings(updated);
  };

  const handleUpdateSettings = (partial: Partial<AppSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...partial };
      saveAppSettings(next);
      return next;
    });
  };

  const handleOpenTranslatorWithText = (text: string, sourceLangCode: string) => {
    setTranslatorInitialData({ text, sourceLangCode });
    setActiveTab('translate');
  };

  const isAllCloudSynced = recordings.length > 0 && recordings.every((r) => r.cloudSynced);

  return (
    <PhoneFrame
      isPhoneMode={settings.phoneFrameMode}
      onTogglePhoneMode={() =>
        handleUpdateSettings({ phoneFrameMode: !settings.phoneFrameMode })
      }
      theme={settings.theme}
      onToggleTheme={() =>
        handleUpdateSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' })
      }
    >
      <div className="flex-1 w-full h-full flex flex-col justify-between overflow-hidden relative">
        {/* Active Tab Screen */}
        <div className="flex-1 w-full h-full overflow-hidden flex flex-col">
          {activeTab === 'record' && (
            <RecordingView
              onSaveRecording={handleSaveRecording}
              onOpenTranslatorWithText={handleOpenTranslatorWithText}
              defaultTargetLang={settings.defaultTargetLang}
            />
          )}

          {activeTab === 'translate' && (
            <TranslatorView
              initialText={translatorInitialData.text}
              initialSourceLang={translatorInitialData.sourceLangCode}
              defaultTargetLang={settings.defaultTargetLang}
              onSaveToHistory={handleSaveRecording}
            />
          )}

          {activeTab === 'history' && (
            <HistoryView
              recordings={recordings}
              onToggleFavorite={handleToggleFavorite}
              onDeleteRecording={handleDeleteRecording}
              onOpenTranslator={handleOpenTranslatorWithText}
            />
          )}

          {activeTab === 'cloud' && (
            <CloudBackupView
              recordings={recordings}
              onUpdateRecordings={handleUpdateRecordings}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsRoadmapView
              settings={settings}
              onUpdateSettings={handleUpdateSettings}
              isPhoneMode={settings.phoneFrameMode}
              onTogglePhoneMode={() =>
                handleUpdateSettings({ phoneFrameMode: !settings.phoneFrameMode })
              }
            />
          )}
        </div>

        {/* Bottom Navigation Menu */}
        <NavigationBar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          recordingsCount={recordings.length}
          isCloudSynced={isAllCloudSynced}
        />
      </div>
    </PhoneFrame>
  );
}
