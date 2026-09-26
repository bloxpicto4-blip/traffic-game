import React, { useEffect, useState } from 'react';
import { Award, ArrowRight } from 'lucide-react';
import { LevelConfig } from '../game/types';

interface LevelCompleteModalProps {
  completedLevel: number;
  bonus: number;
  nextLevelConfig: LevelConfig;
  onContinue: () => void;
}

export const LevelCompleteModal: React.FC<LevelCompleteModalProps> = ({
  completedLevel,
  bonus,
  nextLevelConfig,
  onContinue,
}) => {
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onContinue();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onContinue]);

  return (
    <div className="absolute inset-0 z-35 flex items-center justify-center p-4 sm:p-6 bg-slate-950/75 backdrop-blur-sm pointer-events-auto overflow-y-auto">
      <div className="max-w-sm w-full bg-slate-900/95 border border-emerald-500/40 rounded-2xl p-5 sm:p-6 shadow-2xl flex flex-col items-center text-center animate-in fade-in zoom-in-90 duration-200 my-auto">
        <div className="p-2.5 sm:p-3 bg-emerald-950/80 border border-emerald-500/50 rounded-2xl text-emerald-400 mb-2.5 sm:mb-3 animate-bounce">
          <Award className="w-7 h-7 sm:w-8 sm:h-8" />
        </div>

        <h3 className="text-lg sm:text-2xl font-black uppercase tracking-tight text-white mb-1">
          Level {completedLevel} Complete!
        </h3>

        <div className="flex items-center gap-1.5 text-base sm:text-lg font-bold text-emerald-400 font-mono mb-3 sm:mb-4">
          <span>+{bonus.toLocaleString()} BONUS</span>
        </div>

        <div className="w-full p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-left mb-4 sm:mb-5">
          <span className="text-[10px] sm:text-[11px] font-medium uppercase tracking-wider text-slate-400 block mb-0.5 sm:mb-1">
            Coming Up: Level {nextLevelConfig.level}
          </span>
          <p className="text-xs text-slate-300 leading-relaxed">
            {nextLevelConfig.description}
          </p>
        </div>

        <button
          onClick={onContinue}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-500 active:scale-95 transition-all text-xs sm:text-sm cursor-pointer touch-manipulation shadow-lg"
        >
          <span>Continue Now ({countdown}s)</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
