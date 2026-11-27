export type TrackId = "title" | "lowtide" | "railyard" | "boss" | "training" | "complete" | "gameover";

export interface TrackDef {
  bpm: number;
  stepsPerBeat: number;
  loop: boolean;
  lead: string;
  harmony?: string;
  bass: string;
  drums: string;
}

export const TRACKS: Record<TrackId, TrackDef> = {
  title: {
    bpm: 112,
    stepsPerBeat: 2,
    loop: true,
    lead: `
      D4 - - - A4 - - - | G4 - F4 - E4 - D4 - | C4 - - - F4 - - - | E4 - - - - - . . |
      D4 - - - A4 - - - | A#4 - A4 - G4 - F4 - | G4 - - - E4 - C#4 - | D4 - - - - - . . |`,
    harmony: `
      . . F4 - . . F4 - | . . D4 - . . A3 - | . . A3 - . . C4 - | . . C#4 - - - . . |
      . . F4 - . . F4 - | . . F4 - . . D4 - | . . C4 - . . A3 - | . . A3 - - - . . |`,
    bass: `
      D2 - - - D2 - - - | A#1 - - - A#1 - - - | F2 - - - F2 - - - | A1 - - - A1 - - - |
      D2 - - - D2 - - - | A#1 - - - A#1 - - - | G1 - - - A1 - - - | D2 - - - D2 - - - |`,
    drums: `
      k . . . s . . . | k . . . s . . h | k . . . s . . . | k . k . s . s s |
      k . . . s . . . | k . . . s . . h | k . . . s . . . | k . k . s s s s |`,
  },
  lowtide: {
    bpm: 150,
    stepsPerBeat: 2,
    loop: true,
    lead: `
      A4 - . C5 E5 - D5 C5 | D5 - C5 - A4 - - . | F4 - A4 C5 D5 - C5 A4 | B4 - - . G4 - E4 . |
      A4 - . C5 E5 - G5 - | F5 - E5 D5 C5 - D5 - | E5 - - . D5 C5 B4 G4 | A4 - - - - . . . |`,
    harmony: `
      E4 - . A4 C5 - B4 A4 | A4 - A4 - E4 - - . | C4 - F4 A4 A4 - A4 F4 | G4 - - . D4 - B3 . |
      E4 - . A4 C5 - E5 - | C5 - C5 A4 A4 - A4 - | C5 - - . A4 A4 G4 D4 | E4 - - - - . . . |`,
    bass: `
      A2 A3 A2 A3 A2 A3 A2 A3 | A2 A3 A2 A3 G2 G3 G2 G3 | F2 F3 F2 F3 F2 F3 F2 F3 | G2 G3 G2 G3 E2 E3 E2 E3 |
      A2 A3 A2 A3 A2 A3 A2 A3 | F2 F3 F2 F3 F2 F3 F2 F3 | G2 G3 G2 G3 G2 G3 G2 G3 | E2 E3 E2 E3 E2 E3 G#2 G#3 |`,
    drums: `
      k h s h k k s h | k h s h k h s h | k h s h k k s h | k h s h k h s s |
      k h s h k k s h | k h s h k h s h | k h s h k k s h | k . s . s s s s |`,
  },
  railyard: {
    bpm: 144,
    stepsPerBeat: 2,
    loop: true,
    lead: `
      D5 - D5 . F5 - D5 . | C5 - A4 - C5 - D5 - | A#4 - - . A4 - G4 . | A4 - - - - . . . |
      D5 - D5 . F5 - G5 . | A5 - G5 - F5 - D5 - | C5 - - . D5 - E5 . | D5 - - - - . . . |`,
    bass: `
      D2 D3 D2 D3 D2 D3 D2 D3 | F2 F3 F2 F3 C2 C3 C2 C3 | A#1 A#2 A#1 A#2 G1 G2 G1 G2 | A1 A2 A1 A2 A1 A2 C#2 C#3 |
      D2 D3 D2 D3 D2 D3 D2 D3 | F2 F3 F2 F3 F2 F3 F2 F3 | A#1 A#2 A#1 A#2 C2 C3 C2 C3 | D2 D3 D2 D3 A1 A2 D2 D3 |`,
    drums: `
      k h s h k k s h | k h s h k h s h | k h s h k k s h | k h s h k h s s |
      k h s h k k s h | k h s h k h s h | k h s h k k s h | k k s s k s s s |`,
  },
  boss: {
    bpm: 168,
    stepsPerBeat: 2,
    loop: true,
    lead: `
      E4 - . . F4 - . . | G4 - F4 - E4 - D4 - | E5 - . . F5 - . . | G5 F5 E5 D5 E5 - - - |
      E4 - . . F4 - . . | A4 - G4 - F4 - E4 - | B4 - . . C5 - . . | B4 A4 G4 F4 E4 - - - |`,
    bass: `
      E2 E2 E3 E2 F2 E2 E3 E2 | E2 E2 E3 E2 G2 F2 E2 D2 | E2 E2 E3 E2 F2 E2 E3 E2 | C2 C2 C3 C2 D2 D2 D3 D2 |
      E2 E2 E3 E2 F2 E2 E3 E2 | E2 E2 E3 E2 G2 F2 E2 D2 | A1 A1 A2 A1 B1 B1 B2 B1 | E2 E2 E3 E2 E2 F2 G2 A2 |`,
    drums: `
      k k s . k k s s | k k s . k k s h | k k s . k k s s | k s k s k s s s |
      k k s . k k s s | k k s . k k s h | k k s . k k s s | s s s s s s s s |`,
  },
  training: {
    bpm: 126,
    stepsPerBeat: 2,
    loop: true,
    lead: `
      C5 - G4 - E4 - G4 - | C5 - D5 - E5 - - . | F5 - E5 - D5 - C5 - | D5 - G4 - - . . . |
      C5 - G4 - E4 - G4 - | C5 - D5 - E5 - G5 - | F5 - D5 - B4 - G4 - | C5 - - - - . . . |`,
    bass: `
      C3 . G2 . C3 . G2 . | C3 . G2 . C3 . E3 . | F2 . C3 . F2 . C3 . | G2 . D3 . G2 . B2 . |
      C3 . G2 . C3 . G2 . | A2 . E3 . A2 . E3 . | F2 . C3 . G2 . D3 . | C3 . G2 . C3 . . . |`,
    drums: `
      k . s . k . s . | k . s . k . s s | k . s . k . s . | k . s . k s s s |
      k . s . k . s . | k . s . k . s s | k . s . k . s . | k . s . s s s s |`,
  },
  complete: {
    bpm: 140,
    stepsPerBeat: 2,
    loop: false,
    lead: `C5 - E5 - G5 - C6 - | - - G5 - C6 - - - | - - - - . . . .`,
    harmony: `G4 - C5 - E5 - G5 - | - - E5 - E5 - - - | - - - - . . . .`,
    bass: `C3 - - - G2 - - - | C3 - - - C3 - - - | - - - - . . . .`,
    drums: `k . . . k . . . | k . k . k . . . | s s s s k . . .`,
  },
  gameover: {
    bpm: 84,
    stepsPerBeat: 2,
    loop: false,
    lead: `A4 - - - G4 - - - | F4 - - - E4 - - - | - - - - . . . .`,
    bass: `A2 - - - A2 - - - | D2 - - - E2 - - - | A1 - - - . . . .`,
    drums: `k . . . . . . . | k . . . . . . . | . . . . . . . .`,
  },
};
