import { Geom, Scenes, Scene } from "phaser";
import { EventBus } from "../../core/events/EventBus";
import { StateMachine } from "../../core/fsm/StateMachine";
import { Rng } from "../../core/random/Rng";
import { Action } from "../../domain/input/Actions";
import { MISSION, SCORE } from "../../config/tuning";
import { DATA, type AnchorTable } from "../assets/keys";
import { anchorLookup, type GameContext } from "../context/GameContext";
import type { GameEvents } from "../context/GameEvents";
import { MissionState } from "../context/MissionState";
import { InputSystem } from "../input/InputSystem";
import { LevelBuilder, type Parallax } from "../level/LevelBuilder";
import { SpawnDirector } from "../level/SpawnDirector";
import { LEVELS, type LevelId } from "../level/missions";
import type { LevelData } from "../level/LevelData";
import { Player } from "../entities/Player";
import { EnemyFactory } from "../entities/enemies/EnemyFactory";
import { Hostage } from "../entities/props/Hostage";
import { Prop } from "../entities/props/Prop";
import { Mule } from "../entities/vehicles/Mule";
import { Warden } from "../entities/bosses/Warden";
import { audioOf, type AudioService } from "../audio/AudioService";
import { settingsOf } from "../settings/Settings";
import { CameraDirector } from "../systems/CameraDirector";
import { CombatSystem } from "../systems/CombatSystem";
import { EffectsSystem } from "../systems/EffectsSystem";
import { PickupSystem, type PickupType } from "../systems/PickupSystem";
import { ProjectileSystem } from "../systems/ProjectileSystem";
import { installDebugBridge } from "../debug/DebugBridge";
import { CHARACTERS, type CharacterDef, type CharacterId } from "../../domain/characters/Characters";
import { TEX } from "../assets/keys";
import { DEPTH } from "../../config/display";

type Flow = "intro" | "play" | "gameover" | "complete";

export interface MissionData {
  level?: LevelId;
  character?: CharacterId;
}

export class MissionScene extends Scene {
  ctx!: GameContext;
  events2!: EventBus<GameEvents>;
  state!: MissionState;
  player!: Player;
  enemies!: EnemyFactory;
  mule: Mule | null = null;
  warden: Warden | null = null;
  spawner!: SpawnDirector;
  inputSys!: InputSystem;
  level: LevelData = LEVELS.lowtide;
  character: CharacterDef = CHARACTERS.pip;
  private audio!: AudioService;
  private parallax!: Parallax;
  private hostages: Hostage[] = [];
  private flow!: StateMachine<MissionScene, Flow>;
  private readonly box = new Geom.Rectangle();
  private respawnIn = -1;
  private continueTimer = 0;
  private nextTip = 0;

  constructor() {
    super("mission");
  }

  init(data: MissionData): void {
    this.level = LEVELS[data.level ?? "lowtide"];
    this.character = CHARACTERS[data.character ?? ((this.game.registry.get("character") as CharacterId | undefined) ?? "pip")];
  }

