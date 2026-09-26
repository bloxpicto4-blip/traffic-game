import {
  ActiveEvent,
  Direction,
  FloatingText,
  GameStats,
  LevelConfig,
  LightColor,
  Particle,
  RandomEventType,
  SkidMark,
  TrafficLightGroup,
  Vehicle,
} from './types';
import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  CENTER_X,
  CENTER_Y,
  getLevelConfig,
  LANES,
} from './constants';
import { spawnVehicle, updateVehicles } from './vehicles';
import { soundEngine } from './audio';

const STORAGE_KEY_BEST_SCORE = 'crossroad_chaos_best_score';
const STORAGE_KEY_BEST_LEVEL = 'crossroad_chaos_best_level';

export type Axis = 'NS' | 'EW' | 'NONE';

export class GameEngine {
  public stats: GameStats;
  public levelConfig: LevelConfig;
  public vehicles: Vehicle[] = [];
  public lights: Record<Direction, TrafficLightGroup>;
  public activeAxis: Axis = 'NS';
  public targetAxis: Axis = 'NS';
  public transitionTimer = 0; // Yellow interval countdown

  public particles: Particle[] = [];
  public skidMarks: SkidMark[] = [];
  public floatingTexts: FloatingText[] = [];
  public activeEvent: ActiveEvent | null = null;
  public eventCooldown = 12;

  public screenShake = 0;
  public isPaused = false;
  public isGameOver = false;
  public isLevelComplete = false;

  private spawnTimers: Record<Direction, number> = { N: 1.0, S: 1.5, E: 2.0, W: 2.5 };
  private crashCooldown = 0;
  private onGameOverCb?: () => void;
  private onLevelCompleteCb?: (level: number, bonus: number) => void;
  private onStatsChangeCb?: (stats: GameStats) => void;

  constructor(
    onGameOver?: () => void,
    onLevelComplete?: (level: number, bonus: number) => void,
    onStatsChange?: (stats: GameStats) => void
  ) {
    this.onGameOverCb = onGameOver;
    this.onLevelCompleteCb = onLevelComplete;
    this.onStatsChangeCb = onStatsChange;

    const savedBestScore = parseInt(localStorage.getItem(STORAGE_KEY_BEST_SCORE) || '0', 10);
    const savedBestLevel = parseInt(localStorage.getItem(STORAGE_KEY_BEST_LEVEL) || '1', 10);

    this.stats = {
      score: 0,
      level: 1,
      carsPassedInLevel: 0,
      totalCarsPassed: 0,
      combo: 0,
      maxCombo: 0,
      lives: 3,
      bestScore: savedBestScore,
      highestLevel: savedBestLevel,
    };

    this.levelConfig = getLevelConfig(1);

    // Initial lights: North-South Green, East-West Red
    this.lights = {
      N: { direction: 'N', color: 'GREEN', yellowTimer: 0 },
      S: { direction: 'S', color: 'GREEN', yellowTimer: 0 },
      E: { direction: 'E', color: 'RED', yellowTimer: 0 },
      W: { direction: 'W', color: 'RED', yellowTimer: 0 },
    };
  }

  public resetGame() {
    this.vehicles = [];
    this.particles = [];
    this.skidMarks = [];
    this.floatingTexts = [];
    this.activeEvent = null;
    this.eventCooldown = 12;
    this.screenShake = 0;
    this.isPaused = false;
    this.isGameOver = false;
    this.isLevelComplete = false;

    this.stats.score = 0;
    this.stats.level = 1;
    this.stats.carsPassedInLevel = 0;
    this.stats.totalCarsPassed = 0;
    this.stats.combo = 0;
    this.stats.maxCombo = 0;
    this.stats.lives = 3;

    this.levelConfig = getLevelConfig(1);

    this.activeAxis = 'NS';
    this.targetAxis = 'NS';
    this.transitionTimer = 0;

    this.setDirectLights('GREEN', 'RED');
    this.spawnTimers = { N: 1.0, S: 1.5, E: 2.0, W: 2.5 };

    soundEngine.setEmergencySiren(false);
    this.notifyStats();
  }

