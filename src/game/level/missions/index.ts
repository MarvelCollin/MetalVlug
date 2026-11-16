import type { LevelData } from "../LevelData";
import { CAMP } from "./camp";
import { LOWTIDE } from "./lowtide";

export type LevelId = "lowtide" | "camp";

export const LEVELS: Readonly<Record<LevelId, LevelData>> = { lowtide: LOWTIDE, camp: CAMP };
