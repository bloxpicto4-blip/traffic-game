import React from 'react';
import { Play, Settings, Trophy, ShieldAlert, Zap, Compass, Car } from 'lucide-react';

interface MainMenuProps {
  bestScore: number;
  highestLevel: number;
  onPlay: () => void;
  onOpenSettings: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  bestScore,
  highestLevel,
  onPlay,
  onOpenSettings,
}) => {
  return (
    <div className="absolute inset-0 z-30 flex flex-col items-center justify-center p-6 bg-slate-950/90 backdrop-blur-md text-slate-100 overflow-y-auto">
      <div className="max-w-xl w-full flex flex-col items-center text-center my-auto">
        {/* Traffic Light Visual Icon */}
        <div className="flex items-center gap-1.5 p-2 bg-slate-900 border border-slate-800 rounded-xl mb-4 shadow-xl">
          <div className="w-3.5 h-3.5 rounded-full bg-rose-500 shadow-[0_0_10px_#ef4444]" />
          <div className="w-3.5 h-3.5 rounded-full bg-amber-400 shadow-[0_0_10px_#fbbf24]" />
          <div className="w-3.5 h-3.5 rounded-full bg-emerald-400 shadow-[0_0_10px_#34d399]" />
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-2">
          Crossroad Chaos
        </h1>
        <p className="text-sm sm:text-base text-slate-400 mb-6 max-w-md">
          Master traffic lights at a bustling city intersection. Prevent pileups, give priority to emergency vehicles, and survive endless escalating levels.
        </p>

        {/* Lifetime Record Stats Bar */}
        <div className="flex items-center justify-center gap-6 sm:gap-10 w-full max-w-sm py-3 px-5 mb-8 bg-slate-900/90 border border-slate-800 rounded-xl">
          <div className="flex flex-col items-center">
            <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              Best Score
            </span>
            <span className="text-xl font-bold font-mono text-white tabular-nums">
              {bestScore.toLocaleString()}
            </span>
          </div>

          <div className="w-px h-8 bg-slate-800" />

          <div className="flex flex-col items-center">
            <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
              Highest Level
            </span>
            <span className="text-xl font-bold font-mono text-emerald-400 tabular-nums">
              Level {highestLevel}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-xs mb-8">
          <button
            onClick={onPlay}
            className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-semibold text-white bg-emerald-600 hover:bg-emerald-500 active:scale-95 transition-all shadow-lg shadow-emerald-950/40 text-sm cursor-pointer"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Start Game</span>
            <span className="text-[10px] bg-emerald-700/80 px-1.5 py-0.5 rounded font-mono uppercase tracking-wider ml-1">
              Enter / Space
            </span>
          </button>

          <button
            onClick={onOpenSettings}
            className="w-full sm:w-auto flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium text-slate-300 bg-slate-900 hover:bg-slate-800 hover:text-white border border-slate-800 transition-colors text-sm"
            title="Audio & Gameplay Settings"
          >
            <Settings className="w-4 h-4" />
            <span className="sm:hidden">Settings</span>
          </button>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left w-full text-xs">
          <div className="p-3 bg-slate-900/60 border border-slate-800/80 rounded-xl">
            <div className="flex items-center gap-2 text-slate-200 font-semibold mb-1">
              <Car className="w-4 h-4 text-emerald-400" />
              <span>Smart Signals</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Toggle corridors with <kbd className="px-1 py-0.5 bg-slate-800 rounded font-mono text-slate-300">Space</kbd> or click lights. 1.4s yellow intervals ensure safe stopping.
            </p>
          </div>

          <div className="p-3 bg-slate-900/60 border border-slate-800/80 rounded-xl">
            <div className="flex items-center gap-2 text-slate-200 font-semibold mb-1">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <span>Emergency Units</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Ambulances, fire trucks, and police units require immediate clearance. Watch the radar alerts!
            </p>
          </div>

          <div className="p-3 bg-slate-900/60 border border-slate-800/80 rounded-xl">
            <div className="flex items-center gap-2 text-slate-200 font-semibold mb-1">
              <Compass className="w-4 h-4 text-amber-400" />
              <span>Endless Scaling</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              No final level. Progress through night shifts, rain storms, road work, and escalating rush hours.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
