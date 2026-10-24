import { describe, expect, it } from "vitest";
import type { WorkSession } from "@open-sunsama/types";
import { sessionsOnDay, sessionLayoutItem } from "./work-session-block";

function session(id: string, startedAt: Date, endedAt: Date): WorkSession {
  return {
    id,
    taskId: "task-1",
    taskTitle: "Write report",
    startedAt,
    endedAt,
    isRunning: false,
  };
}

const DAY = new Date(2026, 9, 23);

describe("sessionsOnDay", () => {
  it("keeps sessions that overlap the day", () => {
    const morning = session(
      "a",
      new Date(2026, 9, 23, 9),
      new Date(2026, 9, 23, 10)
    );
    const yesterday = session(
      "b",
      new Date(2026, 9, 22, 9),
      new Date(2026, 9, 22, 10)
    );
    const overnight = session(
      "c",
      new Date(2026, 9, 22, 23),
      new Date(2026, 9, 23, 1)
    );
    expect(
      sessionsOnDay([morning, yesterday, overnight], DAY).map((s) => s.id)
    ).toEqual(["a", "c"]);
  });
});

describe("sessionLayoutItem", () => {
  it("clips a session that started the day before to the start of the day", () => {
    const overnight = session(
      "c",
      new Date(2026, 9, 22, 23),
      new Date(2026, 9, 23, 1)
    );
    expect(sessionLayoutItem(overnight, DAY)).toEqual({
      id: "session:c",
      start: new Date(2026, 9, 23, 0),
      end: new Date(2026, 9, 23, 1),
    });
  });
});

describe("sessionLayoutItem for a short session", () => {
  it("takes up at least 20 minutes so it doesn't draw over the next block", () => {
    const short = session(
      "d",
      new Date(2026, 9, 23, 9, 0),
      new Date(2026, 9, 23, 9, 2)
    );
    expect(sessionLayoutItem(short, DAY).end).toEqual(
      new Date(2026, 9, 23, 9, 20)
    );
  });
});
