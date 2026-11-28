import { Action } from "../../domain/input/Actions";

export const touchInput = { held: 0, latched: 0 };

type Control = { el: HTMLElement; bit: number } | { el: HTMLElement; pad: true };

const STYLE = `
.mv-touch { position: fixed; inset: 0; pointer-events: none; z-index: 10; user-select: none; -webkit-user-select: none; touch-action: none; font-family: ui-monospace, Menlo, Consolas, monospace; }
.mv-touch * { pointer-events: auto; touch-action: none; -webkit-tap-highlight-color: transparent; }
.mv-pad { position: absolute; left: max(8px, env(safe-area-inset-left)); bottom: 12px; width: 124px; height: 124px; border-radius: 50%; background: rgba(27, 22, 38, 0.3); border: 2px solid rgba(255, 248, 236, 0.28); }
.mv-pad::before, .mv-pad::after { content: ""; position: absolute; background: rgba(255, 248, 236, 0.2); border-radius: 4px; }
.mv-pad::before { left: 50%; top: 12px; bottom: 12px; width: 34px; transform: translateX(-50%); }
.mv-pad::after { top: 50%; left: 12px; right: 12px; height: 34px; transform: translateY(-50%); }
.mv-knob { position: absolute; left: 50%; top: 50%; width: 40px; height: 40px; margin: -20px 0 0 -20px; border-radius: 50%; background: rgba(248, 210, 90, 0.5); border: 2px solid rgba(30, 22, 36, 0.55); pointer-events: none; }
.mv-btn { position: absolute; display: flex; align-items: center; justify-content: center; border-radius: 50%; color: #fff8ec; font-weight: 700; font-size: 13px; letter-spacing: 1px; border: 2px solid rgba(30, 22, 36, 0.7); box-shadow: inset 0 -4px 0 rgba(0, 0, 0, 0.25); }
.mv-btn.on { transform: translateY(2px); box-shadow: inset 0 -1px 0 rgba(0, 0, 0, 0.25); filter: brightness(1.25); }
.mv-fire { right: max(6px, env(safe-area-inset-right)); bottom: 88px; width: 66px; height: 66px; background: rgba(226, 75, 62, 0.5); }
.mv-jump { right: max(6px, env(safe-area-inset-right)); bottom: 14px; width: 66px; height: 66px; background: rgba(88, 191, 174, 0.5); }
.mv-bomb { right: calc(max(6px, env(safe-area-inset-right)) + 9px); bottom: 162px; width: 48px; height: 48px; background: rgba(176, 127, 44, 0.55); font-size: 10px; }
.mv-small { top: max(8px, env(safe-area-inset-top)); width: 50px; height: 28px; border-radius: 8px; background: rgba(27, 22, 38, 0.5); font-size: 10px; }
.mv-pause { right: max(8px, env(safe-area-inset-right)); }
.mv-start { left: max(8px, env(safe-area-inset-left)); width: 58px; }
.mv-rotate { position: fixed; inset: 0; display: none; align-items: center; justify-content: center; text-align: center; padding: 24px; background: rgba(27, 22, 38, 0.92); color: #f8d25a; font: 700 16px ui-monospace, Menlo, Consolas, monospace; z-index: 11; }
@media (orientation: portrait) { .mv-rotate { display: flex; } }
`;

export function wantsTouchControls(): boolean {
  const params = new URLSearchParams(location.search);
  if (params.has("notouch")) return false;
  if (params.has("touch")) return true;
  return window.matchMedia("(pointer: coarse)").matches;
}

export class TouchControls {
  private readonly root: HTMLElement;
  private readonly knob: HTMLElement;
  private readonly owners = new Map<number, Control>();
  private padMask = 0;
  private fullscreenTried = false;

  constructor() {
    const style = document.createElement("style");
    style.textContent = STYLE;
    document.head.appendChild(style);
    this.root = document.createElement("div");
    this.root.className = "mv-touch";
    const pad = this.el("div", "mv-pad");
    this.knob = this.el("div", "mv-knob");
    pad.appendChild(this.knob);
    const buttons: Array<[string, string, number]> = [
      ["mv-btn mv-fire", "FIRE", Action.Fire],
      ["mv-btn mv-jump", "JUMP", Action.Jump],
      ["mv-btn mv-bomb", "BOMB", Action.Bomb],
      ["mv-btn mv-small mv-pause", "II", Action.Pause],
      ["mv-btn mv-small mv-start", "START", Action.Start],
    ];
    this.bind(pad, { el: pad, pad: true });
    for (const [cls, label, bit] of buttons) {
      const b = this.el("div", cls);
      b.textContent = label;
      this.bind(b, { el: b, bit });
    }
    const rotate = this.el("div", "mv-rotate");
    rotate.textContent = "ROTATE YOUR PHONE TO LANDSCAPE";
    document.body.append(this.root, rotate);
    window.addEventListener("blur", () => this.releaseAll());
    window.addEventListener("keydown", () => {
      this.root.style.display = "none";
      this.releaseAll();
    });
    window.addEventListener("pointerdown", (ev) => {
      if (ev.pointerType === "touch") this.root.style.display = "";
    });
  }

