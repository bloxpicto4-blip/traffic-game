import React from 'react';
import { Play, RotateCcw, Home, Settings } from 'lucide-react';

interface PauseModalProps {
  onResume: () => void;
  onRestart: () => void;
  onOpenSettings: () => void;
  onMainMenu: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  onResume,
  onRestart,
  onOpenSettings,
  onMainMenu,
}) => {
  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md text-slate-100 overflow-y-auto">
      <div className="max-w-xs w-full bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-2xl flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-150 my-auto">
        <h2 className="text-xl font-black uppercase tracking-tight text-white mb-1">
          Game Paused
        </h2>
        <p className="text-xs text-slate-400 mb-5 sm:mb-6">
          Simulation frozen. Choose an action:
        </p>

        <div className="flex flex-col gap-2.5 w-full">
          <button
            onClick={onResume}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-500 active:scale-95 transition-all text-xs sm:text-sm shadow-lg touch-manipulation cursor-pointer"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Resume Game</span>
          </button>

          <button
            onClick={onRestart}
            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 active:scale-95 transition-colors text-xs sm:text-sm touch-manipulation cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-amber-400" />
            <span>Restart from Level 1</span>
          </button>

          <button
            onClick={onOpenSettings}
            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 active:scale-95 transition-colors text-xs sm:text-sm touch-manipulation cursor-pointer"
          >
            <Settings className="w-4 h-4 text-sky-400" />
            <span>Settings</span>
          </button>

          <button
            onClick={onMainMenu}
            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-medium text-slate-400 hover:text-white bg-transparent hover:bg-slate-800 active:scale-95 transition-colors text-xs mt-1 touch-manipulation cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>Quit to Main Menu</span>
          </button>
        </div>
      </div>
    </div>
  );
};
