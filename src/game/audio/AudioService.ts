import type { Scene } from "phaser";
import type { SoundId } from "../context/GameEvents";
import type { Settings } from "../settings/Settings";
import { MusicPlayer } from "./MusicPlayer";
import type { TrackId } from "./tracks";

interface Voice {
  wave: OscillatorType | "noise";
  from: number;
  to: number;
  time: number;
  gain: number;
  delay?: number;
  filter?: number;
}

const BANK: Record<SoundId, Voice[]> = {
  shot: [{ wave: "square", from: 880, to: 220, time: 0.06, gain: 0.12 }],
  rivet: [{ wave: "square", from: 660, to: 180, time: 0.05, gain: 0.1 }, { wave: "noise", from: 0, to: 0, time: 0.03, gain: 0.08, filter: 3000 }],
  scatter: [{ wave: "noise", from: 0, to: 0, time: 0.25, gain: 0.35, filter: 1400 }, { wave: "square", from: 200, to: 60, time: 0.18, gain: 0.15 }],
  rocket: [{ wave: "sawtooth", from: 220, to: 520, time: 0.25, gain: 0.12 }, { wave: "noise", from: 0, to: 0, time: 0.2, gain: 0.1, filter: 900 }],
  boom: [{ wave: "noise", from: 0, to: 0, time: 0.45, gain: 0.4, filter: 700 }, { wave: "sine", from: 120, to: 40, time: 0.35, gain: 0.3 }],
  bigboom: [{ wave: "noise", from: 0, to: 0, time: 0.9, gain: 0.5, filter: 500 }, { wave: "sine", from: 90, to: 30, time: 0.8, gain: 0.4 }],
  knife: [{ wave: "noise", from: 0, to: 0, time: 0.08, gain: 0.2, filter: 5000 }, { wave: "triangle", from: 1200, to: 400, time: 0.08, gain: 0.08 }],
  hit: [{ wave: "square", from: 300, to: 120, time: 0.05, gain: 0.08 }],
  clank: [{ wave: "square", from: 1400, to: 900, time: 0.04, gain: 0.06 }],
  jump: [{ wave: "square", from: 300, to: 600, time: 0.08, gain: 0.05 }],
  pickup: [{ wave: "square", from: 660, to: 660, time: 0.06, gain: 0.08 }, { wave: "square", from: 990, to: 990, time: 0.08, gain: 0.08, delay: 0.06 }],
  weapon: [{ wave: "square", from: 440, to: 440, time: 0.07, gain: 0.1 }, { wave: "square", from: 660, to: 660, time: 0.07, gain: 0.1, delay: 0.07 }, { wave: "square", from: 880, to: 880, time: 0.12, gain: 0.1, delay: 0.14 }],
  rescue: [{ wave: "triangle", from: 520, to: 520, time: 0.1, gain: 0.15 }, { wave: "triangle", from: 780, to: 780, time: 0.18, gain: 0.15, delay: 0.1 }],
  die: [{ wave: "sawtooth", from: 600, to: 80, time: 0.6, gain: 0.15 }],
  enemyDie: [{ wave: "sawtooth", from: 500, to: 150, time: 0.25, gain: 0.08 }],
  scream: [{ wave: "sawtooth", from: 700, to: 900, time: 0.18, gain: 0.06 }],
  alarm: [{ wave: "square", from: 880, to: 880, time: 0.12, gain: 0.08 }, { wave: "square", from: 660, to: 660, time: 0.12, gain: 0.08, delay: 0.15 }],
  go: [{ wave: "square", from: 523, to: 523, time: 0.1, gain: 0.08 }, { wave: "square", from: 784, to: 784, time: 0.14, gain: 0.08, delay: 0.1 }],
  charge: [{ wave: "square", from: 220, to: 880, time: 0.45, gain: 0.05 }],
  flame: [{ wave: "noise", from: 0, to: 0, time: 0.28, gain: 0.22, filter: 1200 }, { wave: "sawtooth", from: 140, to: 90, time: 0.22, gain: 0.06 }],
  laser: [{ wave: "square", from: 1760, to: 1480, time: 0.05, gain: 0.035 }, { wave: "sine", from: 880, to: 900, time: 0.05, gain: 0.04 }],
  enemyShot: [{ wave: "square", from: 500, to: 260, time: 0.07, gain: 0.06 }],
  throw: [{ wave: "triangle", from: 400, to: 700, time: 0.1, gain: 0.07 }],
  vulcan: [{ wave: "square", from: 520, to: 200, time: 0.04, gain: 0.08 }],
  cannon: [{ wave: "noise", from: 0, to: 0, time: 0.3, gain: 0.3, filter: 900 }, { wave: "square", from: 160, to: 50, time: 0.2, gain: 0.15 }],
  mission: [{ wave: "square", from: 392, to: 392, time: 0.12, gain: 0.08 }, { wave: "square", from: 523, to: 523, time: 0.12, gain: 0.08, delay: 0.14 }, { wave: "square", from: 659, to: 659, time: 0.3, gain: 0.08, delay: 0.28 }],
  complete: [{ wave: "square", from: 523, to: 523, time: 0.15, gain: 0.1 }, { wave: "square", from: 659, to: 659, time: 0.15, gain: 0.1, delay: 0.16 }, { wave: "square", from: 784, to: 784, time: 0.15, gain: 0.1, delay: 0.32 }, { wave: "square", from: 1046, to: 1046, time: 0.4, gain: 0.1, delay: 0.48 }],
};

