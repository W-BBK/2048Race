const ADJECTIVES = [
  "Swift", "Turbo", "Cosmic", "Neon", "Shadow", "Blazing", "Frosty", "Golden",
  "Rogue", "Silent", "Rapid", "Lucky", "Crimson", "Electric", "Mighty", "Sly",
];

const NOUNS = [
  "Falcon", "Tiger", "Comet", "Ninja", "Wolf", "Rocket", "Phoenix", "Panther",
  "Viper", "Raptor", "Dragon", "Hawk", "Cobra", "Storm", "Fox", "Lynx",
];

export function generateGuestName(): string {
  const adjective = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  const number = Math.floor(Math.random() * 9000) + 1000;
  return `${adjective}${noun}${number}`;
}
