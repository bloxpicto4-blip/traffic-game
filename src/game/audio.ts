// Procedural Web Audio API sound effects & dynamic background music engine
// Guaranteed 100% offline, zero external asset failure risk

class SoundEngine {
  private ctx: AudioContext | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private masterGain: GainNode | null = null;

  private isMusicPlaying = false;
  private musicTimer: number | null = null;
  private musicStep = 0;

  private sirenOsc: OscillatorNode | null = null;
  private sirenGain: GainNode | null = null;
  private sirenLfo: OscillatorNode | null = null;
  private isSirenPlaying = false;

  private masterVolume = 0.8;
  private musicVolume = 0.5;
  private sfxVolume = 0.7;
  private isMusicMuted = false;
  private isSfxMuted = false;

  constructor() {
    // AudioContext will be initialized on first user interaction
  }

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.masterVolume;
      this.masterGain.connect(this.ctx.destination);

      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.value = this.isMusicMuted ? 0 : this.musicVolume;
      this.musicGain.connect(this.masterGain);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.value = this.isSfxMuted ? 0 : this.sfxVolume;
      this.sfxGain.connect(this.masterGain);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setVolumes(master: number, music: number, sfx: number, musicMuted: boolean, sfxMuted: boolean) {
    this.masterVolume = master;
    this.musicVolume = music;
    this.sfxVolume = sfx;
    this.isMusicMuted = musicMuted;
    this.isSfxMuted = sfxMuted;

    if (this.masterGain) {
      this.masterGain.gain.setValueAtTime(master, this.ctx?.currentTime || 0);
    }
    if (this.musicGain) {
      this.musicGain.gain.setValueAtTime(musicMuted ? 0 : music, this.ctx?.currentTime || 0);
    }
    if (this.sfxGain) {
      this.sfxGain.gain.setValueAtTime(sfxMuted ? 0 : sfx, this.ctx?.currentTime || 0);
    }
  }

  // --- Sound Effects ---

  public playClick() {
    try {
      this.initContext();
      if (!this.ctx || !this.sfxGain || this.isSfxMuted) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(600, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(150, this.ctx.currentTime + 0.05);

      gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.06);
    } catch {
      // Audio playback safety catch
    }
  }

