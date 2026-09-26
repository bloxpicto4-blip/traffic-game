import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Smartphone, Download, CheckCircle2, X } from 'lucide-react';

export const PWAInstallModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [installing, setInstalling] = useState(false);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    setInstalling(true);
    await install();
    setInstalling(false);
    onClose();
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/85 backdrop-blur-md text-slate-100 animate-in fade-in duration-200">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
          <div className="flex items-center gap-2 text-white font-bold text-base">
            <Smartphone className="w-5 h-5 text-emerald-400" />
            <span>Install on Android / Mobile</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isInstalled ? (
          <div className="p-4 bg-emerald-950/50 border border-emerald-500/30 rounded-xl text-center flex flex-col items-center gap-2 my-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            <p className="text-sm font-semibold text-emerald-300">App Already Installed!</p>
            <p className="text-xs text-slate-400">
              Crossroad Chaos is running as a standalone mobile application.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4 text-xs text-slate-300 leading-relaxed">
            <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl flex items-start gap-3">
              <div className="p-2 bg-emerald-950 border border-emerald-500/40 rounded-lg text-emerald-400 shrink-0">
                <Download className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-white text-sm mb-0.5">Android WebAPK Installation</p>
                <p className="text-slate-400">
                  Android Chrome / Edge generates and packages a native <strong>WebAPK</strong> file automatically, giving you:
                </p>
                <ul className="list-disc list-inside mt-1.5 space-y-0.5 text-slate-300">
                  <li>Full-screen native app launch (no browser address bar)</li>
                  <li>Offline gameplay with cached assets</li>
                  <li>Native home screen & app drawer launcher icon</li>
                </ul>
              </div>
            </div>

            {isInstallable ? (
              <button
                onClick={handleInstallClick}
                disabled={installing}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-white bg-emerald-600 hover:bg-emerald-500 active:scale-95 transition-all shadow-lg text-sm cursor-pointer disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                <span>{installing ? 'Installing...' : 'Install Native WebAPK Now'}</span>
              </button>
            ) : isIOS ? (
              <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl text-slate-300">
                <p className="font-semibold text-white mb-1">To install on iOS Safari:</p>
                <ol className="list-decimal list-inside space-y-1 text-slate-400">
                  <li>Tap the <strong>Share</strong> button in Safari's toolbar.</li>
                  <li>Scroll down and tap <strong>Add to Home Screen</strong>.</li>
                </ol>
              </div>
            ) : (
              <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl text-slate-300">
                <p className="font-semibold text-white mb-1">How to Install on Android:</p>
                <ol className="list-decimal list-inside space-y-1 text-slate-400">
                  <li>Open this game in <strong>Google Chrome</strong> on your Android device.</li>
                  <li>Tap the <strong>⋮ (Menu)</strong> button in the top right.</li>
                  <li>Select <strong>Install app</strong> or <strong>Add to Home screen</strong>.</li>
                  <li>Android will generate and install the native WebAPK package.</li>
                </ol>
              </div>
            )}
          </div>
        )}

        <button
          onClick={onClose}
          className="mt-4 w-full py-2.5 rounded-xl font-semibold text-white bg-slate-800 hover:bg-slate-700 transition-colors text-xs"
        >
          Close
        </button>
      </div>
    </div>
  );
};