  private el(tag: string, cls: string): HTMLElement {
    const e = document.createElement(tag);
    e.className = cls;
    if (!cls.includes("mv-knob") && !cls.includes("mv-rotate")) this.root.appendChild(e);
    return e;
  }

  private bind(el: HTMLElement, control: Control): void {
    el.addEventListener("pointerdown", (ev) => {
      ev.preventDefault();
      el.setPointerCapture(ev.pointerId);
      this.owners.set(ev.pointerId, control);
      this.tryFullscreen();
      if ("pad" in control) this.movePad(ev);
      else this.press(control);
    });
    el.addEventListener("pointermove", (ev) => {
      if ("pad" in control && this.owners.get(ev.pointerId) === control) this.movePad(ev);
    });
    const end = (ev: PointerEvent) => {
      const c = this.owners.get(ev.pointerId);
      if (!c) return;
      this.owners.delete(ev.pointerId);
      if ("pad" in c) this.setPad(0, 0, 0);
      else this.release(c);
    };
    el.addEventListener("pointerup", end);
    el.addEventListener("pointercancel", end);
    el.addEventListener("lostpointercapture", end);
    el.addEventListener("contextmenu", (ev) => ev.preventDefault());
  }

  private press(c: { el: HTMLElement; bit: number }): void {
    touchInput.held |= c.bit;
    touchInput.latched |= c.bit;
    c.el.classList.add("on");
  }

  private release(c: { el: HTMLElement; bit: number }): void {
    let still = false;
    for (const o of this.owners.values()) if ("bit" in o && o.bit === c.bit) still = true;
    if (!still) {
      touchInput.held &= ~c.bit;
      c.el.classList.remove("on");
    }
  }

  private movePad(ev: PointerEvent): void {
    const r = (ev.currentTarget as HTMLElement).getBoundingClientRect();
    const dx = ev.clientX - (r.left + r.width / 2);
    const dy = ev.clientY - (r.top + r.height / 2);
    const dead = r.width * 0.14;
    let mask = 0;
    if (Math.hypot(dx, dy) > dead) {
      const a = Math.atan2(dy, dx);
      const sector = Math.round(a / (Math.PI / 4));
      const dirs: Record<number, number> = {
        0: Action.Right, 1: Action.Right | Action.Down, 2: Action.Down, 3: Action.Left | Action.Down,
        4: Action.Left, [-4]: Action.Left, [-3]: Action.Left | Action.Up, [-2]: Action.Up, [-1]: Action.Right | Action.Up,
      };
      mask = dirs[sector] ?? 0;
    }
    const limit = r.width * 0.32;
    const len = Math.hypot(dx, dy) || 1;
    const k = Math.min(1, limit / len);
    this.setPad(mask, dx * k, dy * k);
  }

  private setPad(mask: number, kx: number, ky: number): void {
    const dirBits = Action.Left | Action.Right | Action.Up | Action.Down;
    touchInput.latched |= mask & ~this.padMask;
    touchInput.held = (touchInput.held & ~dirBits) | mask;
    this.padMask = mask;
    this.knob.style.transform = `translate(${kx}px, ${ky}px)`;
  }

  private releaseAll(): void {
    this.owners.clear();
    touchInput.held = 0;
    this.padMask = 0;
    this.knob.style.transform = "";
    for (const b of this.root.querySelectorAll(".on")) b.classList.remove("on");
  }

  private tryFullscreen(): void {
    if (this.fullscreenTried || new URLSearchParams(location.search).has("touch")) return;
    this.fullscreenTried = true;
    const doc = document.documentElement;
    if (!document.fullscreenElement && doc.requestFullscreen) {
      doc.requestFullscreen().then(() => (screen.orientation as ScreenOrientation & { lock?: (o: string) => Promise<void> }).lock?.("landscape")).catch(() => undefined);
    }
  }
}