  create(): void {
    this.hostages = [];
    this.respawnIn = -1;
    this.nextTip = 0;
    const settings = settingsOf(this.game.registry);
    const builder = new LevelBuilder(this, this.level);
    this.parallax = builder.backdrop();
    const terrain = builder.terrain();
    const events = new EventBus<GameEvents>();
    const rng = new Rng(0x5eed);
    const state = new MissionState({ character: this.character, lives: this.level.lives, clock: this.level.clock, easy: settings.values.easy });
    const camera = new CameraDirector(this.cameras.main, this.level.length, () => settings.values.shake);
    const combat = new CombatSystem();
    const fx = new EffectsSystem(this, terrain, rng, () => settings.values.flashes);
    const projectiles = new ProjectileSystem(this, terrain, combat, fx, camera, events);
    const pickups = new PickupSystem(this, terrain);
    this.inputSys = new InputSystem(this);
    const anchors = this.cache.json.get(DATA.anchors) as AnchorTable;
    const ctx = {
      scene: this, events, input: this.inputSys.frame, rng, state, terrain, camera, combat, projectiles, fx, pickups,
      player: { x: 0, y: 0, alive: false, centerY: 0 },
      anchor: anchorLookup(anchors),
      anchorValue: (frame: string, name: string) => anchors[frame]?.[name],
    } as GameContext & { player: GameContext["player"] };
    this.ctx = ctx;
    this.events2 = events;
    this.state = state;
    this.audio = audioOf(this);
    this.player = new Player(ctx, this.level.playerStart, this.level.groundY - 40, this.character);
    (ctx as { player: GameContext["player"] }).player = this.player;
    combat.add(this.player);
    this.enemies = new EnemyFactory(ctx);
    for (const p of this.level.props) new Prop(ctx, p.type, p.x, p.y ?? this.level.groundY, p.drop);
    for (const h of this.level.hostages) this.hostages.push(new Hostage(ctx, h.x, h.y ?? this.level.groundY, h.drop));
    this.mule = this.level.mule ? new Mule(ctx, this.player, this.level.mule.x, this.level.groundY - 4) : null;
    this.warden = this.level.boss ? new Warden(ctx, this.enemies, this.level.boss.stopX, this.level.groundY) : null;
    if (this.level.goalX) this.add.sprite(this.level.goalX, this.level.groundY, TEX.atlas, "flag_0").setOrigin(0.5, 1).setDepth(DEPTH.props).play("flag");
    this.spawner = new SpawnDirector(ctx, this.level, this.enemies);
    this.wireEvents();
    this.flow = new StateMachine<MissionScene, Flow>(this, {
      intro: {
        enter: (s) => { s.state.phase = "intro"; },
        update: (s, dt, t) => {
          if (t - dt <= 0.05 && t > 0.05) {
            s.events2.emit("banner", { text: s.level.label, sub: `${s.level.title}  START!`, seconds: 2.2 });
            s.events2.emit("sound", "mission");
            s.audio.music(s.level.music);
          }
          s.simulate(dt);
          return t > 1.2 ? "play" : undefined;
        },
      },
      play: {
        enter: (s) => { s.state.phase = "play"; },
        update: (s, dt) => s.tickPlay(dt),
      },
      gameover: {
        enter: (s) => {
          s.state.phase = "gameover";
          s.continueTimer = 0;
          s.state.continueCount = MISSION.continueCount;
          s.audio.music("gameover");
        },
        update: (s, dt) => s.tickContinue(dt),
      },
      complete: {
        enter: (s) => {
          s.state.phase = "complete";
          s.state.clock.pause();
          s.events2.emit("banner", { text: s.level.goalX ? "TRAINING COMPLETE!" : "MISSION COMPLETE!", seconds: 3 });
          s.audio.music("complete");
        },
        update: (s, dt, t) => {
          s.simulate(dt);
          if (t > 9 || (t > 4 && s.ctx.input.pressed(Action.Start))) {
            s.scene.stop("hud");
            s.scene.start("title");
          }
        },
      },
    }, "intro");
    this.scene.launch("hud");
    this.events.on(Scenes.Events.POST_UPDATE, () => this.player.syncVisuals());
    this.events.once(Scenes.Events.SHUTDOWN, () => this.events2.clear());
    installDebugBridge(this);
  }

  private wireEvents(): void {
    const ev = this.events2;
    const ctx = this.ctx;
    ev.on("sound", (id) => this.audio.request(id));
    ev.on("explode", (e) => {
      ctx.fx.explosion(e.x, e.y, e.big);
      ctx.combat.strikeArea(e.x, e.y, e.radius, { amount: e.damage, kind: "blast", from: e.from, x: e.x, y: e.y });
      ctx.camera.shake(e.big ? 4 : 2, e.big ? 0.25 : 0.12);
      this.audio.request(e.big ? "bigboom" : "boom");
    });
    ev.on("score", (s) => {
      this.state.score.add(s.points);
      ctx.fx.popup(String(s.points), s.x, s.y);
    });
    ev.on("enemyKilled", (k) => this.state.score.add(k.knife ? SCORE.knifeKill : SCORE.shotKill));
    ev.on("rescued", (r) => {
      this.state.score.rescue();
      ctx.fx.popup("THANKS!", r.x, r.y - 30);
    });
    ev.on("waveCleared", () => { this.state.clock.reset(); this.audio.request("go"); });
    ev.on("playerDied", () => {
      this.state.score.loseTinkers();
      this.respawnIn = 1.6;
    });
    ev.on("bossDefeated", () => this.flow.change("complete"));
  }

  update(_time: number, deltaMs: number): void {
    const dt = Math.min(deltaMs / 1000, 1 / 20);
    const input = this.inputSys.poll();
    if (input.pressed(Action.Pause) && (this.state.phase === "play" || this.state.phase === "intro")) {
      this.inputSys.frame.clear();
      this.scene.pause();
      this.scene.launch("pause");
      return;
    }
    this.flow.update(dt);
    this.audio.flush();
  }

  private get piloting(): boolean {
    return this.state.piloting && this.mule !== null;
  }

