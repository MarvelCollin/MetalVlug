import { WEAPONS, type WeaponDef, type WeaponId } from "./WeaponDefs";

export type PickupOutcome = { kind: "equipped" | "refilled"; weapon: WeaponId } | { kind: "points"; points: number };

export class Loadout {
  private weaponId: WeaponId = "pistol";
  private ammoLeft = Infinity;
  private bombCount: number;

  constructor(private readonly startBombs: number) {
    this.bombCount = startBombs;
  }

  get weapon(): WeaponDef {
    return WEAPONS[this.weaponId];
  }

  get ammo(): number {
    return this.ammoLeft;
  }

  get bombs(): number {
    return this.bombCount;
  }

  pickWeapon(id: WeaponId): PickupOutcome {
    const def = WEAPONS[id];
    if (id === this.weaponId && id !== "pistol") {
      this.ammoLeft += def.refillAmmo;
      return { kind: "refilled", weapon: id };
    }
    this.weaponId = id;
    this.ammoLeft = def.startAmmo;
    return { kind: "equipped", weapon: id };
  }

  reloadHalf(spareItemPoints: number): PickupOutcome {
    if (this.weaponId === "pistol") return { kind: "points", points: spareItemPoints };
    this.ammoLeft += Math.ceil(this.weapon.startAmmo / 2);
    return { kind: "refilled", weapon: this.weaponId };
  }

  consumeShot(): void {
    if (!Number.isFinite(this.ammoLeft)) return;
    this.ammoLeft -= 1;
    if (this.ammoLeft <= 0) {
      this.weaponId = "pistol";
      this.ammoLeft = Infinity;
    }
  }

  addBombs(n: number): void {
    this.bombCount += n;
  }

  useBomb(): boolean {
    if (this.bombCount <= 0) return false;
    this.bombCount -= 1;
    return true;
  }

  resetForLife(): void {
    this.weaponId = "pistol";
    this.ammoLeft = Infinity;
    this.bombCount = this.startBombs;
  }
}
