import {
  ActiveEvent,
  Direction,
  FloatingText,
  Particle,
  SkidMark,
  TrafficLightGroup,
  Vehicle,
  WeatherType,
} from './types';
import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  CENTER_X,
  CENTER_Y,
  INTERSECTION_BOTTOM,
  INTERSECTION_LEFT,
  INTERSECTION_RIGHT,
  INTERSECTION_TOP,
  LIGHT_POST_POSITIONS,
  ROAD_HALF_WIDTH,
  STOP_LINES,
} from './constants';

export class GameRenderer {
  private ctx: CanvasRenderingContext2D;
  private rainDrops: { x: number; y: number; speed: number; length: number }[] = [];
  private lightningAlpha = 0;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
    // Pre-populate rain drops
    for (let i = 0; i < 180; i++) {
      this.rainDrops.push({
        x: Math.random() * CANVAS_WIDTH,
        y: Math.random() * CANVAS_HEIGHT,
        speed: 16 + Math.random() * 8,
        length: 12 + Math.random() * 10,
      });
    }
  }

  public render(
    vehicles: Vehicle[],
    lights: Record<Direction, TrafficLightGroup>,
    weather: WeatherType,
    particles: Particle[],
    skidMarks: SkidMark[],
    floatingTexts: FloatingText[],
    activeEvent: ActiveEvent | null,
    hasConstruction?: boolean
  ) {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // 1. Base Ground & City Corners
    this.drawTerrainAndBuildings(weather);

    // 2. Roads, Crosswalks, Lane Markings
    this.drawRoadsAndMarkings(hasConstruction);

    // 3. Skid Marks
    this.drawSkidMarks(skidMarks);

    // 4. Street Lamps (Poles & Ground Glow)
    this.drawStreetLamps(weather);

    // 5. Vehicles (Body, Headlights, Tail Lights)
    this.drawVehicles(vehicles, weather);

    // 6. Traffic Lights (Poles, Housings, Lamps)
    this.drawTrafficLights(lights);

    // 7. Active Event Warning Indicators
    if (activeEvent) {
      this.drawEventIndicators(activeEvent);
    }

    // 8. Particles (Crash, Smoke, Sparks, Confetti)
    this.drawParticles(particles);

    // 9. Weather Atmosphere (Night Lighting, Rain, Storm Lightning)
    this.drawWeatherOverlay(vehicles, weather);

    // 10. Floating Score & Warning Texts
    this.drawFloatingTexts(floatingTexts);
  }

  private drawTerrainAndBuildings(weather: WeatherType) {
    const ctx = this.ctx;
    const isNight = weather === 'night' || weather === 'storm';

    // Grass / Ground base
    ctx.fillStyle = isNight ? '#16281E' : '#2D4A2F';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Sidewalk border around the 4 city blocks
    ctx.fillStyle = isNight ? '#33383F' : '#94A3B8';
    // NW block
    ctx.fillRect(0, 0, INTERSECTION_LEFT, INTERSECTION_TOP);
    // NE block
    ctx.fillRect(INTERSECTION_RIGHT, 0, CANVAS_WIDTH - INTERSECTION_RIGHT, INTERSECTION_TOP);
    // SW block
    ctx.fillRect(0, INTERSECTION_BOTTOM, INTERSECTION_LEFT, CANVAS_HEIGHT - INTERSECTION_BOTTOM);
    // SE block
    ctx.fillRect(INTERSECTION_RIGHT, INTERSECTION_BOTTOM, CANVAS_WIDTH - INTERSECTION_RIGHT, CANVAS_HEIGHT - INTERSECTION_BOTTOM);

    // Inner building parcels
    const bColor = isNight ? '#1E242B' : '#475569';
    const bTrim = isNight ? '#2B3540' : '#64748B';

    // NW Building
    this.drawBuilding(20, 20, INTERSECTION_LEFT - 40, INTERSECTION_TOP - 40, bColor, bTrim, isNight);
    // NE Building
    this.drawBuilding(INTERSECTION_RIGHT + 20, 20, CANVAS_WIDTH - INTERSECTION_RIGHT - 40, INTERSECTION_TOP - 40, bColor, bTrim, isNight);
    // SW Building
    this.drawBuilding(20, INTERSECTION_BOTTOM + 20, INTERSECTION_LEFT - 40, CANVAS_HEIGHT - INTERSECTION_BOTTOM - 40, bColor, bTrim, isNight);
    // SE Building
    this.drawBuilding(INTERSECTION_RIGHT + 20, INTERSECTION_BOTTOM + 20, CANVAS_WIDTH - INTERSECTION_RIGHT - 40, CANVAS_HEIGHT - INTERSECTION_BOTTOM - 40, bColor, bTrim, isNight);

    // Trees on sidewalk corners
    this.drawTree(INTERSECTION_LEFT - 26, INTERSECTION_TOP - 26, isNight);
    this.drawTree(INTERSECTION_RIGHT + 26, INTERSECTION_TOP - 26, isNight);
    this.drawTree(INTERSECTION_LEFT - 26, INTERSECTION_BOTTOM + 26, isNight);
    this.drawTree(INTERSECTION_RIGHT + 26, INTERSECTION_BOTTOM + 26, isNight);
  }

  private drawBuilding(x: number, y: number, w: number, h: number, bg: string, trim: string, isNight: boolean) {
    const ctx = this.ctx;
    // Building roof
    ctx.fillStyle = bg;
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = trim;
    ctx.lineWidth = 3;
    ctx.strokeRect(x, y, w, h);

    // Architectural roof features (AC units, vents)
    ctx.fillStyle = isNight ? '#13181E' : '#334155';
    ctx.fillRect(x + 20, y + 20, 40, 28);
    ctx.fillRect(x + w - 60, y + h - 50, 45, 30);

    // Windows with warm light at night
    if (isNight) {
      ctx.fillStyle = 'rgba(251, 191, 36, 0.4)';
      const winW = 12;
      const winH = 8;
      for (let wx = x + 15; wx < x + w - 20; wx += 24) {
        for (let wy = y + 60; wy < y + h - 40; wy += 28) {
          if (Math.sin(wx * 11 + wy) > -0.2) {
            ctx.fillRect(wx, wy, winW, winH);
          }
        }
      }
    }
  }

  private drawTree(x: number, y: number, isNight: boolean) {
    const ctx = this.ctx;
    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.beginPath();
    ctx.ellipse(x + 4, y + 4, 18, 14, 0, 0, Math.PI * 2);
    ctx.fill();

    // Canopy
    ctx.fillStyle = isNight ? '#122E1A' : '#15803D';
    ctx.beginPath();
    ctx.arc(x, y, 16, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = isNight ? '#173D23' : '#22C55E';
    ctx.beginPath();
    ctx.arc(x - 3, y - 3, 11, 0, Math.PI * 2);
    ctx.fill();
  }

  private drawRoadsAndMarkings(hasConstruction?: boolean) {
    const ctx = this.ctx;

    // Asphalt base
    ctx.fillStyle = '#1E232A'; // Dark rich asphalt
    // Vertical road
    ctx.fillRect(CENTER_X - ROAD_HALF_WIDTH, 0, ROAD_HALF_WIDTH * 2, CANVAS_HEIGHT);
    // Horizontal road
    ctx.fillRect(0, CENTER_Y - ROAD_HALF_WIDTH, CANVAS_WIDTH, ROAD_HALF_WIDTH * 2);

    // Subtle road borders / curb edges
    ctx.strokeStyle = '#64748B';
    ctx.lineWidth = 2;
    // NW corner
    ctx.strokeRect(0, 0, INTERSECTION_LEFT, INTERSECTION_TOP);
    // NE corner
    ctx.strokeRect(INTERSECTION_RIGHT, 0, CANVAS_WIDTH - INTERSECTION_RIGHT, INTERSECTION_TOP);
    // SW corner
    ctx.strokeRect(0, INTERSECTION_BOTTOM, INTERSECTION_LEFT, CANVAS_HEIGHT - INTERSECTION_BOTTOM);
    // SE corner
    ctx.strokeRect(INTERSECTION_RIGHT, INTERSECTION_BOTTOM, CANVAS_WIDTH - INTERSECTION_RIGHT, CANVAS_HEIGHT - INTERSECTION_BOTTOM);

    // Crosswalk Zebra Stripes
    ctx.fillStyle = '#CBD5E1';
    const stripeW = 8;
    const stripeGap = 6;

    // North crosswalk
    for (let x = INTERSECTION_LEFT + 4; x < INTERSECTION_RIGHT - 4; x += stripeW + stripeGap) {
      ctx.fillRect(x, INTERSECTION_TOP - 18, stripeW, 14);
    }
    // South crosswalk
    for (let x = INTERSECTION_LEFT + 4; x < INTERSECTION_RIGHT - 4; x += stripeW + stripeGap) {
      ctx.fillRect(x, INTERSECTION_BOTTOM + 4, stripeW, 14);
    }
    // West crosswalk
    for (let y = INTERSECTION_TOP + 4; y < INTERSECTION_BOTTOM - 4; y += stripeW + stripeGap) {
      ctx.fillRect(INTERSECTION_LEFT - 18, y, 14, stripeW);
    }
    // East crosswalk
    for (let y = INTERSECTION_TOP + 4; y < INTERSECTION_BOTTOM - 4; y += stripeW + stripeGap) {
      ctx.fillRect(INTERSECTION_RIGHT + 4, y, 14, stripeW);
    }

    // Stop Bar Lines (Thick white line where cars must stop)
    ctx.fillStyle = '#F8FAFC';
    // North stop bar (for incoming southbound traffic on left side)
    ctx.fillRect(CENTER_X - ROAD_HALF_WIDTH, STOP_LINES.N, ROAD_HALF_WIDTH, 5);
    // South stop bar (for incoming northbound traffic on right side)
    ctx.fillRect(CENTER_X, STOP_LINES.S - 5, ROAD_HALF_WIDTH, 5);
    // West stop bar (for incoming eastbound traffic on bottom side)
    ctx.fillRect(STOP_LINES.W, CENTER_Y, 5, ROAD_HALF_WIDTH);
    // East stop bar (for incoming westbound traffic on top side)
    ctx.fillRect(STOP_LINES.E - 5, CENTER_Y - ROAD_HALF_WIDTH, 5, ROAD_HALF_WIDTH);

    // Double Yellow Center Medians
    ctx.strokeStyle = '#F59E0B';
    ctx.lineWidth = 2;
    // North road median
    this.drawDoubleLine(CENTER_X, 0, CENTER_X, INTERSECTION_TOP - 22, 4);
    // South road median
    this.drawDoubleLine(CENTER_X, INTERSECTION_BOTTOM + 22, CENTER_X, CANVAS_HEIGHT, 4);
    // West road median
    this.drawDoubleLine(0, CENTER_Y, INTERSECTION_LEFT - 22, CENTER_Y, 4, true);
    // East road median
    this.drawDoubleLine(INTERSECTION_RIGHT + 22, CENTER_Y, CANVAS_WIDTH, CENTER_Y, 4, true);

    // White Lane Divider Dashes
    ctx.strokeStyle = '#94A3B8';
    ctx.lineWidth = 2;
    ctx.setLineDash([12, 14]);

    // North-South center dashes through intersection
    ctx.beginPath();
    ctx.moveTo(CENTER_X, INTERSECTION_TOP);
    ctx.lineTo(CENTER_X, INTERSECTION_BOTTOM);
    ctx.stroke();

    // East-West center dashes through intersection
    ctx.beginPath();
    ctx.moveTo(INTERSECTION_LEFT, CENTER_Y);
    ctx.lineTo(INTERSECTION_RIGHT, CENTER_Y);
    ctx.stroke();

    ctx.setLineDash([]); // Reset line dash

    // Road Construction Zone (if enabled)
    if (hasConstruction) {
      // Draw traffic cones in the West incoming lane approach
      const coneXStart = INTERSECTION_LEFT - 120;
      const coneY = CENTER_Y + 20;
      for (let i = 0; i < 5; i++) {
        const cx = coneXStart + i * 22;
        // Orange traffic cone base
        ctx.fillStyle = '#EA580C';
        ctx.beginPath();
        ctx.arc(cx, coneY, 7, 0, Math.PI * 2);
        ctx.fill();
        // White reflective ring
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(cx, coneY, 4, 0, Math.PI * 2);
        ctx.fill();
      }
      // "ROAD WORK" hazard board
      ctx.fillStyle = '#D97706';
      ctx.fillRect(coneXStart - 35, coneY - 12, 28, 24);
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 8px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('WORK', coneXStart - 21, coneY + 3);
    }
  }

  private drawDoubleLine(x1: number, y1: number, x2: number, y2: number, offset: number, horizontal = false) {
    const ctx = this.ctx;
    ctx.beginPath();
    if (horizontal) {
      ctx.moveTo(x1, y1 - offset / 2);
      ctx.lineTo(x2, y2 - offset / 2);
      ctx.moveTo(x1, y1 + offset / 2);
      ctx.lineTo(x2, y2 + offset / 2);
    } else {
      ctx.moveTo(x1 - offset / 2, y1);
      ctx.lineTo(x2 - offset / 2, y2);
      ctx.moveTo(x1 + offset / 2, y1);
      ctx.lineTo(x2 + offset / 2, y2);
    }
    ctx.stroke();
  }

  private drawSkidMarks(skidMarks: SkidMark[]) {
    const ctx = this.ctx;
    ctx.lineWidth = 4;
    skidMarks.forEach((s) => {
      ctx.strokeStyle = `rgba(15, 23, 42, ${s.alpha * 0.7})`;
      ctx.beginPath();
      ctx.moveTo(s.x1, s.y1);
      ctx.lineTo(s.x2, s.y2);
      ctx.stroke();
    });
  }

  private drawStreetLamps(weather: WeatherType) {
    const ctx = this.ctx;
    const isNight = weather === 'night' || weather === 'storm' || weather === 'dusk';
    const lampCoords = [
      { x: INTERSECTION_LEFT - 12, y: INTERSECTION_TOP - 12 },
      { x: INTERSECTION_RIGHT + 12, y: INTERSECTION_TOP - 12 },
      { x: INTERSECTION_LEFT - 12, y: INTERSECTION_BOTTOM + 12 },
      { x: INTERSECTION_RIGHT + 12, y: INTERSECTION_BOTTOM + 12 },
    ];

    lampCoords.forEach((lp) => {
      // Glow pool on road at night
      if (isNight) {
        const rad = ctx.createRadialGradient(lp.x, lp.y, 5, lp.x, lp.y, 85);
        rad.addColorStop(0, 'rgba(254, 240, 138, 0.35)');
        rad.addColorStop(0.5, 'rgba(254, 240, 138, 0.12)');
        rad.addColorStop(1, 'rgba(254, 240, 138, 0)');
        ctx.fillStyle = rad;
        ctx.beginPath();
        ctx.arc(lp.x, lp.y, 85, 0, Math.PI * 2);
        ctx.fill();
      }

      // Lamp post pole & fixture
      ctx.fillStyle = '#334155';
      ctx.beginPath();
      ctx.arc(lp.x, lp.y, 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = isNight ? '#FEF08A' : '#CBD5E1';
      ctx.beginPath();
      ctx.arc(lp.x, lp.y, 2.5, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  private drawVehicles(vehicles: Vehicle[], weather: WeatherType) {
    const ctx = this.ctx;
    const isNight = weather === 'night' || weather === 'storm';

    vehicles.forEach((v) => {
      ctx.save();
      ctx.translate(v.x, v.y);

      // Rotate canvas according to vehicle travel direction
      let angle = 0;
      switch (v.direction) {
        case 'N': angle = Math.PI / 2; break; // Downwards
        case 'S': angle = -Math.PI / 2; break; // Upwards
        case 'W': angle = 0; break; // Rightwards
        case 'E': angle = Math.PI; break; // Leftwards
      }
      ctx.rotate(angle);

      const halfL = v.length / 2;
      const halfW = v.width / 2;

      // 1. Vehicle Drop Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.beginPath();
      ctx.roundRect(-halfL + 2, -halfW + 3, v.length, v.width, 4);
      ctx.fill();

      // 2. Wheels / Tires
      ctx.fillStyle = '#0F172A';
      const tireL = 8;
      const tireW = 4;
      // Front wheels
      ctx.fillRect(halfL - 10, -halfW - 1, tireL, tireW);
      ctx.fillRect(halfL - 10, halfW - 3, tireL, tireW);
      // Rear wheels
      ctx.fillRect(-halfL + 3, -halfW - 1, tireL, tireW);
      ctx.fillRect(-halfL + 3, halfW - 3, tireL, tireW);

      // 3. Main Car Body
      ctx.fillStyle = v.color;
      ctx.beginPath();
      ctx.roundRect(-halfL, -halfW, v.length, v.width, 5);
      ctx.fill();

      // Body highlight / stroke
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // 4. Roof & Cabin
      const cabinL = v.length * 0.55;
      const cabinW = v.width * 0.78;
      const cabinX = -halfL + v.length * 0.22;
      const cabinY = -cabinW / 2;

      // Windshield & Rear glass (tinted dark glass)
      ctx.fillStyle = '#0F172A';
      ctx.beginPath();
      ctx.roundRect(cabinX - 2, cabinY - 1, cabinL + 4, cabinW + 2, 3);
      ctx.fill();

      // Roof paint
      ctx.fillStyle = v.roofColor;
      ctx.beginPath();
      ctx.roundRect(cabinX + 4, cabinY + 2, cabinL - 8, cabinW - 4, 3);
      ctx.fill();

      // 5. Special Vehicle Features
      if (v.type === 'taxi') {
        // Taxi roof light
        ctx.fillStyle = '#FBBF24';
        ctx.fillRect(-2, -5, 6, 10);
        ctx.fillStyle = '#000000';
        ctx.fillRect(-1, -4, 4, 8);
      } else if (v.type === 'ambulance') {
        // Red cross on roof
        ctx.fillStyle = '#EF4444';
        ctx.fillRect(-2, -6, 5, 12);
        ctx.fillRect(-5, -2, 11, 4);
      } else if (v.type === 'bus') {
        // Passenger window rows
        ctx.fillStyle = '#E2E8F0';
        for (let bx = -halfL + 10; bx < halfL - 10; bx += 10) {
          ctx.fillRect(bx, -halfW + 2, 6, 2);
          ctx.fillRect(bx, halfW - 4, 6, 2);
        }
      }

      // 6. Emergency Strobing Lightbar
      if (v.emergency) {
        const strobe = Math.floor(v.sirenPhase) % 2 === 0;
        // Left light (Red)
        ctx.fillStyle = strobe ? '#EF4444' : '#1D4ED8';
        ctx.fillRect(2, -7, 5, 6);
        // Right light (Blue)
        ctx.fillStyle = strobe ? '#3B82F6' : '#EF4444';
        ctx.fillRect(2, 1, 5, 6);

        // Flashing light glow halo
        ctx.fillStyle = strobe ? 'rgba(239, 68, 68, 0.45)' : 'rgba(59, 130, 246, 0.45)';
        ctx.beginPath();
        ctx.arc(4, 0, 22, 0, Math.PI * 2);
        ctx.fill();
      }

      // 7. Hazard Flashers (if broken down)
      if (v.hazardBlink) {
        ctx.fillStyle = '#F59E0B';
        // Front corners
        ctx.fillRect(halfL - 2, -halfW, 3, 3);
        ctx.fillRect(halfL - 2, halfW - 3, 3, 3);
        // Rear corners
        ctx.fillRect(-halfL, -halfW, 3, 3);
        ctx.fillRect(-halfL, halfW - 3, 3, 3);
      }

      // 8. Tail Lights (Bright red glow if braking)
      if (v.isBraking) {
        ctx.fillStyle = '#EF4444';
        ctx.fillRect(-halfL - 1, -halfW + 1, 3, 4);
        ctx.fillRect(-halfL - 1, halfW - 5, 3, 4);

        // Brake glow halos
        ctx.fillStyle = 'rgba(239, 68, 68, 0.5)';
        ctx.beginPath();
        ctx.arc(-halfL, -halfW + 3, 8, 0, Math.PI * 2);
        ctx.arc(-halfL, halfW - 3, 8, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillStyle = '#7F1D1D';
        ctx.fillRect(-halfL, -halfW + 1, 2, 3);
        ctx.fillRect(-halfL, halfW - 4, 2, 3);
      }

      // 9. Headlights (Physical bulbs)
      ctx.fillStyle = '#FEF08A';
      ctx.fillRect(halfL - 2, -halfW + 1, 2, 3);
      ctx.fillRect(halfL - 2, halfW - 4, 2, 3);

      // 10. Headlight Light Beams (in dark or stormy weather)
      if (isNight) {
        ctx.save();
        const beamGrad = ctx.createLinearGradient(halfL, 0, halfL + 120, 0);
        beamGrad.addColorStop(0, 'rgba(254, 240, 138, 0.55)');
        beamGrad.addColorStop(0.3, 'rgba(254, 240, 138, 0.25)');
        beamGrad.addColorStop(1, 'rgba(254, 240, 138, 0)');

        ctx.fillStyle = beamGrad;
        // Upper cone
        ctx.beginPath();
        ctx.moveTo(halfL, -halfW + 2);
        ctx.lineTo(halfL + 120, -halfW - 22);
        ctx.lineTo(halfL + 120, -halfW + 12);
        ctx.closePath();
        ctx.fill();

        // Lower cone
        ctx.beginPath();
        ctx.moveTo(halfL, halfW - 2);
        ctx.lineTo(halfL + 120, halfW - 12);
        ctx.lineTo(halfL + 120, halfW + 22);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }

      ctx.restore();
    });
  }

  private drawTrafficLights(lights: Record<Direction, TrafficLightGroup>) {
    const ctx = this.ctx;

    (['N', 'S', 'E', 'W'] as Direction[]).forEach((dir) => {
      const pos = LIGHT_POST_POSITIONS[dir];
      const light = lights[dir];

      ctx.save();
      ctx.translate(pos.x, pos.y);

      // Light Pole / Base
      ctx.fillStyle = '#334155';
      ctx.fillRect(-3, -3, 6, 6);

      // Housing dimensions (standard 3-lamp vertical or horizontal head)
      const isVertical = dir === 'N' || dir === 'S';
      const boxW = isVertical ? 16 : 38;
      const boxH = isVertical ? 38 : 16;
      const boxX = -boxW / 2;
      const boxY = -boxH / 2;

      // Housing box
      ctx.fillStyle = '#0F172A';
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(boxX, boxY, boxW, boxH, 4);
      ctx.fill();
      ctx.stroke();

      // Visors / Hoods
      // Three lamps: Red, Yellow, Green
      const lampRadius = 4.5;
      const positions = isVertical
        ? [
            { x: 0, y: -11, color: 'RED' },
            { x: 0, y: 0, color: 'YELLOW' },
            { x: 0, y: 11, color: 'GREEN' },
          ]
        : [
            { x: -11, y: 0, color: 'RED' },
            { x: 0, y: 0, color: 'YELLOW' },
            { x: 11, y: 0, color: 'GREEN' },
          ];

      positions.forEach((lp) => {
        const isActive = light.color === lp.color;
        let fillColor = '#1E293B'; // Dim unlit bulb

        if (lp.color === 'RED') {
          fillColor = isActive ? '#EF4444' : '#450A0A';
        } else if (lp.color === 'YELLOW') {
          fillColor = isActive ? '#FBBF24' : '#451A03';
        } else if (lp.color === 'GREEN') {
          fillColor = isActive ? '#10B981' : '#022C22';
        }

        // Active lamp glow halo
        if (isActive) {
          const haloColor =
            lp.color === 'RED'
              ? 'rgba(239, 68, 68, 0.45)'
              : lp.color === 'YELLOW'
              ? 'rgba(251, 191, 36, 0.45)'
              : 'rgba(16, 185, 129, 0.45)';

          ctx.fillStyle = haloColor;
          ctx.beginPath();
          ctx.arc(lp.x, lp.y, 14, 0, Math.PI * 2);
          ctx.fill();
        }

        // Lamp bulb
        ctx.fillStyle = fillColor;
        ctx.beginPath();
        ctx.arc(lp.x, lp.y, lampRadius, 0, Math.PI * 2);
        ctx.fill();

        // Bulb glass specular reflection
        if (isActive) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
          ctx.beginPath();
          ctx.arc(lp.x - 1.5, lp.y - 1.5, 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Direction Badge next to light (e.g. "NORTH", "SOUTH")
      ctx.fillStyle = '#CBD5E1';
      ctx.font = 'bold 9px monospace';
      ctx.textAlign = 'center';
      const labelY = isVertical ? boxY + boxH + 11 : boxY + boxH + 12;
      ctx.fillText(dir, 0, labelY);

      // Yellow clearance timer ring
      if (light.color === 'YELLOW') {
        ctx.strokeStyle = '#FBBF24';
        ctx.lineWidth = 2;
        ctx.beginPath();
        const progress = light.yellowTimer / 1.4;
        ctx.arc(0, 0, 18, -Math.PI / 2, -Math.PI / 2 + progress * Math.PI * 2);
        ctx.stroke();
      }

      ctx.restore();
    });
  }

  private drawEventIndicators(event: ActiveEvent) {
    const ctx = this.ctx;
    // Flashing radar warning banner on the road origin if direction is specified
    if (event.direction) {
      const dir = event.direction;
      ctx.save();
      const pulse = Math.sin(Date.now() / 150) * 0.5 + 0.5;

      let arrowX = CENTER_X;
      let arrowY = CENTER_Y;
      switch (dir) {
        case 'N': arrowX = CENTER_X - 35; arrowY = 30; break;
        case 'S': arrowX = CENTER_X + 35; arrowY = CANVAS_HEIGHT - 30; break;
        case 'W': arrowX = 30; arrowY = CENTER_Y + 35; break;
        case 'E': arrowX = CANVAS_WIDTH - 30; arrowY = CENTER_Y - 35; break;
      }

      // Warning pulsating diamond
      ctx.fillStyle = `rgba(239, 68, 68, ${0.4 + pulse * 0.4})`;
      ctx.beginPath();
      ctx.arc(arrowX, arrowY, 18, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('!', arrowX, arrowY);

      ctx.restore();
    }
  }

  private drawParticles(particles: Particle[]) {
    const ctx = this.ctx;
    particles.forEach((p) => {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;

      if (p.type === 'confetti') {
        ctx.fillRect(p.x, p.y, p.size, p.size * 1.5);
      } else if (p.type === 'smoke') {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Spark / debris
        ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
      }
      ctx.restore();
    });
  }

  private drawWeatherOverlay(vehicles: Vehicle[], weather: WeatherType) {
    const ctx = this.ctx;

    // 1. Dusk / Sunset warm golden wash
    if (weather === 'dusk') {
      ctx.fillStyle = 'rgba(249, 115, 22, 0.08)';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    }

    // 2. Night dark ambient mask
    if (weather === 'night' || weather === 'storm') {
      const nightAlpha = weather === 'storm' ? 0.72 : 0.65;
      ctx.fillStyle = `rgba(10, 15, 29, ${nightAlpha})`;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    }

    // 3. Rain streaks & pavement splashes
    if (weather === 'rain' || weather === 'storm') {
      ctx.strokeStyle = 'rgba(186, 230, 253, 0.4)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();

      this.rainDrops.forEach((drop) => {
        drop.y += drop.speed;
        drop.x -= 2; // Wind drift

        if (drop.y > CANVAS_HEIGHT) {
          drop.y = -15;
          drop.x = Math.random() * CANVAS_WIDTH;
        }

        ctx.moveTo(drop.x, drop.y);
        ctx.lineTo(drop.x - 2, drop.y + drop.length);
      });
      ctx.stroke();

      // Tire spray droplets behind moving vehicles
      vehicles.forEach((v) => {
        if (v.speed > 1.2 && !v.isCrashed) {
          ctx.fillStyle = 'rgba(224, 242, 254, 0.35)';
          const back = -v.length / 2;
          for (let s = 0; s < 3; s++) {
            const rx = v.x + (Math.random() * 8 - 4);
            const ry = v.y + (Math.random() * 8 - 4);
            ctx.beginPath();
            ctx.arc(rx, ry, 2, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      });
    }

    // 4. Storm Lightning flash
    if (weather === 'storm') {
      if (Math.random() < 0.004) {
        this.lightningAlpha = 0.55;
      }
      if (this.lightningAlpha > 0) {
        ctx.fillStyle = `rgba(240, 249, 255, ${this.lightningAlpha})`;
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        this.lightningAlpha = Math.max(0, this.lightningAlpha - 0.08);
      }
    }
  }

  private drawFloatingTexts(floatingTexts: FloatingText[]) {
    const ctx = this.ctx;
    floatingTexts.forEach((ft) => {
      ctx.save();
      ctx.globalAlpha = ft.alpha;
      ctx.translate(ft.x, ft.y);
      ctx.scale(ft.scale, ft.scale);

      ctx.font = 'bold 15px sans-serif';
      ctx.textAlign = 'center';

      // Text drop outline for crystal contrast
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 3;
      ctx.strokeText(ft.text, 0, 0);

      ctx.fillStyle = ft.color;
      ctx.fillText(ft.text, 0, 0);

      ctx.restore();
    });
  }
}
