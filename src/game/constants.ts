import { Direction, LevelConfig, VehicleConfig, VehicleType, WeatherType } from './types';

export const CANVAS_WIDTH = 900;
export const CANVAS_HEIGHT = 700;

export const CENTER_X = CANVAS_WIDTH / 2; // 450
export const CENTER_Y = CANVAS_HEIGHT / 2; // 350
export const ROAD_HALF_WIDTH = 70; // Road width is 140
export const LANE_OFFSET = 35; // Center of each lane

// Intersection bounds
export const INTERSECTION_LEFT = CENTER_X - ROAD_HALF_WIDTH; // 380
export const INTERSECTION_RIGHT = CENTER_X + ROAD_HALF_WIDTH; // 520
export const INTERSECTION_TOP = CENTER_Y - ROAD_HALF_WIDTH; // 280
export const INTERSECTION_BOTTOM = CENTER_Y + ROAD_HALF_WIDTH; // 420

// Stop line coordinates
export const STOP_LINES = {
  N: INTERSECTION_TOP - 6,    // 274
  S: INTERSECTION_BOTTOM + 6, // 426
  W: INTERSECTION_LEFT - 6,   // 374
  E: INTERSECTION_RIGHT + 6,  // 526
};

// Lane X or Y coordinates
export const LANES: Record<Direction, { inX: number; inY: number; dirX: number; dirY: number }> = {
  N: { inX: CENTER_X - LANE_OFFSET, inY: -80, dirX: 0, dirY: 1 },
  S: { inX: CENTER_X + LANE_OFFSET, inY: CANVAS_HEIGHT + 80, dirX: 0, dirY: -1 },
  W: { inX: -80, inY: CENTER_Y + LANE_OFFSET, dirX: 1, dirY: 0 },
  E: { inX: CANVAS_WIDTH + 80, inY: CENTER_Y - LANE_OFFSET, dirX: -1, dirY: 0 },
};

// Traffic light screen coordinates for drawing clickable poles
export const LIGHT_POST_POSITIONS: Record<Direction, { x: number; y: number; poleDir: string }> = {
  N: { x: CENTER_X - ROAD_HALF_WIDTH - 24, y: INTERSECTION_TOP - 20, poleDir: 'down' },
  S: { x: CENTER_X + ROAD_HALF_WIDTH + 24, y: INTERSECTION_BOTTOM + 20, poleDir: 'up' },
  W: { x: INTERSECTION_LEFT - 20, y: CENTER_Y + ROAD_HALF_WIDTH + 24, poleDir: 'right' },
  E: { x: INTERSECTION_RIGHT + 20, y: CENTER_Y - ROAD_HALF_WIDTH - 24, poleDir: 'left' },
};

export const VEHICLE_CONFIGS: Record<VehicleType, VehicleConfig> = {
  compact: {
    type: 'compact',
    name: 'Compact Car',
    length: 34,
    width: 20,
    maxSpeed: 2.3,
    accel: 0.08,
    brakeDecel: 0.16,
    emergency: false,
    color: '#3B82F6',
    roofColor: '#2563EB',
    spawnWeight: 35,
  },
  sedan: {
    type: 'sedan',
    name: 'Sedan',
    length: 44,
    width: 22,
    maxSpeed: 2.1,
    accel: 0.07,
    brakeDecel: 0.14,
    emergency: false,
    color: '#10B981',
    roofColor: '#059669',
    spawnWeight: 40,
  },
  taxi: {
    type: 'taxi',
    name: 'City Taxi',
    length: 42,
    width: 22,
    maxSpeed: 2.5,
    accel: 0.09,
    brakeDecel: 0.15,
    emergency: false,
    color: '#FBBF24',
    roofColor: '#D97706',
    spawnWeight: 25,
  },
  suv: {
    type: 'suv',
    name: 'SUV',
    length: 48,
    width: 24,
    maxSpeed: 2.0,
    accel: 0.065,
    brakeDecel: 0.13,
    emergency: false,
    color: '#8B5CF6',
    roofColor: '#7C3AED',
    spawnWeight: 25,
  },
  truck: {
    type: 'truck',
    name: 'Delivery Truck',
    length: 64,
    width: 26,
    maxSpeed: 1.6,
    accel: 0.04,
    brakeDecel: 0.09,
    emergency: false,
    color: '#6B7280',
    roofColor: '#4B5563',
    spawnWeight: 20,
  },
  bus: {
    type: 'bus',
    name: 'City Transit Bus',
    length: 74,
    width: 26,
    maxSpeed: 1.4,
    accel: 0.035,
    brakeDecel: 0.08,
    emergency: false,
    color: '#F97316',
    roofColor: '#EA580C',
    spawnWeight: 15,
  },
  ambulance: {
    type: 'ambulance',
    name: 'Ambulance',
    length: 52,
    width: 24,
    maxSpeed: 2.9,
    accel: 0.11,
    brakeDecel: 0.18,
    emergency: true,
    color: '#FFFFFF',
    roofColor: '#EF4444',
    spawnWeight: 12,
  },
  fire_truck: {
    type: 'fire_truck',
    name: 'Fire Engine',
    length: 76,
    width: 28,
    maxSpeed: 2.4,
    accel: 0.07,
    brakeDecel: 0.12,
    emergency: true,
    color: '#DC2626',
    roofColor: '#991B1B',
    spawnWeight: 10,
  },
  police: {
    type: 'police',
    name: 'Police Patrol',
    length: 46,
    width: 22,
    maxSpeed: 3.1,
    accel: 0.12,
    brakeDecel: 0.19,
    emergency: true,
    color: '#1E293B',
    roofColor: '#0F172A',
    spawnWeight: 12,
  },
};

