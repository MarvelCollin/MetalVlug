import { TRACKS, type TrackDef, type TrackId } from "./tracks";

const NOTE: Record<string, number> = { C: 0, "C#": 1, D: 2, "D#": 3, E: 4, F: 5, "F#": 6, G: 7, "G#": 8, A: 9, "A#": 10, B: 11 };

export function noteToHz(token: string): number | null {
  const m = /^([A-G]#?)(-?\d)$/.exec(token);
  if (!m) return null;
  const midi = (Number(m[2]) + 1) * 12 + NOTE[m[1]!]!;
  return 440 * 2 ** ((midi - 69) / 12);
}

export interface NoteEvent {
  step: number;
  hz: number;
  steps: number;
}

export function parseVoice(text: string): { events: NoteEvent[]; length: number } {
  const tokens = text.split(/\s+/).filter((t) => t && t !== "|");
  const events: NoteEvent[] = [];
  let current: NoteEvent | null = null;
  tokens.forEach((t, i) => {
    if (t === "-") {
      if (current) current.steps++;
      return;
    }
    current = null;
    const hz = noteToHz(t);
    if (hz !== null) {
      current = { step: i, hz, steps: 1 };
      events.push(current);
    }
  });
  return { events, length: tokens.length };
}

export function parseDrums(text: string): { hits: Array<{ step: number; kind: string }>; length: number } {
  const tokens = text.split(/\s+/).filter((t) => t && t !== "|");
  return { hits: tokens.map((kind, step) => ({ step, kind })).filter((h) => h.kind !== "."), length: tokens.length };
}

interface Compiled {
  def: TrackDef;
  stepTime: number;
  length: number;
  voices: Array<{ wave: OscillatorType; gain: number; events: NoteEvent[] }>;
  drums: Array<{ step: number; kind: string }>;
}

function compile(id: TrackId): Compiled {
  const def = TRACKS[id];
  const lead = parseVoice(def.lead);
  const bass = parseVoice(def.bass);
  const drums = parseDrums(def.drums);
  const voices: Compiled["voices"] = [
    { wave: "square", gain: 0.05, events: lead.events },
    { wave: "triangle", gain: 0.14, events: bass.events },
  ];
  if (def.harmony) voices.push({ wave: "square", gain: 0.025, events: parseVoice(def.harmony).events });
  return {
    def,
    stepTime: 60 / def.bpm / def.stepsPerBeat,
    length: Math.max(lead.length, bass.length, drums.length),
    voices,
    drums: drums.hits,
  };
}

export class MusicPlayer {
  private track: Compiled | null = null;
  private trackId: TrackId | null = null;
  private step = 0;
  private nextTime = 0;
  private timer: ReturnType<typeof setInterval> | null = null;
  private readonly out: GainNode;
  private readonly cache = new Map<TrackId, Compiled>();

  constructor(private readonly ctx: AudioContext, destination: AudioNode, private readonly noise: AudioBuffer) {
    this.out = ctx.createGain();
    this.out.connect(destination);
  }

  get current(): TrackId | null {
    return this.trackId;
  }

  play(id: TrackId): void {
    if (this.trackId === id) return;
    this.stop();
    let t = this.cache.get(id);
    if (!t) {
      t = compile(id);
      this.cache.set(id, t);
    }
    this.track = t;
    this.trackId = id;
    this.step = 0;
    this.out.gain.cancelScheduledValues(this.ctx.currentTime);
    this.out.gain.setValueAtTime(1, this.ctx.currentTime);
    this.nextTime = this.ctx.currentTime + 0.06;
    this.timer = setInterval(() => this.schedule(), 25);
  }

  stop(fade = 0.25): void {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
    this.track = null;
    this.trackId = null;
    const now = this.ctx.currentTime;
    this.out.gain.cancelScheduledValues(now);
    this.out.gain.setValueAtTime(this.out.gain.value, now);
    this.out.gain.linearRampToValueAtTime(0, now + fade);
  }

  private schedule(): void {
    const t = this.track;
    if (!t) return;
    while (this.nextTime < this.ctx.currentTime + 0.15) {
      if (this.step >= t.length) {
        if (!t.def.loop) {
          this.stop(1);
          return;
        }
        this.step = 0;
      }
      for (const v of t.voices) for (const e of v.events) if (e.step === this.step) this.tone(v.wave, e.hz, this.nextTime, e.steps * t.stepTime, v.gain);
      for (const d of t.drums) if (d.step === this.step) this.drum(d.kind, this.nextTime);
      this.nextTime += t.stepTime;
      this.step++;
    }
  }

  private tone(wave: OscillatorType, hz: number, at: number, len: number, gain: number): void {
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = wave;
    o.frequency.setValueAtTime(hz, at);
    g.gain.setValueAtTime(0.0001, at);
    g.gain.linearRampToValueAtTime(gain, at + 0.01);
    g.gain.setValueAtTime(gain, at + Math.max(0.02, len - 0.05));
    g.gain.linearRampToValueAtTime(0.0001, at + len);
    o.connect(g).connect(this.out);
    o.start(at);
    o.stop(at + len + 0.02);
  }

  private drum(kind: string, at: number): void {
    if (kind === "k") {
      const o = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      o.frequency.setValueAtTime(140, at);
      o.frequency.exponentialRampToValueAtTime(42, at + 0.12);
      g.gain.setValueAtTime(0.32, at);
      g.gain.exponentialRampToValueAtTime(0.001, at + 0.16);
      o.connect(g).connect(this.out);
      o.start(at);
      o.stop(at + 0.18);
      return;
    }
    const n = this.ctx.createBufferSource();
    n.buffer = this.noise;
    const f = this.ctx.createBiquadFilter();
    const g = this.ctx.createGain();
    const hat = kind === "h";
    f.type = hat ? "highpass" : "bandpass";
    f.frequency.value = hat ? 7000 : 1800;
    const len = hat ? 0.04 : 0.12;
    g.gain.setValueAtTime(hat ? 0.05 : 0.14, at);
    g.gain.exponentialRampToValueAtTime(0.001, at + len);
    n.connect(f).connect(g).connect(this.out);
    n.start(at, Math.random() * 0.5);
    n.stop(at + len + 0.02);
  }
}
