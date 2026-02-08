const ADJECTIVES = [
  "Moonlit",
  "Quiet",
  "Gentle",
  "Wandering",
  "Soft",
  "Silver",
  "Indigo",
  "Dusky",
  "Still",
  "Luminous",
  "Hushed",
  "Amber",
  "Velvet",
  "Calm",
  "Wistful",
  "Serene",
];

const NOUNS = [
  "Walker",
  "Observer",
  "Dreamer",
  "Seeker",
  "Listener",
  "Keeper",
  "Wanderer",
  "Harbor",
  "Atlas",
  "Drift",
  "Whisper",
  "Cove",
  "Echo",
  "Horizon",
  "Ember",
  "Bloom",
];

function pick<T>(list: T[]) {
  return list[Math.floor(Math.random() * list.length)];
}

function maybeNumber() {
  if (Math.random() < 0.5) return "";
  return `_${Math.floor(Math.random() * 90 + 10)}`;
}

export function generateAnonymousUsername(): string {
  return `${pick(ADJECTIVES)}_${pick(NOUNS)}${maybeNumber()}`;
}
