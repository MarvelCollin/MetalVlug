export interface SettingsData {
  music: number;
  sfx: number;
  shake: boolean;
  flashes: boolean;
  easy: boolean;
  voice: boolean;
}

const KEY = "metalvlug.settings.v1";
const DEFAULTS: SettingsData = { music: 0.7, sfx: 0.8, shake: true, flashes: true, easy: false, voice: true };

export class Settings {
  private data: SettingsData = { ...DEFAULTS };
  private readonly listeners = new Set<(s: SettingsData) => void>();

  constructor() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) this.data = { ...DEFAULTS, ...(JSON.parse(raw) as Partial<SettingsData>) };
    } catch {
      this.data = { ...DEFAULTS };
    }
  }

  get values(): Readonly<SettingsData> {
    return this.data;
  }

  set<K extends keyof SettingsData>(key: K, value: SettingsData[K]): void {
    this.data = { ...this.data, [key]: value };
    try {
      localStorage.setItem(KEY, JSON.stringify(this.data));
    } catch {
      this.data = { ...this.data };
    }
    for (const l of this.listeners) l(this.data);
  }

  onChange(listener: (s: SettingsData) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}

export function settingsOf(registry: { get(key: string): unknown }): Settings {
  return registry.get("settings") as Settings;
}
