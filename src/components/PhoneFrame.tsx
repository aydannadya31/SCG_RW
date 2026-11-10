import React, { ReactNode } from 'react';
import { Wifi, Battery, Smartphone, Monitor, Sun, Moon } from 'lucide-react';

interface PhoneFrameProps {
  children: ReactNode;
  isPhoneMode: boolean;
  onTogglePhoneMode: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export const PhoneFrame: React.FC<PhoneFrameProps> = ({
  children,
  isPhoneMode,
  onTogglePhoneMode,
  theme,
  onToggleTheme,
}) => {
  const currentTime = new Date().toLocaleTimeString('tr-TR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div
      className={`min-h-screen w-full transition-colors duration-300 flex flex-col items-center justify-start ${
        theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-800'
      }`}
    >
      {/* Top Utility Bar for Switching Frame & Dark/Light Mode */}
      <header className="w-full max-w-5xl px-4 py-2.5 flex items-center justify-between border-b border-slate-700/20 text-xs z-50">
        <div className="flex items-center gap-2 font-medium">
          <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-semibold text-slate-700 dark:text-slate-300">SesliCevir Pro</span>
          <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 font-mono">
            v2.4 • Gemini AI
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Toggle Phone Frame vs Full View */}
          <button
            onClick={onTogglePhoneMode}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-800 hover:bg-slate-200/60 dark:hover:bg-slate-900 transition-colors cursor-pointer"
            title="Telefon / Geniş Ekran Görünümü Değiştir"
          >
            {isPhoneMode ? (
              <>
                <Monitor className="w-3.5 h-3.5 text-indigo-500" />
                <span className="hidden sm:inline">Geniş Görünüm</span>
              </>
            ) : (
              <>
                <Smartphone className="w-3.5 h-3.5 text-indigo-500" />
                <span className="hidden sm:inline">Telefon Çerçevesi</span>
              </>
            )}
          </button>

          {/* Toggle Dark / Light Theme */}
          <button
            onClick={onToggleTheme}
            className="p-1.5 rounded-lg border border-slate-300 dark:border-slate-800 hover:bg-slate-200/60 dark:hover:bg-slate-900 transition-colors cursor-pointer"
            aria-label="Tema Değiştir"
            title="Karanlık / Aydınlık Mod"
          >
            {theme === 'dark' ? (
              <Sun className="w-3.5 h-3.5 text-amber-400" />
            ) : (
              <Moon className="w-3.5 h-3.5 text-slate-700" />
            )}
          </button>
        </div>
      </header>

      {/* Main Content: Phone Frame or Responsive Container */}
      <main className="w-full flex-1 flex items-center justify-center p-0 sm:p-4">
        {isPhoneMode ? (
          // Realistic Phone Frame Container
          <div className="relative w-full max-w-[412px] h-[870px] max-h-[92vh] rounded-[48px] p-3 bg-slate-900 shadow-2xl shadow-indigo-950/40 border-[4px] border-slate-800 ring-1 ring-slate-700/50 flex flex-col overflow-hidden">
            {/* Phone Speaker & Dynamic Island */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-full z-40 flex items-center justify-between px-3">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-900 ring-1 ring-slate-800" />
              <div className="w-2 h-2 rounded-full bg-emerald-500/80 animate-pulse" />
            </div>

            {/* Inner Phone Screen */}
            <div
              className={`w-full h-full rounded-[38px] overflow-hidden flex flex-col relative ${
                theme === 'dark' ? 'bg-slate-950' : 'bg-slate-50'
              }`}
            >
              {/* Phone Status Bar */}
              <div className="w-full h-9 pt-1 px-7 flex items-center justify-between text-[11px] font-semibold tracking-tight text-slate-500 dark:text-slate-400 select-none z-30">
                <span>{currentTime}</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold">5G</span>
                  <Wifi className="w-3 h-3" />
                  <Battery className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Phone Screen Inner App Body */}
              <div className="flex-1 w-full overflow-hidden flex flex-col relative">{children}</div>

              {/* iPhone style home indicator bar */}
              <div className="w-full h-4 flex items-center justify-center pointer-events-none pb-1">
                <div className="w-32 h-1 rounded-full bg-slate-400/40 dark:bg-slate-600/60" />
              </div>
            </div>
          </div>
        ) : (
          // Responsive Modern App Container (scales cleanly from mobile to desktop)
          <div
            className={`w-full max-w-3xl h-[860px] max-h-[90vh] sm:rounded-3xl shadow-xl overflow-hidden flex flex-col border border-slate-200/80 dark:border-slate-800/80 ${
              theme === 'dark' ? 'bg-slate-950' : 'bg-slate-50'
            }`}
          >
            {children}
          </div>
        )}
      </main>
    </div>
  );
};