  public playLightChange() {
    try {
      this.initContext();
      if (!this.ctx || !this.sfxGain || this.isSfxMuted) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.setValueAtTime(880, now + 0.05);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.13);
    } catch {}
  }

  public playCarPass() {
    try {
      this.initContext();
      if (!this.ctx || !this.sfxGain || this.isSfxMuted) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(280, now);

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(110, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.1);
      osc.frequency.exponentialRampToValueAtTime(85, now + 0.35);

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.12, now + 0.15);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.42);
    } catch {}
  }

  public playBrakeScreech() {
    try {
      this.initContext();
      if (!this.ctx || !this.sfxGain || this.isSfxMuted) return;

      const now = this.ctx.currentTime;
      const bufferSize = this.ctx.sampleRate * 0.2;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(2400, now);
      filter.Q.value = 10;

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.005, now + 0.2);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGain);

      noise.start(now);
      noise.stop(now + 0.22);
    } catch {}
  }

  public playCrash() {
    try {
      this.initContext();
      if (!this.ctx || !this.sfxGain || this.isSfxMuted) return;

      const now = this.ctx.currentTime;

      // 1. Low impact rumble
      const boom = this.ctx.createOscillator();
      const boomGain = this.ctx.createGain();
      boom.type = 'sine';
      boom.frequency.setValueAtTime(140, now);
      boom.frequency.exponentialRampToValueAtTime(30, now + 0.5);

      boomGain.gain.setValueAtTime(0.7, now);
      boomGain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);

      boom.connect(boomGain);
      boomGain.connect(this.sfxGain);
      boom.start(now);
      boom.stop(now + 0.65);

      // 2. Metal noise crunch
      const bufferSize = this.ctx.sampleRate * 0.45;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.15));
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1200, now);
      filter.frequency.linearRampToValueAtTime(300, now + 0.4);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.65, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.45);

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(this.sfxGain);

      noise.start(now);
      noise.stop(now + 0.48);
    } catch {}
  }

  public playHorn() {
    try {
      this.initContext();
      if (!this.ctx || !this.sfxGain || this.isSfxMuted) return;

      const now = this.ctx.currentTime;
      [340, 420].forEach((freq) => {
        if (!this.ctx || !this.sfxGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.28);

        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now);
        osc.stop(now + 0.3);
      });
    } catch {}
  }

  public playLevelComplete() {
    try {
      this.initContext();
      if (!this.ctx || !this.sfxGain || this.isSfxMuted) return;

      const now = this.ctx.currentTime;
      const notes = [440, 554.37, 659.25, 880]; // A major arpeggio
      notes.forEach((freq, idx) => {
        if (!this.ctx || !this.sfxGain) return;
        const startTime = now + idx * 0.1;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.3, startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.4);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(startTime);
        osc.stop(startTime + 0.45);
      });
    } catch {}
  }

  public playGameOver() {
    try {
      this.initContext();
      if (!this.ctx || !this.sfxGain || this.isSfxMuted) return;

      const now = this.ctx.currentTime;
      const notes = [440, 415.3, 392, 349.23]; // Minor descending sequence
      notes.forEach((freq, idx) => {
        if (!this.ctx || !this.sfxGain) return;
        const startTime = now + idx * 0.16;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.25, startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.45);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(startTime);
        osc.stop(startTime + 0.5);
      });
    } catch {}
  }

  public setEmergencySiren(active: boolean) {
    try {
      this.initContext();
      if (!this.ctx || !this.sfxGain) return;

      if (active && !this.isSirenPlaying && !this.isSfxMuted) {
        this.isSirenPlaying = true;
        const now = this.ctx.currentTime;

        this.sirenOsc = this.ctx.createOscillator();
        this.sirenGain = this.ctx.createGain();
        this.sirenLfo = this.ctx.createOscillator();
        const lfoGain = this.ctx.createGain();

        // Siren modulates between 650Hz and 950Hz at ~1.5Hz frequency
        this.sirenOsc.type = 'sine';
        this.sirenOsc.frequency.setValueAtTime(800, now);

        this.sirenLfo.type = 'sine';
        this.sirenLfo.frequency.setValueAtTime(1.6, now);

        lfoGain.gain.setValueAtTime(180, now);
        this.sirenLfo.connect(lfoGain);
        lfoGain.connect(this.sirenOsc.frequency);

        this.sirenGain.gain.setValueAtTime(0.12, now);

        this.sirenOsc.connect(this.sirenGain);
        this.sirenGain.connect(this.sfxGain);

        this.sirenOsc.start(now);
        this.sirenLfo.start(now);
      } else if (!active && this.isSirenPlaying) {
        this.stopSiren();
      }
    } catch {}
  }

  private stopSiren() {
    if (this.sirenOsc) {
      try {
        this.sirenOsc.stop();
        this.sirenOsc.disconnect();
      } catch {}
      this.sirenOsc = null;
    }
    if (this.sirenLfo) {
      try {
        this.sirenLfo.stop();
        this.sirenLfo.disconnect();
      } catch {}
      this.sirenLfo = null;
    }
    this.sirenGain = null;
    this.isSirenPlaying = false;
  }

  // --- Looping Background Arcade Synth Music ---

  public startMusic() {
    if (this.isMusicPlaying) return;
    this.initContext();
    this.isMusicPlaying = true;
    this.musicStep = 0;
    this.scheduleMusicStep();
  }

  public stopMusic() {
    this.isMusicPlaying = false;
    if (this.musicTimer !== null) {
      window.clearTimeout(this.musicTimer);
      this.musicTimer = null;
    }
  }

  private scheduleMusicStep() {
    if (!this.isMusicPlaying) return;

    try {
      if (this.ctx && this.musicGain && !this.isMusicMuted) {
        const step = this.musicStep % 16;
        const now = this.ctx.currentTime;

        // Bassline (C Minor / Eb / Bb / G progression)
        const bassNotes = [
          130.81, 0, 130.81, 0,
          155.56, 0, 155.56, 0,
          116.54, 0, 116.54, 0,
          98.00, 0, 116.54, 0,
        ];

        const melodyNotes = [
          261.63, 311.13, 392.00, 523.25,
          311.13, 392.00, 523.25, 622.25,
          233.08, 293.66, 349.23, 466.16,
          196.00, 246.94, 293.66, 392.00,
        ];

        const bassFreq = bassNotes[step];
        if (bassFreq > 0) {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(bassFreq, now);

          gain.gain.setValueAtTime(0.18, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.16);

          osc.connect(gain);
          gain.connect(this.musicGain);

          osc.start(now);
          osc.stop(now + 0.18);
        }

        // Hi-hat / pulse every 2 steps
        if (step % 2 === 0) {
          const hihat = this.ctx.createOscillator();
          const hGain = this.ctx.createGain();
          hihat.type = 'square';
          hihat.frequency.setValueAtTime(step % 4 === 2 ? 800 : 1200, now);

          hGain.gain.setValueAtTime(0.04, now);
          hGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

          hihat.connect(hGain);
          hGain.connect(this.musicGain);

          hihat.start(now);
          hihat.stop(now + 0.05);
        }

        // Delicate arp chord tone
        if (step % 4 === 1 || step % 4 === 3) {
          const mFreq = melodyNotes[step];
          const mOsc = this.ctx.createOscillator();
          const mGain = this.ctx.createGain();
          mOsc.type = 'sine';
          mOsc.frequency.setValueAtTime(mFreq, now);

          mGain.gain.setValueAtTime(0.07, now);
          mGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

          mOsc.connect(mGain);
          mGain.connect(this.musicGain);

          mOsc.start(now);
          mOsc.stop(now + 0.16);
        }
      }
    } catch {}

    this.musicStep++;
    // 130 BPM = ~115ms per 16th note
    this.musicTimer = window.setTimeout(() => this.scheduleMusicStep(), 115);
  }

  public cleanup() {
    this.stopMusic();
    this.stopSiren();
  }
}

export const soundEngine = new SoundEngine();
