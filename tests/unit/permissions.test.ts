import { describe, expect, it } from "vitest";
import { requireAthlete, requireCoach } from "@/lib/permissions";

describe("role guards", () => {
  it("enforces coach actions", () => {
    expect(() => requireCoach("coach")).not.toThrow();
    expect(() => requireCoach("athlete")).toThrow("forbidden");
  });

  it("enforces athlete actions", () => {
    expect(() => requireAthlete("athlete")).not.toThrow();
    expect(() => requireAthlete("coach")).toThrow("forbidden");
  });
});