export const VEHICLE_PALETTES = [
  '#2563EB', '#1D4ED8', '#0284C7', // Blues
  '#059669', '#10B981', '#047857', // Greens
  '#DC2626', '#E11D48', '#B91C1C', // Reds
  '#D97706', '#F59E0B', '#B45309', // Ambers
  '#7C3AED', '#6D28D9', '#8B5CF6', // Purples
  '#475569', '#334155', '#1E293B', // Slates
  '#E2E8F0', '#F1F5F9', '#CBD5E1', // Silvers / Whites
];

// Prescripted specs for Levels 1 - 10, with procedural generator for 11+
export function getLevelConfig(level: number): LevelConfig {
  if (level === 1) {
    return {
      level: 1,
      targetCars: 20,
      spawnIntervalMin: 2.6,
      spawnIntervalMax: 3.8,
      speedMultiplier: 0.9,
      weather: 'sunny',
      availableVehicles: ['compact', 'sedan'],
      emergencyChance: 0,
      eventChance: 0,
      description: 'Quiet morning traffic. Practice switching lights smoothly.',
    };
  }
  if (level === 2) {
    return {
      level: 2,
      targetCars: 30,
      spawnIntervalMin: 2.3,
      spawnIntervalMax: 3.3,
      speedMultiplier: 0.95,
      weather: 'sunny',
      availableVehicles: ['compact', 'sedan', 'taxi'],
      emergencyChance: 0,
      eventChance: 0,
      description: 'City taxis enter the roads. Slightly brisker flow.',
    };
  }
  if (level === 3) {
    return {
      level: 3,
      targetCars: 40,
      spawnIntervalMin: 2.0,
      spawnIntervalMax: 2.9,
      speedMultiplier: 1.0,
      weather: 'sunny',
      availableVehicles: ['compact', 'sedan', 'taxi', 'suv', 'truck'],
      emergencyChance: 0,
      eventChance: 0.15,
      description: 'Heavy cargo trucks arrive. Note their longer braking distance!',
    };
  }
  if (level === 4) {
    return {
      level: 4,
      targetCars: 50,
      spawnIntervalMin: 1.8,
      spawnIntervalMax: 2.6,
      speedMultiplier: 1.05,
      weather: 'dusk',
      availableVehicles: ['compact', 'sedan', 'taxi', 'suv', 'truck', 'bus'],
      emergencyChance: 0,
      eventChance: 0.25,
      description: 'Evening rush begins. Long city buses take more time to clear.',
    };
  }
  if (level === 5) {
    return {
      level: 5,
      targetCars: 60,
      spawnIntervalMin: 1.6,
      spawnIntervalMax: 2.4,
      speedMultiplier: 1.1,
      weather: 'sunny',
      availableVehicles: ['compact', 'sedan', 'taxi', 'truck', 'bus', 'ambulance'],
      emergencyChance: 0.18,
      eventChance: 0.35,
      description: 'Emergency ambulances active! Give priority clearance immediately.',
    };
  }
  if (level === 6) {
    return {
      level: 6,
      targetCars: 70,
      spawnIntervalMin: 1.5,
      spawnIntervalMax: 2.2,
      speedMultiplier: 1.12,
      weather: 'sunny',
      availableVehicles: ['compact', 'sedan', 'taxi', 'suv', 'truck', 'bus', 'ambulance', 'police'],
      emergencyChance: 0.22,
      eventChance: 0.4,
      description: 'Police pursuit units joined. Commuter traffic is dense.',
    };
  }
  if (level === 7) {
    return {
      level: 7,
      targetCars: 80,
      spawnIntervalMin: 1.4,
      spawnIntervalMax: 2.1,
      speedMultiplier: 1.15,
      weather: 'night',
      availableVehicles: ['compact', 'sedan', 'taxi', 'suv', 'truck', 'bus', 'ambulance', 'fire_truck', 'police'],
      emergencyChance: 0.25,
      eventChance: 0.45,
      description: 'Night shift mode. Watch illuminated headlights and street lamps.',
    };
  }
  if (level === 8) {
    return {
      level: 8,
      targetCars: 90,
      spawnIntervalMin: 1.35,
      spawnIntervalMax: 2.0,
      speedMultiplier: 1.15,
      weather: 'rain',
      availableVehicles: ['compact', 'sedan', 'taxi', 'suv', 'truck', 'bus', 'ambulance', 'fire_truck', 'police'],
      emergencyChance: 0.25,
      eventChance: 0.5,
      description: 'Rainfall makes asphalt slick. Brake distances increase slightly.',
    };
  }
  if (level === 9) {
    return {
      level: 9,
      targetCars: 100,
      spawnIntervalMin: 1.3,
      spawnIntervalMax: 1.9,
      speedMultiplier: 1.2,
      weather: 'dusk',
      availableVehicles: ['compact', 'sedan', 'taxi', 'suv', 'truck', 'bus', 'ambulance', 'fire_truck', 'police'],
      emergencyChance: 0.28,
      eventChance: 0.6,
      hasConstruction: true,
      description: 'Road work zone near intersection! Stay alert for cones and slowdowns.',
    };
  }
  if (level === 10) {
    return {
      level: 10,
      targetCars: 120,
      spawnIntervalMin: 1.15,
      spawnIntervalMax: 1.7,
      speedMultiplier: 1.25,
      weather: 'storm',
      availableVehicles: ['compact', 'sedan', 'taxi', 'suv', 'truck', 'bus', 'ambulance', 'fire_truck', 'police'],
      emergencyChance: 0.32,
      eventChance: 0.7,
      description: 'Severe thunderstorm during peak rush hour! Maximum vigilance required.',
    };
  }

  // Procedural scaling for Level 11+
  const cycleWeather: WeatherType[] = ['sunny', 'dusk', 'night', 'rain', 'storm'];
  const weather = cycleWeather[(level - 1) % cycleWeather.length];
  
  // Fairly bounded spawn rate: never drops below 0.85s to ensure playable spacing
  const minInterval = Math.max(0.85, 1.3 - (level - 10) * 0.02);
  const maxInterval = Math.max(1.3, 1.8 - (level - 10) * 0.025);
  const speedMult = Math.min(1.45, 1.25 + (level - 10) * 0.01);
  const targetCars = Math.min(250, 120 + (level - 10) * 15);

  return {
    level,
    targetCars,
    spawnIntervalMin: minInterval,
    spawnIntervalMax: maxInterval,
    speedMultiplier: speedMult,
    weather,
    availableVehicles: ['compact', 'sedan', 'taxi', 'suv', 'truck', 'bus', 'ambulance', 'fire_truck', 'police'],
    emergencyChance: Math.min(0.4, 0.32 + (level - 10) * 0.008),
    eventChance: Math.min(0.8, 0.7 + (level - 10) * 0.01),
    hasConstruction: level % 3 === 0,
    description: `Level ${level} - Endless Mastery (${weather.toUpperCase()}). High density traffic stream.`,
  };
}
