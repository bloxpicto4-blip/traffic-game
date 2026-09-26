import {
  Direction,
  LevelConfig,
  TrafficLightGroup,
  Vehicle,
  VehicleConfig,
  VehicleType,
} from './types';
import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  CENTER_X,
  CENTER_Y,
  LANES,
  STOP_LINES,
  VEHICLE_CONFIGS,
  VEHICLE_PALETTES,
} from './constants';
import { soundEngine } from './audio';

let vehicleCounter = 0;

export function spawnVehicle(
  direction: Direction,
  levelConfig: LevelConfig,
  forceEmergency?: boolean,
  forceType?: VehicleType
): Vehicle {
  vehicleCounter++;
  const id = `veh_${vehicleCounter}_${Date.now()}`;

  let selectedType: VehicleType;

  if (forceType) {
    selectedType = forceType;
  } else if (forceEmergency) {
    const emergTypes: VehicleType[] = ['ambulance', 'fire_truck', 'police'];
    selectedType = emergTypes[Math.floor(Math.random() * emergTypes.length)];
  } else {
    // Select from available vehicles based on spawn weights
    const available = levelConfig.availableVehicles;
    const pool: VehicleType[] = [];
    available.forEach((t) => {
      const cfg = VEHICLE_CONFIGS[t];
      // If emergency vehicles are enabled, only spawn if roll succeeds
      if (cfg.emergency) {
        if (Math.random() < levelConfig.emergencyChance) {
          pool.push(t);
        }
      } else {
        const weight = Math.ceil(cfg.spawnWeight / 5);
        for (let i = 0; i < weight; i++) {
          pool.push(t);
        }
      }
    });

    selectedType = pool.length > 0 ? pool[Math.floor(Math.random() * pool.length)] : 'sedan';
  }

  const cfg: VehicleConfig = VEHICLE_CONFIGS[selectedType];
  const lane = LANES[direction];

  // Pick realistic paint colors
  const color = cfg.emergency ? cfg.color : VEHICLE_PALETTES[Math.floor(Math.random() * VEHICLE_PALETTES.length)];
  const roofColor = cfg.emergency ? cfg.roofColor : color;

  // Apply level speed multiplier
  const effectiveMaxSpeed = cfg.maxSpeed * levelConfig.speedMultiplier * (0.95 + Math.random() * 0.1);

  return {
    id,
    type: selectedType,
    direction,
    x: lane.inX,
    y: lane.inY,
    speed: effectiveMaxSpeed * 0.85,
    maxSpeed: effectiveMaxSpeed,
    accel: cfg.accel,
    brakeDecel: cfg.brakeDecel * (levelConfig.weather === 'rain' || levelConfig.weather === 'storm' ? 0.78 : 1.0),
    length: cfg.length,
    width: cfg.width,
    color,
    roofColor,
    emergency: cfg.emergency,
    hasCrossedStopLine: false,
    hasClearedIntersection: false,
    hasExited: false,
    isBraking: false,
    isCrashed: false,
    isBrokenDown: false,
    hazardBlink: false,
    sirenPhase: Math.random() * 10,
    timeAlive: 0,
    hornCooldown: 2 + Math.random() * 3,
  };
}

// Distance from front of car to a point along the lane
export function getFrontCoord(v: Vehicle): { x: number; y: number } {
  const halfLen = v.length / 2;
  switch (v.direction) {
    case 'N': return { x: v.x, y: v.y + halfLen };
    case 'S': return { x: v.x, y: v.y - halfLen };
    case 'W': return { x: v.x + halfLen, y: v.y };
    case 'E': return { x: v.x - halfLen, y: v.y };
  }
}

