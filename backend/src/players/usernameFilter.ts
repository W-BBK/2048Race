import {
  RegExpMatcher,
  englishDataset,
  englishRecommendedTransformers,
} from "obscenity";

// Matches slurs/profanity including obfuscated forms (leetspeak, separators).
const matcher = new RegExpMatcher({
  ...englishDataset.build(),
  ...englishRecommendedTransformers,
});

export function isUsernameAllowed(username: string): boolean {
  // also match with separators stripped so "f u c k" / "f.u.c.k" are caught
  const collapsed = username.replace(/[^\p{L}\p{N}]+/gu, "");
  return !matcher.hasMatch(username) && !matcher.hasMatch(collapsed);
}