  public advanceToNextLevel() {
    this.isLevelComplete = false;
    this.stats.level += 1;
    this.stats.carsPassedInLevel = 0;
    if (this.stats.level > this.stats.highestLevel) {
      this.stats.highestLevel = this.stats.level;
      localStorage.setItem(STORAGE_KEY_BEST_LEVEL, this.stats.highestLevel.toString());
    }

    this.levelConfig = getLevelConfig(this.stats.level);
    this.activeEvent = null;
    this.eventCooldown = 10;

    // Celebration feedback
    this.addFloatingText(`LEVEL ${this.stats.level}!`, CENTER_X, CENTER_Y - 40, '#38BDF8', 2.2);
    this.notifyStats();
  }

  // --- Traffic Light Controls ---

  public requestAxis(axis: Axis) {
    if (this.isGameOver || this.isPaused) return;

    if (this.transitionTimer > 0) {
      // Already transitioning, update final target
      this.targetAxis = axis;
      return;
    }

    if (this.activeAxis === axis) {
      // Toggle to all red or other axis
      if (axis === 'NS') {
        this.switchWithYellow('EW');
      } else if (axis === 'EW') {
        this.switchWithYellow('NS');
      }
      return;
    }

    this.switchWithYellow(axis);
  }

  public toggleAxis() {
    if (this.activeAxis === 'NS') {
      this.requestAxis('EW');
    } else {
      this.requestAxis('NS');
    }
  }

  public requestAllRed() {
    this.switchWithYellow('NONE');
  }

  private switchWithYellow(target: Axis) {
    if (this.activeAxis === target && this.transitionTimer <= 0) return;

    soundEngine.playLightChange();
    this.targetAxis = target;
    const yellowDuration = 1.4; // 1.4 second clearance phase
    this.transitionTimer = yellowDuration;

    if (this.activeAxis === 'NS') {
      this.lights.N.color = 'YELLOW';
      this.lights.N.yellowTimer = yellowDuration;
      this.lights.S.color = 'YELLOW';
      this.lights.S.yellowTimer = yellowDuration;
    } else if (this.activeAxis === 'EW') {
      this.lights.E.color = 'YELLOW';
      this.lights.E.yellowTimer = yellowDuration;
      this.lights.W.color = 'YELLOW';
      this.lights.W.yellowTimer = yellowDuration;
    } else {
      // Was already NONE, can immediately transition
      this.finalizeAxisSwitch();
    }
  }

  private finalizeAxisSwitch() {
    this.transitionTimer = 0;
    this.activeAxis = this.targetAxis;

    if (this.activeAxis === 'NS') {
      this.setDirectLights('GREEN', 'RED');
    } else if (this.activeAxis === 'EW') {
      this.setDirectLights('RED', 'GREEN');
    } else {
      this.setDirectLights('RED', 'RED');
    }

    soundEngine.playLightChange();
  }

  private setDirectLights(nsColor: LightColor, ewColor: LightColor) {
    this.lights.N = { direction: 'N', color: nsColor, yellowTimer: 0 };
    this.lights.S = { direction: 'S', color: nsColor, yellowTimer: 0 };
    this.lights.E = { direction: 'E', color: ewColor, yellowTimer: 0 };
    this.lights.W = { direction: 'W', color: ewColor, yellowTimer: 0 };
  }

  // --- Main Tick Update ---

