import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GameEngine, Axis } from './game/engine';
import { GameRenderer } from './game/renderer';
import { soundEngine } from './game/audio';
import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  LIGHT_POST_POSITIONS,
  STOP_LINES,
} from './game/constants';
import { GameSettings, GameState, GameStats, Direction } from './game/types';
import { GameHUD } from './components/GameHUD';
import { TrafficControls } from './components/TrafficControls';
import { MainMenu } from './components/MainMenu';
import { GameOverModal } from './components/GameOverModal';
import { LevelCompleteModal } from './components/LevelCompleteModal';
import { SettingsModal } from './components/SettingsModal';
import { PauseModal } from './components/PauseModal';
import { PWAInstallModal } from './components/PWAInstallModal';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const rendererRef = useRef<GameRenderer | null>(null);
  const lastTimeRef = useRef<number>(performance.now());
  const reqIdRef = useRef<number | null>(null);

  const [gameState, setGameState] = useState<GameState>('MENU');
  const [showSettings, setShowSettings] = useState(false);
  const [showInstall, setShowInstall] = useState(false);
  const [gameSpeed, setGameSpeed] = useState<number>(1.0);

  // Synced HUD state
  const [stats, setStats] = useState<GameStats>({
    score: 0,
    level: 1,
    carsPassedInLevel: 0,
    totalCarsPassed: 0,
    combo: 0,
    maxCombo: 0,
    lives: 3,
    bestScore: 0,
    highestLevel: 1,
  });

  const [activeAxis, setActiveAxis] = useState<Axis>('NS');
  const [targetAxis, setTargetAxis] = useState<Axis>('NS');
  const [transitionTimer, setTransitionTimer] = useState<number>(0);

  const [settings, setSettings] = useState<GameSettings>({
    masterVolume: 0.8,
    musicVolume: 0.5,
    sfxVolume: 0.7,
    musicMuted: false,
    sfxMuted: false,
    screenShake: true,
  });

  const [levelBonusData, setLevelBonusData] = useState<{ level: number; bonus: number } | null>(null);

  // Initialize Engine
  useEffect(() => {
    const engine = new GameEngine(
      () => {
        // Game Over callback
        setGameState('GAME_OVER');
      },
      (level, bonus) => {
        // Level complete callback
        setLevelBonusData({ level, bonus });
        setGameState('LEVEL_COMPLETE');
      },
      (newStats) => {
        // Stats update callback
        setStats({ ...newStats });
      }
    );

    engineRef.current = engine;
    setStats({ ...engine.stats });

    return () => {
      soundEngine.cleanup();
    };
  }, []);

  // Update sound engine on settings change
  useEffect(() => {
    soundEngine.setVolumes(
      settings.masterVolume,
      settings.musicVolume,
      settings.sfxVolume,
      settings.musicMuted,
      settings.sfxMuted
    );
  }, [settings]);

  // Main Render & Simulation Loop
  const tick = useCallback((time: number) => {
    const rawDt = (time - lastTimeRef.current) / 1000;
    lastTimeRef.current = time;
    const dt = Math.min(rawDt, 0.1) * gameSpeed;

    const engine = engineRef.current;
    const canvas = canvasRef.current;

    if (canvas && !rendererRef.current) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        rendererRef.current = new GameRenderer(ctx);
      }
    }

    if (engine && rendererRef.current) {
      // Step simulation if active
      if (gameState === 'PLAYING') {
        engine.update(dt);
      }

      // Sync axis state for UI
      setActiveAxis(engine.activeAxis);
      setTargetAxis(engine.targetAxis);
      setTransitionTimer(engine.transitionTimer);

      // Render frame
      rendererRef.current.render(
        engine.vehicles,
        engine.lights,
        engine.levelConfig.weather,
        engine.particles,
        engine.skidMarks,
        engine.floatingTexts,
        engine.activeEvent,
        engine.levelConfig.hasConstruction
      );
    }

    reqIdRef.current = requestAnimationFrame(tick);
  }, [gameState, gameSpeed]);

  useEffect(() => {
    lastTimeRef.current = performance.now();
    reqIdRef.current = requestAnimationFrame(tick);
    return () => {
      if (reqIdRef.current !== null) {
        cancelAnimationFrame(reqIdRef.current);
      }
    };
  }, [tick]);

  // Game Control Handlers
  const handleStartGame = () => {
    soundEngine.playClick();
    if (engineRef.current) {
      engineRef.current.resetGame();
      setStats({ ...engineRef.current.stats });
    }
    soundEngine.startMusic();
    setGameState('PLAYING');
  };

  const handlePlayAgain = () => {
    soundEngine.playClick();
    if (engineRef.current) {
      engineRef.current.resetGame();
      setStats({ ...engineRef.current.stats });
    }
    soundEngine.startMusic();
    setGameState('PLAYING');
  };

  const handlePause = () => {
    soundEngine.playClick();
    setGameState('PAUSED');
  };

  const handleResume = () => {
    soundEngine.playClick();
    lastTimeRef.current = performance.now();
    setGameState('PLAYING');
  };

  const handleMainMenu = () => {
    soundEngine.playClick();
    soundEngine.stopMusic();
    setGameState('MENU');
  };

  const handleContinueNextLevel = () => {
    soundEngine.playClick();
    if (engineRef.current) {
      engineRef.current.advanceToNextLevel();
      setStats({ ...engineRef.current.stats });
    }
    setGameState('PLAYING');
  };

  const handleToggleMute = () => {
    soundEngine.playClick();
    const isBothMuted = settings.musicMuted && settings.sfxMuted;
    setSettings((prev) => ({
      ...prev,
      musicMuted: !isBothMuted,
      sfxMuted: !isBothMuted,
    }));
  };

  const handleToggleGameSpeed = () => {
    soundEngine.playClick();
    setGameSpeed((prev) => (prev === 1.0 ? 1.5 : 1.0));
  };

  // Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore key events when typing or outside game
      if (e.target instanceof HTMLInputElement) return;

      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        if (gameState === 'MENU') {
          handleStartGame();
        } else if (gameState === 'PLAYING') {
          engineRef.current?.toggleAxis();
        } else if (gameState === 'GAME_OVER') {
          handlePlayAgain();
        } else if (gameState === 'LEVEL_COMPLETE') {
          handleContinueNextLevel();
        }
      } else if (e.key === '1' || e.key === 'n' || e.key === 'N') {
        if (gameState === 'PLAYING') engineRef.current?.requestAxis('NS');
      } else if (e.key === '2' || e.key === 'e' || e.key === 'E') {
        if (gameState === 'PLAYING') engineRef.current?.requestAxis('EW');
      } else if (e.key === '3' || e.key === 'r' || e.key === 'R') {
        if (gameState === 'PLAYING') engineRef.current?.requestAllRed();
      } else if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
        if (gameState === 'PLAYING') {
          handlePause();
        } else if (gameState === 'PAUSED') {
          handleResume();
        }
      } else if (e.key === 'm' || e.key === 'M') {
        handleToggleMute();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState]);

  // Handle Touch or Mouse Click on Canvas
  const handleInteraction = (clientX: number, clientY: number) => {
    if (gameState !== 'PLAYING' || !canvasRef.current || !engineRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = CANVAS_WIDTH / rect.width;
    const scaleY = CANVAS_HEIGHT / rect.height;
    const clickX = (clientX - rect.left) * scaleX;
    const clickY = (clientY - rect.top) * scaleY;

    // Check proximity to traffic light posts or stop lines
    let clickedAxis: Axis | null = null;

    // North post or stop line (expanded hit zone for fingers)
    if (
      Math.hypot(clickX - LIGHT_POST_POSITIONS.N.x, clickY - LIGHT_POST_POSITIONS.N.y) < 60 ||
      (Math.abs(clickX - 415) < 55 && Math.abs(clickY - STOP_LINES.N) < 55)
    ) {
      clickedAxis = 'NS';
    }
    // South post or stop line
    else if (
      Math.hypot(clickX - LIGHT_POST_POSITIONS.S.x, clickY - LIGHT_POST_POSITIONS.S.y) < 60 ||
      (Math.abs(clickX - 485) < 55 && Math.abs(clickY - STOP_LINES.S) < 55)
    ) {
      clickedAxis = 'NS';
    }
    // West post or stop line
    else if (
      Math.hypot(clickX - LIGHT_POST_POSITIONS.W.x, clickY - LIGHT_POST_POSITIONS.W.y) < 60 ||
      (Math.abs(clickX - STOP_LINES.W) < 55 && Math.abs(clickY - 385) < 55)
    ) {
      clickedAxis = 'EW';
    }
    // East post or stop line
    else if (
      Math.hypot(clickX - LIGHT_POST_POSITIONS.E.x, clickY - LIGHT_POST_POSITIONS.E.y) < 60 ||
      (Math.abs(clickX - STOP_LINES.E) < 55 && Math.abs(clickY - 315) < 55)
    ) {
      clickedAxis = 'EW';
    }

    if (clickedAxis) {
      engineRef.current.requestAxis(clickedAxis);
    } else {
      // Clicking central intersection also acts as quick corridor toggle
      if (Math.abs(clickX - CANVAS_WIDTH / 2) < 90 && Math.abs(clickY - CANVAS_HEIGHT / 2) < 90) {
        engineRef.current.toggleAxis();
      }
    }
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    handleInteraction(e.clientX, e.clientY);
  };

  const handleCanvasTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      handleInteraction(touch.clientX, touch.clientY);
    }
  };

  // Screen shake offset calculation
  const shakeVal = settings.screenShake && engineRef.current ? engineRef.current.screenShake : 0;
  const shakeX = shakeVal > 0 ? (Math.random() - 0.5) * shakeVal : 0;
  const shakeY = shakeVal > 0 ? (Math.random() - 0.5) * shakeVal : 0;

  return (
    <div className="relative w-full h-screen bg-slate-950 flex flex-col items-center justify-center overflow-hidden select-none font-sans">
      {/* Game Viewport Container */}
      <main
        className="relative flex items-center justify-center w-full h-full p-0 sm:p-2 transition-transform overflow-hidden"
        style={{
          transform: `translate(${shakeX}px, ${shakeY}px)`,
        }}
      >
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          onClick={handleCanvasClick}
          onTouchStart={handleCanvasTouchStart}
          className="rounded-none sm:rounded-2xl shadow-2xl border-0 sm:border border-slate-800/80 cursor-pointer object-contain w-full h-full max-w-[100vw] max-h-[100dvh] touch-none"
        />

        {/* In-Game HUD & Controls */}
        {gameState === 'PLAYING' && engineRef.current && (
          <>
            <GameHUD
              stats={stats}
              levelConfig={engineRef.current.levelConfig}
              activeEvent={engineRef.current.activeEvent}
              isMuted={settings.musicMuted && settings.sfxMuted}
              onToggleMute={handleToggleMute}
              onPause={handlePause}
            />

            <TrafficControls
              activeAxis={activeAxis}
              targetAxis={targetAxis}
              transitionTimer={transitionTimer}
              lights={engineRef.current.lights}
              onRequestAxis={(axis) => engineRef.current?.requestAxis(axis)}
              onToggleAxis={() => engineRef.current?.toggleAxis()}
              onRequestAllRed={() => engineRef.current?.requestAllRed()}
              gameSpeed={gameSpeed}
              onToggleGameSpeed={handleToggleGameSpeed}
            />
          </>
        )}

        {/* State Modals & Overlays */}
        {gameState === 'MENU' && (
          <MainMenu
            bestScore={stats.bestScore}
            highestLevel={stats.highestLevel}
            onPlay={handleStartGame}
            onOpenSettings={() => setShowSettings(true)}
            onOpenInstall={() => setShowInstall(true)}
          />
        )}

        {gameState === 'PAUSED' && (
          <PauseModal
            onResume={handleResume}
            onRestart={handleStartGame}
            onOpenSettings={() => setShowSettings(true)}
            onMainMenu={handleMainMenu}
          />
        )}

        {gameState === 'LEVEL_COMPLETE' && levelBonusData && engineRef.current && (
          <LevelCompleteModal
            completedLevel={levelBonusData.level}
            bonus={levelBonusData.bonus}
            nextLevelConfig={engineRef.current.levelConfig}
            onContinue={handleContinueNextLevel}
          />
        )}

        {gameState === 'GAME_OVER' && (
          <GameOverModal
            stats={stats}
            onPlayAgain={handlePlayAgain}
            onMainMenu={handleMainMenu}
          />
        )}

        {showSettings && (
          <SettingsModal
            settings={settings}
            onUpdateSettings={setSettings}
            onClose={() => setShowSettings(false)}
          />
        )}

        <PWAInstallModal
          isOpen={showInstall}
          onClose={() => setShowInstall(false)}
        />
      </main>
    </div>
  );
}
