import { describe, expect, it } from "vitest";
import { isUsernameAllowed } from "./usernameFilter.js";

describe("isUsernameAllowed", () => {
  it("allows normal usernames", () => {
    expect(isUsernameAllowed("SwiftFalcon")).toBe(true);
    expect(isUsernameAllowed("xX_Gamer_Xx")).toBe(true);
    expect(isUsernameAllowed("2048wizard")).toBe(true);
  });

  it("blocks profanity and slurs from the dataset", () => {
    expect(isUsernameAllowed("fuck")).toBe(false);
    expect(isUsernameAllowed("YouFucker99")).toBe(false);
  });

  it("blocks obfuscated variants (leetspeak, separators)", () => {
    expect(isUsernameAllowed("fuuuck")).toBe(false);
    expect(isUsernameAllowed("f u c k")).toBe(false);
    expect(isUsernameAllowed("fùck")).toBe(false);
  });

  it("does not flag innocent substrings (Scunthorpe problem)", () => {
    expect(isUsernameAllowed("Scunthorpe")).toBe(true);
    expect(isUsernameAllowed("ClassicPlayer")).toBe(true);
  });
});