  public update(dt: number) {
    if (this.isPaused || this.isGameOver) return;

    // 1. Light transition timers
    if (this.transitionTimer > 0) {
      this.transitionTimer -= dt;
      if (this.lights.N.color === 'YELLOW') this.lights.N.yellowTimer = this.transitionTimer;
      if (this.lights.S.color === 'YELLOW') this.lights.S.yellowTimer = this.transitionTimer;
      if (this.lights.E.color === 'YELLOW') this.lights.E.yellowTimer = this.transitionTimer;
      if (this.lights.W.color === 'YELLOW') this.lights.W.yellowTimer = this.transitionTimer;

      if (this.transitionTimer <= 0) {
        this.finalizeAxisSwitch();
      }
    }

    // 2. Vehicle Spawning
    this.handleVehicleSpawning(dt);

    // 3. Vehicle Updates & Physics
    const { activeVehicles, safePasses, screeches } = updateVehicles(
      this.vehicles,
      this.lights,
      dt,
      this.levelConfig.hasConstruction
    );
    this.vehicles = activeVehicles;

    if (screeches && Math.random() < 0.15) {
      soundEngine.playBrakeScreech();
    }

    // 4. Safe Passes & Scoring
    if (safePasses.length > 0) {
      safePasses.forEach((car) => {
        soundEngine.playCarPass();
        this.stats.combo += 1;
        if (this.stats.combo > this.stats.maxCombo) {
          this.stats.maxCombo = this.stats.combo;
        }

        const multiplier = Math.min(10, Math.max(1, Math.floor(this.stats.combo / 4) + 1));
        const pts = 10 * multiplier;
        this.stats.score += pts;
        this.stats.carsPassedInLevel += 1;
        this.stats.totalCarsPassed += 1;

        if (this.stats.score > this.stats.bestScore) {
          this.stats.bestScore = this.stats.score;
          localStorage.setItem(STORAGE_KEY_BEST_SCORE, this.stats.bestScore.toString());
        }

        // Floating points popup
        const text = multiplier > 1 ? `+${pts} (${multiplier}x)` : `+${pts}`;
        const color = multiplier >= 4 ? '#F59E0B' : multiplier >= 2 ? '#34D399' : '#F8FAFC';
        this.addFloatingText(text, car.x, car.y, color, 1.0);
      });

      this.notifyStats();

      // Check level complete
      if (this.stats.carsPassedInLevel >= this.levelConfig.targetCars && !this.isLevelComplete) {
        this.triggerLevelComplete();
      }
    }

    // 5. Collision Detection
    this.checkCollisions(dt);

    // 6. Skid Marks Generation
    this.vehicles.forEach((v) => {
      if (v.isBraking && v.speed > 0.9 && !v.isCrashed) {
        if (Math.random() < 0.25) {
          this.skidMarks.push({
            x1: v.x - 3,
            y1: v.y - 3,
            x2: v.x + 3,
            y2: v.y + 3,
            alpha: 0.6,
          });
        }
      }
    });

    // Fade skid marks
    for (let i = this.skidMarks.length - 1; i >= 0; i--) {
      this.skidMarks[i].alpha -= dt * 0.05;
      if (this.skidMarks[i].alpha <= 0) {
        this.skidMarks.splice(i, 1);
      }
    }

    // 7. Particles Update
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * (dt * 60);
      p.y += p.vy * (dt * 60);
      p.life -= dt;
      p.alpha = Math.max(0, p.life / p.maxLife);
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }

