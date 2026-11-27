import type { FileTrack } from "./FilePlayer";
import type { TrackId } from "./tracks";

export const MUSIC_FILES: Partial<Record<TrackId, FileTrack>> = {
  title: { src: "commando-team.mp3", gain: 0.8 },
  lowtide: { src: "pounding-the-enemy-base.mp3", gain: 0.8, stream: true },
  railyard: { src: "action-track.mp3", gain: 0.8, stream: true },
  boss: { src: "fast-fight.mp3", gain: 0.8 },
  training: { src: "chipped-urgency.mp3", gain: 0.75 },
  complete: { src: "jingle_complete.mp3", gain: 0.7, loop: false },
  gameover: { src: "jingle_gameover.mp3", gain: 0.7, loop: false },
};
