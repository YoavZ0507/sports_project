export const TEAMS = [
  "Maccabi Tel Aviv",
  "Hapoel Jerusalem",
  "Beitar Academy",
  "Galil Performance Club",
  "Sharon Elite Team"
] as const;

export type TeamName = (typeof TEAMS)[number];