  private simulate(dt: number): void {
    const ctx = this.ctx;
    this.player.tick(dt);
    this.mule?.tick(dt);
    this.enemies.tick(dt);
    const pbox = this.piloting ? this.mule!.bounds(this.box) : this.player.bounds(this.box);
    if (this.player.alive) for (const h of this.hostages) h.tick(dt, pbox);
    else for (const h of this.hostages) h.tick(dt, this.box.setTo(-999, -999, 0, 0));
    this.warden?.tick(dt);
    ctx.projectiles.update(dt);
    ctx.fx.update(dt);
    if (this.player.alive) ctx.pickups.collect(this.piloting ? this.mule!.bounds(this.box) : this.player.bounds(this.box), (k, x, y) => this.applyPickup(k, x, y));
    ctx.pickups.cull(ctx.camera.left);
    const w = this.warden;
    if (w?.present && this.player.onFoot && this.player.x > w.left - 8) this.player.legs.x = w.left - 8;
    if (w?.present && this.piloting && this.mule!.x > w.left - 20) this.mule!.sprite.x = w.left - 20;
    const followX = this.piloting ? this.mule!.x : this.player.x;
    if (this.player.alive) ctx.camera.follow(followX, dt);
    this.parallax.far.tilePositionX = ctx.camera.left * 0.2;
    this.parallax.mid.tilePositionX = ctx.camera.left * 0.5;
  }

  private tickPlay(dt: number): Flow | void {
    this.simulate(dt);
    this.spawner.update(dt);
    const cam = this.ctx.camera;
    const boss = this.level.boss;
    if (boss && this.warden && this.warden.state === "waiting" && cam.left >= boss.lockAt - 2) {
      cam.lock(boss.lockAt);
      this.warden.start();
      this.audio.music("boss");
      this.events2.emit("banner", { text: "WARNING!", sub: "IRON WARDEN APPROACHING", seconds: 2 });
    }
    const tips = this.level.tips;
    if (this.nextTip < tips.length && this.player.x >= tips[this.nextTip]!.x) {
      this.events2.emit("tip", { text: tips[this.nextTip]!.text, seconds: 4 });
      this.nextTip++;
    }
    if (this.level.goalX && this.player.alive && this.player.x >= this.level.goalX) return "complete";
    if (this.player.alive && this.state.clockEnabled) {
      const ev = this.state.clock.tick(dt);
      if (ev === "alarm") this.audio.request("alarm");
      if (ev === "timeout") {
        if (this.state.piloting) this.mule?.forceEject();
        this.player.die();
      }
    }
    if (this.respawnIn > 0) {
      this.respawnIn -= dt;
      if (this.respawnIn <= 0) {
        this.respawnIn = -1;
        if (this.state.lives.lose() === "gameover") return "gameover";
        this.respawn();
      }
    }
  }

  private respawn(weapon?: "rivet"): void {
    this.state.loadout.resetForLife();
    if (weapon) this.state.loadout.pickWeapon(weapon);
    if (this.state.clockEnabled) this.state.clock.reset();
    this.player.respawn(this.ctx.camera.left + 70);
  }

  private tickContinue(dt: number): Flow | void {
    this.simulate(dt);
    this.continueTimer += dt;
    if (this.continueTimer >= MISSION.continueStepSeconds) {
      this.continueTimer = 0;
      this.state.continueCount -= 1;
      if (this.state.continueCount < 0) {
        this.scene.stop("hud");
        this.scene.start("title");
        return;
      }
    }
    if (this.ctx.input.pressed(Action.Start)) {
      this.state.lives.continueGame();
      this.state.score.continueGame();
      this.state.continueCount = -1;
      this.respawn("rivet");
      this.audio.music(this.warden?.present ? "boss" : this.level.music);
      return "play";
    }
  }

  private applyPickup(kind: PickupType, x: number, y: number): void {
    const st = this.state;
    const ev = this.events2;
    switch (kind) {
      case "rivet":
      case "scatter":
      case "thumper": {
        st.loadout.pickWeapon(kind);
        ev.emit("weapon", { label: st.loadout.weapon.label });
        ev.emit("sound", "weapon");
        return;
      }
      case "bombs":
        if (st.piloting) st.muleShells += 10;
        else st.loadout.addBombs(10);
        break;
      case "ammo": {
        const r = st.loadout.reloadHalf(SCORE.spareItem);
        if (r.kind === "points") ev.emit("score", { points: r.points, x, y });
        break;
      }
      case "fuel": {
        const pts = this.mule ? this.mule.refuel() : SCORE.spareItem;
        if (pts) ev.emit("score", { points: pts, x, y });
        break;
      }
      case "gem":
        ev.emit("score", { points: SCORE.gem, x, y });
        break;
      case "ration":
        ev.emit("score", { points: SCORE.ration, x, y });
        break;
    }
    ev.emit("sound", "pickup");
  }
}