export function updateVehicles(
  vehicles: Vehicle[],
  lights: Record<Direction, TrafficLightGroup>,
  dt: number,
  hasConstruction?: boolean
): {
  activeVehicles: Vehicle[];
  safePasses: Vehicle[];
  screeches: boolean;
} {
  let hasScreech = false;
  const safePasses: Vehicle[] = [];

  // Group vehicles by direction and sort from front (closest to exit) to back (at spawn)
  const byDir: Record<Direction, Vehicle[]> = { N: [], S: [], E: [], W: [] };
  vehicles.forEach((v) => {
    byDir[v.direction].push(v);
  });

  // Sort: front vehicles come first
  byDir.N.sort((a, b) => b.y - a.y);
  byDir.S.sort((a, b) => a.y - b.y);
  byDir.W.sort((a, b) => b.x - a.x);
  byDir.E.sort((a, b) => a.x - b.x);

  // Update each lane
  (['N', 'S', 'E', 'W'] as Direction[]).forEach((dir) => {
    const laneVehicles = byDir[dir];
    const light = lights[dir];
    const stopLine = STOP_LINES[dir];

    for (let i = 0; i < laneVehicles.length; i++) {
      const v = laneVehicles[i];
      if (v.isCrashed) continue;

      v.timeAlive += dt;
      v.sirenPhase += dt * 8;
      if (v.isBrokenDown) {
        v.hazardBlink = Math.sin(v.timeAlive * 8) > 0;
        v.speed = 0;
        continue;
      }

      // Check distance to stop line
      const front = getFrontCoord(v);
      let distToStopLine = 9999;
      let pastStopLine = false;

      switch (dir) {
        case 'N':
          distToStopLine = stopLine - front.y;
          pastStopLine = front.y >= stopLine;
          break;
        case 'S':
          distToStopLine = front.y - stopLine;
          pastStopLine = front.y <= stopLine;
          break;
        case 'W':
          distToStopLine = stopLine - front.x;
          pastStopLine = front.x >= stopLine;
          break;
        case 'E':
          distToStopLine = front.x - stopLine;
          pastStopLine = front.x <= stopLine;
          break;
      }

      if (pastStopLine && !v.hasCrossedStopLine) {
        v.hasCrossedStopLine = true;
      }

      // Check clearance of intersection box
      if (!v.hasClearedIntersection && v.hasCrossedStopLine) {
        let cleared = false;
        switch (dir) {
          case 'N': cleared = v.y - v.length / 2 > CENTER_Y + 70; break;
          case 'S': cleared = v.y + v.length / 2 < CENTER_Y - 70; break;
          case 'W': cleared = v.x - v.length / 2 > CENTER_X + 70; break;
          case 'E': cleared = v.x + v.length / 2 < CENTER_X - 70; break;
        }
        if (cleared) {
          v.hasClearedIntersection = true;
          safePasses.push(v);
        }
      }

      // Check exit from screen
      let exited = false;
      const margin = 90;
      switch (dir) {
        case 'N': exited = v.y > CANVAS_HEIGHT + margin; break;
        case 'S': exited = v.y < -margin; break;
        case 'W': exited = v.x > CANVAS_WIDTH + margin; break;
        case 'E': exited = v.x < -margin; break;
      }
      if (exited) {
        v.hasExited = true;
      }

      // Target speed calculation
      let targetSpeed = v.maxSpeed;

      // Construction slowdown in approach zone
      if (hasConstruction && dir === 'W' && distToStopLine > 0 && distToStopLine < 180) {
        targetSpeed = Math.min(targetSpeed, 1.0);
      }

      // 1. Follow car ahead in same lane
      const carAhead = i > 0 ? laneVehicles[i - 1] : null;
      if (carAhead) {
        let gap = 9999;
        switch (dir) {
          case 'N': gap = (carAhead.y - carAhead.length / 2) - front.y; break;
          case 'S': gap = front.y - (carAhead.y + carAhead.length / 2); break;
          case 'W': gap = (carAhead.x - carAhead.length / 2) - front.x; break;
          case 'E': gap = front.x - (carAhead.x + carAhead.length / 2); break;
        }

        const safeDistance = v.length * 0.45 + 14;
        const slowDownThreshold = safeDistance + 50;

        if (gap < safeDistance) {
          targetSpeed = 0;
        } else if (gap < slowDownThreshold) {
          const ratio = (gap - safeDistance) / (slowDownThreshold - safeDistance);
          targetSpeed = Math.min(targetSpeed, carAhead.speed * ratio);
        }
      }

      // 2. Traffic Light obedience (only if car has NOT crossed stop line yet)
      if (!v.hasCrossedStopLine && distToStopLine > -5) {
        if (light.color === 'RED') {
          // Calculate stopping buffer
          const stoppingDist = (v.speed * v.speed) / (2 * v.brakeDecel) + 10;
          if (distToStopLine < Math.max(stoppingDist, 70)) {
            // Need to stop before stopLine
            if (distToStopLine <= 4) {
              targetSpeed = 0;
            } else {
              targetSpeed = Math.min(targetSpeed, Math.max(0, (distToStopLine / 60) * v.maxSpeed));
            }
          }
        } else if (light.color === 'YELLOW') {
          // Yellow dilemma zone physics:
          // If already close and fast enough that stopping would require severe skidding, continue through!
          const minStoppingDist = (v.speed * v.speed) / (2 * v.brakeDecel) + 5;
          if (distToStopLine > minStoppingDist + 20) {
            // Can stop comfortably
            targetSpeed = Math.min(targetSpeed, Math.max(0, (distToStopLine / 70) * v.maxSpeed));
          } else {
            // Committed to clearing intersection
            targetSpeed = v.maxSpeed;
          }
        }
      }

      // Apply acceleration / deceleration
      const prevSpeed = v.speed;
      if (v.speed < targetSpeed) {
        v.speed = Math.min(v.speed + v.accel * (dt * 60), targetSpeed);
        v.isBraking = false;
      } else if (v.speed > targetSpeed) {
        const decel = v.brakeDecel * (dt * 60);
        v.speed = Math.max(0, v.speed - decel);
        v.isBraking = prevSpeed - v.speed > 0.04;
        if (v.isBraking && v.speed > 1.2) {
          hasScreech = true;
        }
      } else {
        v.isBraking = false;
      }

      // Horn honk if stuck behind stopped car when light is GREEN
      if (v.speed < 0.2 && carAhead && light.color === 'GREEN') {
        v.hornCooldown -= dt;
        if (v.hornCooldown <= 0) {
          soundEngine.playHorn();
          v.hornCooldown = 4 + Math.random() * 5;
        }
      }

      // Move vehicle
      const moveDist = v.speed * (dt * 60);
      switch (dir) {
        case 'N': v.y += moveDist; break;
        case 'S': v.y -= moveDist; break;
        case 'W': v.x += moveDist; break;
        case 'E': v.x -= moveDist; break;
      }
    }
  });

  const activeVehicles = vehicles.filter((v) => !v.hasExited);
  return { activeVehicles, safePasses, screeches: hasScreech };
}
