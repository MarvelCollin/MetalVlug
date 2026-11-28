import type { LevelData } from "../LevelData";
import { CAMP } from "./camp";
import { LOWTIDE } from "./lowtide";
import { RAILYARD } from "./railyard";

export type LevelId = "lowtide" | "railyard" | "camp";

export const LEVELS: Readonly<Record<LevelId, LevelData>> = { lowtide: LOWTIDE, railyard: RAILYARD, camp: CAMP };
