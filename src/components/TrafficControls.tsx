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
    <footer className="absolute bottom-4 left-0 right-0 px-4 z-20 flex justify-center pointer-events-none">
      <div className="flex flex-wrap items-center justify-center gap-2 bg-slate-950/90 backdrop-blur-md p-2 rounded-2xl border border-slate-800 shadow-2xl pointer-events-auto">
        {/* Master Toggle Button */}
        <button
          onClick={onToggleAxis}
          className={`flex items-center gap-2.5 px-5 py-3 rounded-xl font-semibold text-sm transition-all duration-200 shadow-md ${
            isTransitioning
              ? 'bg-amber-600 text-amber-50 ring-2 ring-amber-400/50 animate-pulse'
              : 'bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white'
          }`}
          title="Toggle Traffic Corridor (Spacebar)"
        >
          {activeAxis === 'NS' ? (
            <>
              <ArrowLeftRight className="w-5 h-5" />
              <span>Switch to East-West</span>
            </>
          ) : (
            <>
              <ArrowUpDown className="w-5 h-5" />
              <span>Switch to North-South</span>
            </>
          )}
          <span className="text-[10px] bg-black/25 px-1.5 py-0.5 rounded font-mono uppercase tracking-wider">
            Space
          </span>
        </button>

        {/* North-South Corridor Status & Direct Trigger */}
        <button
          onClick={() => onRequestAxis('NS')}
          className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-xs font-semibold transition-all ${
            isNSGreen
              ? 'bg-emerald-950/80 border-emerald-500/80 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.25)]'
              : isNSYellow
              ? 'bg-amber-950/80 border-amber-500/80 text-amber-300 animate-pulse'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
          }`}
          title="Give Green to North-South (Hotkey: 1 or N)"
        >
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isNSGreen
                  ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]'
                  : isNSYellow
                  ? 'bg-amber-400 shadow-[0_0_8px_#fbbf24]'
                  : 'bg-rose-500/80'
              }`}
            />
            <span className="font-mono">N·S</span>
          </div>
          <span className="text-[11px] font-medium">
            {isNSGreen ? 'GREEN' : isNSYellow ? 'CLEARING' : 'RED'}
          </span>
          <span className="text-[10px] text-slate-500 font-mono bg-slate-800/80 px-1 py-0.5 rounded">
            1
          </span>
        </button>

        {/* East-West Corridor Status & Direct Trigger */}
        <button
          onClick={() => onRequestAxis('EW')}
          className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-xs font-semibold transition-all ${
            isEWGreen
              ? 'bg-emerald-950/80 border-emerald-500/80 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.25)]'
              : isEWYellow
              ? 'bg-amber-950/80 border-amber-500/80 text-amber-300 animate-pulse'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
          }`}
          title="Give Green to East-West (Hotkey: 2 or E)"
        >
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isEWGreen
                  ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]'
                  : isEWYellow
                  ? 'bg-amber-400 shadow-[0_0_8px_#fbbf24]'
                  : 'bg-rose-500/80'
              }`}
            />
            <span className="font-mono">E·W</span>
          </div>
          <span className="text-[11px] font-medium">
            {isEWGreen ? 'GREEN' : isEWYellow ? 'CLEARING' : 'RED'}
          </span>
          <span className="text-[10px] text-slate-500 font-mono bg-slate-800/80 px-1 py-0.5 rounded">
            2
          </span>
        </button>

        {/* All Red Clearance Hold */}
        <button
          onClick={onRequestAllRed}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl border text-xs font-semibold transition-all ${
            activeAxis === 'NONE' && !isTransitioning
              ? 'bg-rose-950/80 border-rose-500/80 text-rose-300 shadow-[0_0_12px_rgba(239,68,68,0.25)]'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-rose-300 hover:border-slate-700'
          }`}
          title="All Red / Clear Intersection (Hotkey: 3 or R)"
        >
          <OctagonAlert className="w-3.5 h-3.5 text-rose-400" />
          <span>All Red</span>
          <span className="text-[10px] text-slate-500 font-mono bg-slate-800/80 px-1 py-0.5 rounded">
            3
          </span>
        </button>

        <div className="w-px h-6 bg-slate-800 mx-1 hidden sm:block" />

        {/* Game Speed Multiplier */}
        <button
          onClick={onToggleGameSpeed}
          className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl border text-xs font-mono font-medium transition-all ${
            gameSpeed > 1
              ? 'bg-amber-950/60 border-amber-600/50 text-amber-300'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
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
