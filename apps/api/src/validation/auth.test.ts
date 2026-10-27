import { describe, expect, it } from "vitest";
import { userPreferencesSchema } from "./auth";

const preferences = { themeMode: "system", colorTheme: "default", fontFamily: "geist" };

describe("userPreferencesSchema", () => {
  it("keeps showProjectedTasks, which would otherwise be dropped and reset on reload", () => {
    expect(
      userPreferencesSchema.parse({ ...preferences, showProjectedTasks: false })
        .showProjectedTasks
    ).toBe(false);
  });

  it("leaves showProjectedTasks unset when it isn't sent", () => {
    expect(userPreferencesSchema.parse(preferences).showProjectedTasks).toBeUndefined();
  });

  it("rejects a showProjectedTasks that isn't a boolean", () => {
    expect(
      userPreferencesSchema.safeParse({ ...preferences, showProjectedTasks: "no" }).success
    ).toBe(false);
  });
});