const REGISTRY_KEY = "audio";

export function audioOf(scene: Scene): AudioService {
  return scene.game.registry.get(REGISTRY_KEY) as AudioService;
}

export class AudioService {
  private ctx: AudioContext | null = null;
  private noise: AudioBuffer | null = null;
  private readonly queue = new Set<SoundId>();
  private master: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private player: MusicPlayer | null = null;
  private wanted: TrackId | null = null;

  constructor(private readonly settings: Settings) {
    settings.onChange(() => this.applyVolumes());
    const unlock = () => this.ensure();
    window.addEventListener("keydown", unlock);
    window.addEventListener("pointerdown", unlock);
  }

  register(scene: Scene): this {
    scene.game.registry.set(REGISTRY_KEY, this);
    return this;
  }

  request(id: SoundId): void {
    this.queue.add(id);
  }

  music(id: TrackId | null): void {
    this.wanted = id;
    this.ensure();
    if (!this.player) return;
    if (id === null) this.player.stop();
    else this.player.play(id);
  }

  get track(): TrackId | null {
    return this.player?.current ?? null;
  }

  private applyVolumes(): void {
    if (!this.master || !this.musicGain) return;
    this.master.gain.value = this.settings.values.sfx * 0.75;
    this.musicGain.gain.value = this.settings.values.music * 0.8;
  }

  flush(): void {
    if (this.queue.size === 0) return;
    const ctx = this.ensure();
    if (ctx) for (const id of this.queue) this.play(ctx, BANK[id]);
    this.queue.clear();
  }

  private ensure(): AudioContext | null {
    if (!this.ctx) {
      try {
        this.ctx = new AudioContext();
        this.master = this.ctx.createGain();
        this.master.connect(this.ctx.destination);
        this.musicGain = this.ctx.createGain();
        this.musicGain.connect(this.ctx.destination);
        const len = this.ctx.sampleRate;
        this.noise = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
        const d = this.noise.getChannelData(0);
        for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
        this.player = new MusicPlayer(this.ctx, this.musicGain, this.noise);
        this.applyVolumes();
        if (this.wanted) this.player.play(this.wanted);
      } catch {
        return null;
      }
    }
    if (this.ctx.state === "suspended") void this.ctx.resume();
    return this.ctx;
  }

  private play(ctx: AudioContext, voices: Voice[]): void {
    const now = ctx.currentTime;
    for (const v of voices) {
      const start = now + (v.delay ?? 0);
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(v.gain, start);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + v.time);
      let src: AudioScheduledSourceNode;
      if (v.wave === "noise") {
        const n = ctx.createBufferSource();
        n.buffer = this.noise;
        const f = ctx.createBiquadFilter();
        f.type = "lowpass";
        f.frequency.value = v.filter ?? 2000;
        n.connect(f).connect(gain);
        src = n;
      } else {
        const o = ctx.createOscillator();
        o.type = v.wave;
        o.frequency.setValueAtTime(v.from, start);
        o.frequency.exponentialRampToValueAtTime(Math.max(20, v.to), start + v.time);
        o.connect(gain);
        src = o;
      }
      gain.connect(this.master!);
      src.start(start);
      src.stop(start + v.time + 0.02);
    }
  }
}
