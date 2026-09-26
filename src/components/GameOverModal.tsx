import React from 'react';
import { GameStats } from '../game/types';
import { RotateCcw, Home, Trophy, AlertTriangle, Zap, Car } from 'lucide-react';

interface GameOverModalProps {
  stats: GameStats;
  onPlayAgain: () => void;
  onMainMenu: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  stats,
  onPlayAgain,
  onMainMenu,
}) => {
  const isNewRecord = stats.score >= stats.bestScore && stats.score > 0;

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md text-slate-100 overflow-y-auto">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-8 shadow-2xl flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-200 my-auto">
        {/* Crash Icon */}
        <div className="p-2.5 sm:p-3 bg-rose-950/70 border border-rose-500/40 rounded-2xl mb-3 sm:mb-4 text-rose-400">
          <AlertTriangle className="w-6 h-6 sm:w-8 sm:h-8" />
        </div>

        <h2 className="text-xl sm:text-3xl font-black tracking-tight text-white mb-1 uppercase">
          Game Over
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mb-4 sm:mb-6">
          The intersection suffered too many collisions.
        </p>

        {/* New Record Banner if applicable */}
        {isNewRecord && (
          <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-400 bg-amber-950/60 border border-amber-500/40 px-3 py-1.5 rounded-lg mb-3 sm:mb-4">
            <Trophy className="w-4 h-4" />
            <span>NEW ALL-TIME RECORD!</span>
          </div>
        )}

        {/* Stats Summary Matrix */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3 w-full mb-4 sm:mb-6 text-left">
          <div className="p-2.5 sm:p-3 bg-slate-950/60 border border-slate-800 rounded-xl">
            <span className="text-[10px] sm:text-[11px] font-medium uppercase tracking-wider text-slate-400 block mb-0.5 sm:mb-1">
              Final Score
            </span>
            <span className="text-xl sm:text-2xl font-bold font-mono text-white tabular-nums">
              {stats.score.toLocaleString()}
            </span>
          </div>

          <div className="p-2.5 sm:p-3 bg-slate-950/60 border border-slate-800 rounded-xl">
            <span className="text-[10px] sm:text-[11px] font-medium uppercase tracking-wider text-slate-400 block mb-0.5 sm:mb-1">
              Level Reached
            </span>
            <span className="text-xl sm:text-2xl font-bold font-mono text-emerald-400 tabular-nums">
              Level {stats.level}
            </span>
          </div>

          <div className="p-2.5 sm:p-3 bg-slate-950/60 border border-slate-800 rounded-xl">
            <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-slate-400 mb-0.5 sm:mb-1">
              <span className="font-medium uppercase tracking-wider">Safe Cars</span>
              <Car className="w-3.5 h-3.5 text-slate-500" />
            </div>
            <span className="text-base sm:text-lg font-bold font-mono text-slate-200 tabular-nums">
              {stats.totalCarsPassed}
            </span>
          </div>

          <div className="p-2.5 sm:p-3 bg-slate-950/60 border border-slate-800 rounded-xl">
            <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-slate-400 mb-0.5 sm:mb-1">
              <span className="font-medium uppercase tracking-wider">Max Combo</span>
              <Zap className="w-3.5 h-3.5 text-slate-500" />
            </div>
            <span className="text-base sm:text-lg font-bold font-mono text-amber-400 tabular-nums">
              {stats.maxCombo}x
            </span>
          </div>
        </div>

        {/* Best Records Footer */}
        <div className="flex items-center justify-between w-full px-3 sm:px-4 py-2 bg-slate-950/40 rounded-xl border border-slate-800/80 text-[11px] sm:text-xs text-slate-400 mb-4 sm:mb-6">
          <span>All-Time Best: <strong className="text-white font-mono">{stats.bestScore.toLocaleString()} pts</strong></span>
          <span className="text-slate-600">·</span>
          <span>Best: <strong className="text-emerald-400 font-mono">Lvl {stats.highestLevel}</strong></span>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 w-full">
          <button
            onClick={onPlayAgain}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-500 active:scale-95 transition-all shadow-lg text-sm touch-manipulation cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Play Again</span>
          </button>

          <button
            onClick={onMainMenu}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white active:scale-95 transition-colors text-sm touch-manipulation cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>Main Menu</span>
          </button>
        </div>
      </div>
    </div>
  );
};
