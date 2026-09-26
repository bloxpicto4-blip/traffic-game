import React from 'react';
import { GameSettings } from '../game/types';
import { X, Volume2, VolumeX, Music, Vibrate, Keyboard } from 'lucide-react';

interface SettingsModalProps {
  settings: GameSettings;
  onUpdateSettings: (newSettings: GameSettings) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onUpdateSettings,
  onClose,
}) => {
  const update = (partial: Partial<GameSettings>) => {
    onUpdateSettings({ ...settings, ...partial });
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md text-slate-100">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
          <h2 className="text-lg font-bold text-white tracking-tight">Audio & Controls</h2>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            aria-label="Close settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col gap-5 text-sm">
          {/* Music Volume & Mute */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-300 font-medium">
                <Music className="w-4 h-4 text-emerald-400" />
                <span>Background Music</span>
              </div>
              <button
                onClick={() => update({ musicMuted: !settings.musicMuted })}
                className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                  settings.musicMuted
                    ? 'text-rose-400 bg-rose-950/60 border border-rose-800/40'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {settings.musicMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                <span>{settings.musicMuted ? 'Muted' : 'Mute'}</span>
              </button>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.musicMuted ? 0 : settings.musicVolume}
              disabled={settings.musicMuted}
              onChange={(e) => update({ musicVolume: parseFloat(e.target.value) })}
              className="w-full accent-emerald-500 cursor-pointer disabled:opacity-30"
            />
          </div>

          {/* Sound FX Volume & Mute */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-300 font-medium">
                <Volume2 className="w-4 h-4 text-amber-400" />
                <span>Sound Effects (Crashes, Sirens)</span>
              </div>
              <button
                onClick={() => update({ sfxMuted: !settings.sfxMuted })}
                className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                  settings.sfxMuted
                    ? 'text-rose-400 bg-rose-950/60 border border-rose-800/40'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {settings.sfxMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                <span>{settings.sfxMuted ? 'Muted' : 'Mute'}</span>
              </button>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.sfxMuted ? 0 : settings.sfxVolume}
              disabled={settings.sfxMuted}
              onChange={(e) => update({ sfxVolume: parseFloat(e.target.value) })}
              className="w-full accent-amber-500 cursor-pointer disabled:opacity-30"
            />
          </div>

          {/* Screen Shake */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-800">
            <div className="flex items-center gap-2 text-slate-300 font-medium">
              <Vibrate className="w-4 h-4 text-sky-400" />
              <span>Crash Screen Shake</span>
            </div>
            <button
              onClick={() => update({ screenShake: !settings.screenShake })}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                settings.screenShake
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {settings.screenShake ? 'Enabled' : 'Disabled'}
            </button>
          </div>

          {/* Controls Quick Reference */}
          <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl mt-1">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 mb-2">
              <Keyboard className="w-3.5 h-3.5 text-slate-400" />
              <span>Keyboard Shortcuts</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400">
              <div><kbd className="px-1.5 py-0.5 bg-slate-800 rounded font-mono text-slate-200">Space</kbd> Toggle Corridor</div>
              <div><kbd className="px-1.5 py-0.5 bg-slate-800 rounded font-mono text-slate-200">1 / N</kbd> North-South Green</div>
              <div><kbd className="px-1.5 py-0.5 bg-slate-800 rounded font-mono text-slate-200">2 / E</kbd> East-West Green</div>
              <div><kbd className="px-1.5 py-0.5 bg-slate-800 rounded font-mono text-slate-200">3 / R</kbd> All Red Hold</div>
              <div><kbd className="px-1.5 py-0.5 bg-slate-800 rounded font-mono text-slate-200">Esc / P</kbd> Pause Game</div>
              <div><kbd className="px-1.5 py-0.5 bg-slate-800 rounded font-mono text-slate-200">M</kbd> Quick Mute Audio</div>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full py-2.5 rounded-xl font-semibold text-white bg-slate-800 hover:bg-slate-700 transition-colors text-xs"
        >
          Done
        </button>
      </div>
    </div>
  );
};
