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
    <header className="absolute top-0 left-0 right-0 p-4 pointer-events-none z-20 flex flex-col gap-2">
      {/* Top Bar: Three Zones */}
      <div className="flex items-center justify-between w-full">
        {/* Zone 1: Score & Combo */}
        <div className="flex items-center gap-4 bg-slate-950/85 backdrop-blur-md px-4 py-2 rounded-xl border border-slate-800 text-slate-100 shadow-lg pointer-events-auto">
          <div className="flex flex-col">
            <span className="text-[11px] font-medium tracking-wide uppercase text-slate-400">Score</span>
            <span className="text-xl font-bold font-mono tracking-tight tabular-nums text-white">
              {stats.score.toLocaleString()}
            </span>
          </div>

          <div className="w-px h-7 bg-slate-800" />

          <div className="flex flex-col">
            <span className="text-[11px] font-medium tracking-wide uppercase text-slate-400">Combo</span>
            <div className="flex items-center gap-1 font-mono">
              <span className={`text-base font-bold tabular-nums ${stats.combo >= 10 ? 'text-amber-400' : stats.combo >= 4 ? 'text-emerald-400' : 'text-slate-300'}`}>
                {stats.combo > 0 ? `${stats.combo}x` : '—'}
              </span>
              {stats.combo >= 4 && (
                <Award className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              )}
            </div>
          </div>
        </div>

        {/* Zone 2: Level & Progress Target */}
        <div className="flex flex-col items-center bg-slate-950/85 backdrop-blur-md px-5 py-2 rounded-xl border border-slate-800 text-slate-100 shadow-lg min-w-[240px]">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
              Level {stats.level}
            </span>
            <span className="text-slate-600 text-xs">·</span>
            <span className="text-xs text-slate-300 capitalize">{levelConfig.weather}</span>
          </div>

          <div className="flex items-center justify-between w-full text-xs font-mono mb-1.5 text-slate-300">
            <span>CARS</span>
            <span className="tabular-nums font-semibold text-white">
              {stats.carsPassedInLevel} / {levelConfig.targetCars}
            </span>
          </div>

          {/* Clean progress bar */}
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all duration-300 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Zone 3: Lives & Controls */}
        <div className="flex items-center gap-3 bg-slate-950/85 backdrop-blur-md px-4 py-2 rounded-xl border border-slate-800 shadow-lg pointer-events-auto">
          {/* Hearts */}
          <div className="flex items-center gap-1.5 mr-2">
            {[1, 2, 3].map((heartIndex) => {
              const hasLife = heartIndex <= stats.lives;
              return (
                <Heart
                  key={heartIndex}
                  className={`w-5 h-5 transition-transform duration-200 ${
                    hasLife
                      ? 'fill-rose-500 text-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.6)]'
                      : 'text-slate-700'
                  }`}
                />
              );
            })}
          </div>

          <div className="w-px h-6 bg-slate-800" />

          {/* Quick Mute */}
          <button
            onClick={onToggleMute}
            className="p-1.5 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-slate-800"
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            aria-label="Toggle sound"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Pause */}
          <button
            onClick={onPause}
            className="p-1.5 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-slate-800"
            title="Pause Game (Esc)"
            aria-label="Pause game"
          >
            <Pause className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Active Event Banner (if any event is firing) */}
      {activeEvent && (
        <div className="self-center flex items-center gap-2.5 bg-rose-950/90 border border-rose-500/40 text-rose-200 px-4 py-1.5 rounded-lg backdrop-blur-md shadow-xl animate-bounce pointer-events-auto">
          <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
          <div className="flex items-center gap-2 text-xs font-semibold">
            <span className="text-white uppercase tracking-wide">{activeEvent.title}</span>
            <span className="text-rose-400/60 font-normal">|</span>
            <span className="text-rose-200 font-normal">{activeEvent.description}</span>
          </div>
        </div>
      )}
    </header>
  );
};
