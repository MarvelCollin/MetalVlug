export interface FileTrack {
  readonly src: string;
  readonly gain: number;
  readonly stream?: boolean;
  readonly loop?: boolean;
}

export class FilePlayer {
  private readonly out: GainNode;
  private readonly buffers = new Map<string, Promise<AudioBuffer | null>>();
  private sources: AudioBufferSourceNode[] = [];
  private media: { el: HTMLAudioElement; node: MediaElementAudioSourceNode } | null = null;
  private token = 0;

  constructor(private readonly ctx: AudioContext, destination: AudioNode, private readonly base: string) {
    this.out = ctx.createGain();
    this.out.connect(destination);
  }

  preload(track: FileTrack): void {
    if (!track.stream) void this.load(track.src);
  }

  async play(track: FileTrack): Promise<boolean> {
    const mine = ++this.token;
    this.halt(0.2);
    if (track.stream) return this.playStream(track, mine);
    const loop = await this.load(track.src);
    if (mine !== this.token) return true;
    if (!loop) return false;
    const now = this.ctx.currentTime + 0.05;
    this.fadeIn(track.gain, now);
    const s = this.ctx.createBufferSource();
    s.buffer = loop;
    s.loop = track.loop !== false;
    s.connect(this.out);
    s.start(now);
    this.sources.push(s);
    return true;
  }

  stop(fade = 0.3): void {
    this.token++;
    this.halt(fade);
  }

  private async playStream(track: FileTrack, mine: number): Promise<boolean> {
    const el = new Audio(`${this.base}${track.src}`);
    el.loop = true;
    el.preload = "auto";
    const node = this.ctx.createMediaElementSource(el);
    node.connect(this.out);
    this.media = { el, node };
    this.fadeIn(track.gain, this.ctx.currentTime + 0.05);
    try {
      await el.play();
      return true;
    } catch {
      if (mine === this.token) this.dropMedia();
      return mine !== this.token;
    }
  }

  private fadeIn(gain: number, at: number): void {
    this.out.gain.cancelScheduledValues(at);
    this.out.gain.setValueAtTime(0, at);
    this.out.gain.linearRampToValueAtTime(gain, at + 0.15);
  }

  private halt(fade: number): void {
    const now = this.ctx.currentTime;
    const old = this.sources;
    const media = this.media;
    this.sources = [];
    this.media = null;
    if (old.length === 0 && !media) return;
    this.out.gain.cancelScheduledValues(now);
    this.out.gain.setValueAtTime(this.out.gain.value, now);
    this.out.gain.linearRampToValueAtTime(0, now + fade);
    for (const s of old) {
      try {
        s.stop(now + fade + 0.02);
      } catch {
        s.disconnect();
      }
    }
    if (media) setTimeout(() => {
      media.el.pause();
      media.node.disconnect();
    }, (fade + 0.05) * 1000);
  }

  private dropMedia(): void {
    if (!this.media) return;
    this.media.el.pause();
    this.media.node.disconnect();
    this.media = null;
  }

  private load(src: string): Promise<AudioBuffer | null> {
    let p = this.buffers.get(src);
    if (!p) {
      p = fetch(`${this.base}${src}`)
        .then((r) => (r.ok ? r.arrayBuffer() : Promise.reject(new Error(String(r.status)))))
        .then((data) => this.ctx.decodeAudioData(data))
        .catch(() => null);
      this.buffers.set(src, p);
    }
    return p;
  }
}
