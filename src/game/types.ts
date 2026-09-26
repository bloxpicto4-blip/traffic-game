export type Direction = 'N' | 'S' | 'E' | 'W';

export type LightColor = 'RED' | 'YELLOW' | 'GREEN';

export type VehicleType = 
  | 'compact'
  | 'sedan'
  | 'taxi'
  | 'suv'
  | 'truck'
  | 'bus'
  | 'ambulance'
  | 'fire_truck'
  | 'police';

export type WeatherType = 'sunny' | 'dusk' | 'night' | 'rain' | 'storm';

export interface VehicleConfig {
  type: VehicleType;
  name: string;
  length: number;
  width: number;
  maxSpeed: number;
  accel: number;
  brakeDecel: number;
  emergency: boolean;
  color: string;
  roofColor: string;
  spawnWeight: number; // probability weight
}

export interface Vehicle {
  id: string;
  type: VehicleType;
  direction: Direction; // Origin direction
  x: number;
  y: number;
  speed: number;
  maxSpeed: number;
  accel: number;
  brakeDecel: number;
  length: number;
  width: number;
  color: string;
  roofColor: string;
  emergency: boolean;
  hasCrossedStopLine: boolean;
  hasClearedIntersection: boolean;
  hasExited: boolean;
  isBraking: boolean;
  isCrashed: boolean;
  isBrokenDown: boolean;
  hazardBlink: boolean;
  sirenPhase: number;
  timeAlive: number;
  hornCooldown: number;
}

export interface TrafficLightGroup {
  direction: Direction;
  color: LightColor;
  yellowTimer: number; // seconds remaining in yellow
}

export interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
  life: number;
  maxLife: number;
  type: 'spark' | 'smoke' | 'debris' | 'rain' | 'confetti';
}

export interface SkidMark {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  alpha: number;
}

export interface FloatingText {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
  alpha: number;
  life: number;
  scale: number;
}

export interface LevelConfig {
  level: number;
  targetCars: number;
  spawnIntervalMin: number;
  spawnIntervalMax: number;
  speedMultiplier: number;
  weather: WeatherType;
  availableVehicles: VehicleType[];
  emergencyChance: number;
  eventChance: number;
  description: string;
  hasConstruction?: boolean;
}

export type RandomEventType = 
  | 'emergency_convoy'
  | 'speed_demon'
  | 'rush_hour'
  | 'broken_vehicle'
  | 'sudden_rain';

export interface ActiveEvent {
  type: RandomEventType;
  title: string;
  description: string;
  direction?: Direction;
  duration: number;
  timer: number;
}

export interface GameSettings {
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;
  musicMuted: boolean;
  sfxMuted: boolean;
  screenShake: boolean;
}

export interface GameStats {
  score: number;
  level: number;
  carsPassedInLevel: number;
  totalCarsPassed: number;
  combo: number;
  maxCombo: number;
  lives: number;
  bestScore: number;
  highestLevel: number;
}

export type GameState = 
  | 'MENU'
  | 'PLAYING'
  | 'PAUSED'
  | 'LEVEL_COMPLETE'
  | 'GAME_OVER';
