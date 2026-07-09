import {
  RegExpMatcher,
  englishDataset,
  englishRecommendedTransformers,
} from "obscenity";

// Mirrors the server-side filter for instant feedback; the server re-checks
// every name regardless, so bypassing this only gets you a random guest name.
const matcher = new RegExpMatcher({
  ...englishDataset.build(),
  ...englishRecommendedTransformers,
});

export function isUsernameAllowed(username: string): boolean {
  // also match with separators stripped so "f u c k" / "f.u.c.k" are caught
  const collapsed = username.replace(/[^\p{L}\p{N}]+/gu, "");
  return !matcher.hasMatch(username) && !matcher.hasMatch(collapsed);
}
