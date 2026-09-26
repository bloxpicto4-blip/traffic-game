import React from 'react';
import { ActiveEvent, GameStats, LevelConfig } from '../game/types';
import { Heart, Volume2, VolumeX, Pause, ShieldAlert, Award } from 'lucide-react';

interface GameHUDProps {
  stats: GameStats;
  levelConfig: LevelConfig;
  activeEvent: ActiveEvent | null;
  isMuted: boolean;
  onToggleMute: () => void;
  onPause: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  stats,
  levelConfig,
  activeEvent,
  isMuted,
  onToggleMute,
  onPause,
}) => {
  const progressPercent = Math.min(100, Math.round((stats.carsPassedInLevel / levelConfig.targetCars) * 100));

  return (
    <header className="absolute top-0 left-0 right-0 p-2 sm:p-4 pointer-events-none z-20 flex flex-col gap-1.5 sm:gap-2 pt-[max(0.5rem,env(safe-area-inset-top))]">
      {/* Top Bar: Three Zones */}
      <div className="flex items-center justify-between w-full gap-1.5 sm:gap-4 max-w-5xl mx-auto">
        {/* Zone 1: Score & Combo */}
        <div className="flex items-center gap-2 sm:gap-4 bg-slate-950/90 backdrop-blur-md px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-xl border border-slate-800 text-slate-100 shadow-lg pointer-events-auto">
          <div className="flex flex-col">
            <span className="text-[9px] sm:text-[11px] font-medium tracking-wide uppercase text-slate-400">Score</span>
            <span className="text-base sm:text-xl font-bold font-mono tracking-tight tabular-nums text-white">
              {stats.score.toLocaleString()}
            </span>
          </div>

          <div className="w-px h-5 sm:h-7 bg-slate-800" />

          <div className="flex flex-col">
            <span className="text-[9px] sm:text-[11px] font-medium tracking-wide uppercase text-slate-400">Combo</span>
            <div className="flex items-center gap-1 font-mono">
              <span className={`text-xs sm:text-base font-bold tabular-nums ${stats.combo >= 10 ? 'text-amber-400' : stats.combo >= 4 ? 'text-emerald-400' : 'text-slate-300'}`}>
                {stats.combo > 0 ? `${stats.combo}x` : '—'}
              </span>
              {stats.combo >= 4 && (
                <Award className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400 animate-pulse" />
              )}
            </div>
          </div>
        </div>

        {/* Zone 2: Level & Progress Target */}
        <div className="flex flex-col items-center bg-slate-950/90 backdrop-blur-md px-3 sm:px-5 py-1.5 sm:py-2 rounded-xl border border-slate-800 text-slate-100 shadow-lg min-w-[130px] sm:min-w-[220px]">
          <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1">
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-emerald-400">
              Lvl {stats.level}
            </span>
            <span className="text-slate-600 text-[10px] sm:text-xs">·</span>
            <span className="text-[10px] sm:text-xs text-slate-300 capitalize truncate max-w-[65px] sm:max-w-none">{levelConfig.weather}</span>
          </div>

          <div className="flex items-center justify-between w-full text-[10px] sm:text-xs font-mono mb-1 text-slate-300">
            <span className="hidden sm:inline">CARS</span>
            <span className="tabular-nums font-semibold text-white mx-auto sm:mx-0">
              {stats.carsPassedInLevel} / {levelConfig.targetCars}
            </span>
          </div>

          {/* Clean progress bar */}
          <div className="w-full h-1 sm:h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all duration-300 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Zone 3: Lives & Controls */}
        <div className="flex items-center gap-1.5 sm:gap-3 bg-slate-950/90 backdrop-blur-md px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-xl border border-slate-800 shadow-lg pointer-events-auto">
          {/* Hearts */}
          <div className="flex items-center gap-1 sm:gap-1.5">
            {[1, 2, 3].map((heartIndex) => {
              const hasLife = heartIndex <= stats.lives;
              return (
                <Heart
                  key={heartIndex}
                  className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-200 ${
                    hasLife
                      ? 'fill-rose-500 text-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.6)]'
                      : 'text-slate-700'
                  }`}
                />
              );
            })}
          </div>

          <div className="w-px h-5 sm:h-6 bg-slate-800" />

          {/* Quick Mute */}
          <button
            onClick={onToggleMute}
            className="p-1.5 sm:p-2 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-slate-800 active:scale-95 touch-manipulation cursor-pointer"
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            aria-label="Toggle sound"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Pause */}
          <button
            onClick={onPause}
            className="p-1.5 sm:p-2 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-slate-800 active:scale-95 touch-manipulation cursor-pointer"
            title="Pause Game (Esc)"
            aria-label="Pause game"
          >
            <Pause className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Active Event Banner (if any event is firing) */}
      {activeEvent && (
        <div className="self-center flex items-center gap-2 bg-rose-950/90 border border-rose-500/40 text-rose-200 px-3 sm:px-4 py-1.5 rounded-lg backdrop-blur-md shadow-xl animate-bounce pointer-events-auto max-w-[94vw]">
          <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
          <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-semibold overflow-hidden">
            <span className="text-white uppercase tracking-wide truncate">{activeEvent.title}</span>
            <span className="text-rose-400/60 font-normal hidden sm:inline">|</span>
            <span className="text-rose-200 font-normal truncate hidden sm:inline">{activeEvent.description}</span>
          </div>
        </div>
      )}
    </header>
  );
};
