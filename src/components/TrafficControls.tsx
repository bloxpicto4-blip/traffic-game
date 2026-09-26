import React from 'react';
import { Axis } from '../game/engine';
import { TrafficLightGroup, Direction } from '../game/types';
import { ArrowUpDown, ArrowLeftRight, OctagonAlert, FastForward } from 'lucide-react';

interface TrafficControlsProps {
  activeAxis: Axis;
  targetAxis: Axis;
  transitionTimer: number;
  lights: Record<Direction, TrafficLightGroup>;
  onRequestAxis: (axis: Axis) => void;
  onToggleAxis: () => void;
  onRequestAllRed: () => void;
  gameSpeed: number;
  onToggleGameSpeed: () => void;
}

export const TrafficControls: React.FC<TrafficControlsProps> = ({
  activeAxis,
  targetAxis,
  transitionTimer,
  lights,
  onRequestAxis,
  onToggleAxis,
  onRequestAllRed,
  gameSpeed,
  onToggleGameSpeed,
}) => {
  const isTransitioning = transitionTimer > 0;
  const isNSGreen = lights.N.color === 'GREEN';
  const isEWGreen = lights.E.color === 'GREEN';
  const isNSYellow = lights.N.color === 'YELLOW';
  const isEWYellow = lights.E.color === 'YELLOW';

  return (
    <footer className="absolute bottom-2 sm:bottom-4 left-0 right-0 px-2 sm:px-4 z-20 flex justify-center pointer-events-none pb-[max(0.25rem,env(safe-area-inset-bottom))]">
      <div className="flex items-center justify-between sm:justify-center gap-1.5 sm:gap-2 bg-slate-950/95 backdrop-blur-md p-1.5 sm:p-2 rounded-2xl border border-slate-800 shadow-2xl pointer-events-auto max-w-full w-full sm:w-auto">
        {/* Master Toggle Button */}
        <button
          onClick={onToggleAxis}
          className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 sm:gap-2.5 px-3 sm:px-5 py-2.5 sm:py-3 rounded-xl font-bold text-xs sm:text-sm transition-all duration-150 shadow-md touch-manipulation active:scale-95 cursor-pointer ${
            isTransitioning
              ? 'bg-amber-600 text-amber-50 ring-2 ring-amber-400/50 animate-pulse'
              : 'bg-emerald-600 hover:bg-emerald-500 text-white'
          }`}
          title="Toggle Traffic Corridor (Spacebar or Tap)"
        >
          {activeAxis === 'NS' ? (
            <>
              <ArrowLeftRight className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
              <span className="truncate">Switch E·W</span>
            </>
          ) : (
            <>
              <ArrowUpDown className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
              <span className="truncate">Switch N·S</span>
            </>
          )}
          <span className="hidden sm:inline-block text-[10px] bg-black/25 px-1.5 py-0.5 rounded font-mono uppercase tracking-wider">
            Space
          </span>
        </button>

        {/* North-South Corridor Status & Direct Trigger */}
        <button
          onClick={() => onRequestAxis('NS')}
          className={`flex items-center justify-center gap-1.5 px-2.5 sm:px-4 py-2 sm:py-2.5 rounded-xl border text-[11px] sm:text-xs font-semibold transition-all touch-manipulation active:scale-95 cursor-pointer shrink-0 ${
            isNSGreen
              ? 'bg-emerald-950/80 border-emerald-500/80 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.25)]'
              : isNSYellow
              ? 'bg-amber-950/80 border-amber-500/80 text-amber-300 animate-pulse'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
          title="North-South Green"
        >
          <span
            className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full shrink-0 ${
              isNSGreen
                ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]'
                : isNSYellow
                ? 'bg-amber-400 shadow-[0_0_8px_#fbbf24]'
                : 'bg-rose-500/80'
            }`}
          />
          <span className="font-mono">N·S</span>
          <span className="hidden md:inline text-[10px] font-medium">
            {isNSGreen ? 'GREEN' : isNSYellow ? 'WAIT' : 'RED'}
          </span>
          <span className="hidden lg:inline text-[10px] text-slate-500 font-mono bg-slate-800/80 px-1 py-0.5 rounded">
            1
          </span>
        </button>

        {/* East-West Corridor Status & Direct Trigger */}
        <button
          onClick={() => onRequestAxis('EW')}
          className={`flex items-center justify-center gap-1.5 px-2.5 sm:px-4 py-2 sm:py-2.5 rounded-xl border text-[11px] sm:text-xs font-semibold transition-all touch-manipulation active:scale-95 cursor-pointer shrink-0 ${
            isEWGreen
              ? 'bg-emerald-950/80 border-emerald-500/80 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.25)]'
              : isEWYellow
              ? 'bg-amber-950/80 border-amber-500/80 text-amber-300 animate-pulse'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
          title="East-West Green"
        >
          <span
            className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full shrink-0 ${
              isEWGreen
                ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]'
                : isEWYellow
                ? 'bg-amber-400 shadow-[0_0_8px_#fbbf24]'
                : 'bg-rose-500/80'
            }`}
          />
          <span className="font-mono">E·W</span>
          <span className="hidden md:inline text-[10px] font-medium">
            {isEWGreen ? 'GREEN' : isEWYellow ? 'WAIT' : 'RED'}
          </span>
          <span className="hidden lg:inline text-[10px] text-slate-500 font-mono bg-slate-800/80 px-1 py-0.5 rounded">
            2
          </span>
        </button>

        {/* All Red Clearance Hold */}
        <button
          onClick={onRequestAllRed}
          className={`flex items-center justify-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-2 sm:py-2.5 rounded-xl border text-[11px] sm:text-xs font-semibold transition-all touch-manipulation active:scale-95 cursor-pointer shrink-0 ${
            activeAxis === 'NONE' && !isTransitioning
              ? 'bg-rose-950/80 border-rose-500/80 text-rose-300 shadow-[0_0_12px_rgba(239,68,68,0.25)]'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-rose-300'
          }`}
          title="All Red / Clear Intersection"
        >
          <OctagonAlert className="w-3.5 h-3.5 text-rose-400 shrink-0" />
          <span className="hidden sm:inline">All Red</span>
          <span className="sm:hidden text-[10px]">Red</span>
        </button>

        {/* Game Speed Multiplier */}
        <button
          onClick={onToggleGameSpeed}
          className={`flex items-center justify-center gap-1 px-2 sm:px-2.5 py-2 sm:py-2.5 rounded-xl border text-[11px] sm:text-xs font-mono font-medium transition-all touch-manipulation active:scale-95 cursor-pointer shrink-0 ${
            gameSpeed > 1
              ? 'bg-amber-950/60 border-amber-600/50 text-amber-300'
              : 'bg-slate-900 border-slate-800 text-slate-400'
          }`}
          title="Toggle Simulation Speed (1x / 1.5x)"
        >
          <FastForward className="w-3.5 h-3.5" />
          <span>{gameSpeed}x</span>
        </button>
      </div>
    </footer>
  );
};
