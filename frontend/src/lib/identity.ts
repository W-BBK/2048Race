const PLAYER_ID_KEY = "2048race:playerId";
const USERNAME_KEY = "2048race:username";

export function getPlayerId(): string {
  let id = localStorage.getItem(PLAYER_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(PLAYER_ID_KEY, id);
  }
  return id;
}

export function getSavedUsername(): string {
  return localStorage.getItem(USERNAME_KEY) ?? "";
}

export function saveUsername(username: string): void {
  localStorage.setItem(USERNAME_KEY, username.trim());
}
