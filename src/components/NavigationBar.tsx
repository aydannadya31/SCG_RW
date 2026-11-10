import React from 'react';
import { Mic, Languages, FolderSync, Cloud, Settings2 } from 'lucide-react';

export type NavTab = 'record' | 'translate' | 'history' | 'cloud' | 'settings';

interface NavigationBarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  recordingsCount: number;
  isCloudSynced: boolean;
}

export const NavigationBar: React.FC<NavigationBarProps> = ({
  activeTab,
  onTabChange,
  recordingsCount,
  isCloudSynced,
}) => {
  const tabs: Array<{ id: NavTab; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { id: 'record', label: 'Ses Kaydı', icon: Mic },
    { id: 'translate', label: 'Çevirmen', icon: Languages },
    { id: 'history', label: 'Kayıtlar', icon: FolderSync },
    { id: 'cloud', label: 'Bulut', icon: Cloud },
    { id: 'settings', label: 'Ayarlar', icon: Settings2 },
  ];

  return (
    <nav className="w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-t border-slate-200 dark:border-slate-800/80 px-2 py-1.5 flex items-center justify-around z-30 select-none">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all duration-200 cursor-pointer ${
              isActive
                ? 'text-indigo-600 dark:text-indigo-400 font-semibold scale-105'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            {/* Active Pill Glow */}
            {isActive && (
              <span className="absolute -top-1 w-6 h-1 bg-indigo-600 dark:bg-indigo-400 rounded-full" />
            )}

            <div className="relative">
              <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />

              {/* Badge for history count */}
              {tab.id === 'history' && recordingsCount > 0 && (
                <span className="absolute -top-1.5 -right-2.5 px-1 min-w-[15px] h-[15px] flex items-center justify-center text-[9px] font-bold text-white bg-indigo-600 rounded-full">
                  {recordingsCount > 99 ? '99+' : recordingsCount}
                </span>
              )}

              {/* Dot for cloud sync status */}
              {tab.id === 'cloud' && (
                <span
                  className={`absolute -top-1 -right-1 w-2 h-2 rounded-full ${
                    isCloudSynced ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'
                  }`}
                  title={isCloudSynced ? 'Buluta Yedeklendi' : 'Yedekleme Bekliyor'}
                />
              )}
            </div>

            <span className="text-[10px] mt-1 tracking-tight">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