    // 8. Floating Texts Update
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y -= dt * 32;
      ft.life -= dt;
      ft.alpha = Math.max(0, ft.life / 1.2);
      if (ft.life <= 0) {
        this.floatingTexts.splice(i, 1);
      }
    }

    // 9. Siren Sound Controller
    const hasEmergency = this.vehicles.some((v) => v.emergency && !v.hasExited && !v.isCrashed);
    soundEngine.setEmergencySiren(hasEmergency);

    // 10. Random Events Triggering & Timers
    this.handleRandomEvents(dt);

    // 11. Screen Shake Decay
    if (this.screenShake > 0) {
      this.screenShake = Math.max(0, this.screenShake - dt * 25);
    }
  }

  // --- Collision Resolution ---

  private checkCollisions(dt: number) {
    if (this.crashCooldown > 0) {
      this.crashCooldown -= dt;
    }

    const n = this.vehicles.length;
    for (let i = 0; i < n; i++) {
      const a = this.vehicles[i];
      if (a.isCrashed) continue;

      for (let j = i + 1; j < n; j++) {
        const b = this.vehicles[j];
        if (b.isCrashed) continue;

        // Skip vehicles in identical direction that are just tailgating (physics already bounds them)
        if (a.direction === b.direction) continue;

        // Simple oriented bounding box collision check
        const dx = Math.abs(a.x - b.x);
        const dy = Math.abs(a.y - b.y);

        // Combined approximate radius
        const aRad = Math.min(a.length, a.width) * 0.45;
        const bRad = Math.min(b.length, b.width) * 0.45;
        const distSq = (a.x - b.x) * (a.x - b.x) + (a.y - b.y) * (a.y - b.y);

        // Box overlap test
        const overlapX = dx < (a.length + b.length) * 0.38;
        const overlapY = dy < (a.width + b.width) * 0.38;

        if (distSq < (aRad + bRad + 8) ** 2 || (overlapX && overlapY)) {
          this.triggerCrash(a, b);
          break;
        }
      }
    }
  }

  private triggerCrash(a: Vehicle, b: Vehicle) {
    a.isCrashed = true;
    b.isCrashed = true;
    a.speed = 0;
    b.speed = 0;

    soundEngine.playCrash();
    this.screenShake = 16;
    this.stats.combo = 0; // Reset combo

    // Deduct Life
    this.stats.lives = Math.max(0, this.stats.lives - 1);
    this.notifyStats();

    // Collision FX
    const cx = (a.x + b.x) / 2;
    const cy = (a.y + b.y) / 2;
    this.spawnCrashParticles(cx, cy);

    this.addFloatingText('CRASH! -1 LIFE', cx, cy - 20, '#EF4444', 1.8);

    // Remove wrecks after 2.8s so intersection recovers
    setTimeout(() => {
      a.hasExited = true;
      b.hasExited = true;
    }, 2800);

    // Check Game Over
    if (this.stats.lives <= 0) {
      this.triggerGameOver();
    }
  }

  private triggerLevelComplete() {
    this.isLevelComplete = true;
    const bonus = 500 * this.stats.level;
    this.stats.score += bonus;
    if (this.stats.score > this.stats.bestScore) {
      this.stats.bestScore = this.stats.score;
      localStorage.setItem(STORAGE_KEY_BEST_SCORE, this.stats.bestScore.toString());
    }

    soundEngine.playLevelComplete();
    this.spawnConfetti();
    this.addFloatingText(`LEVEL COMPLETE! +${bonus}`, CENTER_X, CENTER_Y - 30, '#10B981', 2.0);
    this.notifyStats();

    if (this.onLevelCompleteCb) {
      this.onLevelCompleteCb(this.stats.level, bonus);
    }
  }

  private triggerGameOver() {
    this.isGameOver = true;
    soundEngine.setEmergencySiren(false);
    soundEngine.playGameOver();

    if (this.stats.score > this.stats.bestScore) {
      this.stats.bestScore = this.stats.score;
      localStorage.setItem(STORAGE_KEY_BEST_SCORE, this.stats.bestScore.toString());
    }
    if (this.stats.level > this.stats.highestLevel) {
      this.stats.highestLevel = this.stats.level;
      localStorage.setItem(STORAGE_KEY_BEST_LEVEL, this.stats.highestLevel.toString());
    }

    if (this.onGameOverCb) {
      this.onGameOverCb();
    }
  }

  // --- Spawning System ---

  private handleVehicleSpawning(dt: number) {
    const directions: Direction[] = ['N', 'S', 'E', 'W'];

    directions.forEach((dir) => {
      this.spawnTimers[dir] -= dt;
      if (this.spawnTimers[dir] <= 0) {
        // Reset timer
        const minI = this.levelConfig.spawnIntervalMin;
        const maxI = this.levelConfig.spawnIntervalMax;
        this.spawnTimers[dir] = minI + Math.random() * (maxI - minI);

        // Check if spawn point is clear
        const lane = LANES[dir];
        const isBlocked = this.vehicles.some((v) => {
          if (v.direction !== dir) return false;
          const dist = Math.hypot(v.x - lane.inX, v.y - lane.inY);
          return dist < 85;
        });

        if (!isBlocked) {
          // Cap total vehicles on screen to preserve fairness
          const maxVehicles = Math.min(22, 10 + this.stats.level * 2);
          if (this.vehicles.length < maxVehicles) {
            const v = spawnVehicle(dir, this.levelConfig);
            this.vehicles.push(v);
          }
        }
      }
    });
  }

  // --- Random Events System ---

  private handleRandomEvents(dt: number) {
    if (this.activeEvent) {
      this.activeEvent.timer -= dt;
      if (this.activeEvent.timer <= 0) {
        this.activeEvent = null;
      }
    } else {
      this.eventCooldown -= dt;
      if (this.eventCooldown <= 0) {
        this.eventCooldown = 15 + Math.random() * 12;

        if (this.stats.level >= 3 && Math.random() < this.levelConfig.eventChance) {
          this.triggerRandomEvent();
        }
      }
    }
  }

  private triggerRandomEvent() {
    const events: RandomEventType[] = ['emergency_convoy', 'speed_demon', 'rush_hour'];
    if (this.stats.level >= 5) events.push('broken_vehicle');

    const chosen = events[Math.floor(Math.random() * events.length)];
    const dirs: Direction[] = ['N', 'S', 'E', 'W'];
    const randDir = dirs[Math.floor(Math.random() * dirs.length)];

    switch (chosen) {
      case 'emergency_convoy': {
        this.activeEvent = {
          type: 'emergency_convoy',
          title: 'EMERGENCY VEHICLE APPROACHING!',
          description: `Clear the intersection for priority unit from ${this.getDirName(randDir)}!`,
          direction: randDir,
          duration: 7,
          timer: 7,
        };
        // Spawn emergency vehicle immediately on that road
        const v = spawnVehicle(randDir, this.levelConfig, true);
        this.vehicles.push(v);
        this.addFloatingText('SIREN APPROACHING!', CENTER_X, 100, '#EF4444', 1.8);
        break;
      }
      case 'speed_demon': {
        this.activeEvent = {
          type: 'speed_demon',
          title: 'RECKLESS SPEEDER DETECTED!',
          description: `Fast vehicle approaching from ${this.getDirName(randDir)}!`,
          direction: randDir,
          duration: 6,
          timer: 6,
        };
        const speeder = spawnVehicle(randDir, this.levelConfig, false, 'taxi');
        speeder.speed *= 1.4;
        speeder.maxSpeed *= 1.4;
        this.vehicles.push(speeder);
        break;
      }
      case 'rush_hour': {
        this.activeEvent = {
          type: 'rush_hour',
          title: 'SURGE TRAFFIC SPIKE!',
          description: 'Heavy commuter stream arriving from all directions!',
          duration: 8,
          timer: 8,
        };
        // Quick spawn acceleration
        this.spawnTimers.N = 0.2;
        this.spawnTimers.E = 0.5;
        this.spawnTimers.S = 0.8;
        break;
      }
      case 'broken_vehicle': {
        // Pick an existing vehicle to break down
        const eligible = this.vehicles.filter((v) => !v.hasCrossedStopLine && !v.isCrashed && !v.emergency);
        if (eligible.length > 0) {
          const broken = eligible[Math.floor(Math.random() * eligible.length)];
          broken.isBrokenDown = true;
          this.activeEvent = {
            type: 'broken_vehicle',
            title: 'BROKEN DOWN VEHICLE!',
            description: 'Hazard flashers active. Vehicle clearing shortly.',
            duration: 6,
            timer: 6,
          };
          setTimeout(() => {
            broken.isBrokenDown = false;
          }, 5500);
        }
        break;
      }
    }
  }

  private getDirName(dir: Direction): string {
    switch (dir) {
      case 'N': return 'NORTH';
      case 'S': return 'SOUTH';
      case 'E': return 'EAST';
      case 'W': return 'WEST';
    }
  }

  // --- Particle Effects & Floating Text Helpers ---

  private spawnCrashParticles(x: number, y: number) {
    // Sparks & fiery flame particles
    for (let i = 0; i < 28; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 6;
      this.particles.push({
        id: `sp_${Date.now()}_${i}`,
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: Math.random() < 0.5 ? '#F59E0B' : '#EF4444',
        size: 3 + Math.random() * 4,
        alpha: 1,
        life: 0.4 + Math.random() * 0.4,
        maxLife: 0.8,
        type: 'spark',
      });
    }

    // Billowing dark smoke
    for (let i = 0; i < 16; i++) {
      this.particles.push({
        id: `sm_${Date.now()}_${i}`,
        x: x + (Math.random() * 20 - 10),
        y: y + (Math.random() * 20 - 10),
        vx: (Math.random() - 0.5) * 1.5,
        vy: -1.5 - Math.random() * 2,
        color: '#475569',
        size: 6 + Math.random() * 8,
        alpha: 0.8,
        life: 0.8 + Math.random() * 0.6,
        maxLife: 1.4,
        type: 'smoke',
      });
    }
  }

  private spawnConfetti() {
    const colors = ['#38BDF8', '#34D399', '#FBBF24', '#F472B6', '#A78BFA'];
    for (let i = 0; i < 60; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 5;
      this.particles.push({
        id: `conf_${Date.now()}_${i}`,
        x: CENTER_X + (Math.random() * 100 - 50),
        y: CENTER_Y + (Math.random() * 100 - 50),
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 5 + Math.random() * 4,
        alpha: 1,
        life: 1.2 + Math.random() * 0.8,
        maxLife: 2.0,
        type: 'confetti',
      });
    }
  }

  public addFloatingText(text: string, x: number, y: number, color: string, scale = 1.0) {
    this.floatingTexts.push({
      id: `ft_${Date.now()}_${Math.random()}`,
      text,
      x,
      y,
      color,
      alpha: 1,
      life: 1.2,
      scale,
    });
  }

  private notifyStats() {
    if (this.onStatsChangeCb) {
      this.onStatsChangeCb({ ...this.stats });
    }
  }
}
