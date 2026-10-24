import { format, differenceInMinutes, startOfDay, endOfDay } from "date-fns";
import type { WorkSession } from "@open-sunsama/types";
import { cn } from "@/lib/utils";
import { calculateYFromTime, HOUR_HEIGHT } from "@/hooks/useCalendarDnd";
import { useCalendars } from "@/hooks/useCalendars";
import type { LayoutItem, LayoutResult } from "./event-layout";

const COLUMN_GAP_PCT = 1; // gap between side-by-side overlapping items
const DEFAULT_COLOR = "#6B7280"; // gray, the same fallback synced events use

/**
 * The color of the user's connected calendar, so actual time matches their
 * meetings: the default calendar for events, else the first enabled one.
 */
function useCalendarColor(): string {
  const { data: calendars = [] } = useCalendars();
  const calendar =
    calendars.find((c) => c.isEnabled && c.isDefaultForEvents) ??
    calendars.find((c) => c.isEnabled);
  return calendar?.color ?? DEFAULT_COLOR;
}

/** Sessions that overlap the given day. */
export function sessionsOnDay(
  sessions: WorkSession[],
  day: Date
): WorkSession[] {
  return sessions.filter(
    (s) =>
      new Date(s.startedAt) < endOfDay(day) &&
      new Date(s.endedAt) > startOfDay(day)
  );
}

/** A session's slot in the overlap layout, clipped to the given day. */
export function sessionLayoutItem(session: WorkSession, day: Date): LayoutItem {
  const start = new Date(session.startedAt);
  const end = new Date(session.endedAt);
  return {
    id: `session:${session.id}`,
    start: start < startOfDay(day) ? startOfDay(day) : start,
    end: end > endOfDay(day) ? endOfDay(day) : end,
  };
}

interface WorkSessionBlockProps {
  session: WorkSession;
  /** The day being drawn; a session crossing midnight is clipped to it. */
  displayDate: Date;
  layout?: LayoutResult;
  onClick?: () => void;
}

/**
 * Actual time worked on a task, from its timer. Outlined and striped so it
 * reads apart from the solid planned time blocks next to it.
 */
export function WorkSessionBlock({
  session,
  displayDate,
  layout = { lane: 0, columnCount: 1 },
  onClick,
}: WorkSessionBlockProps) {
  const color = useCalendarColor();
  const startTime = new Date(session.startedAt);
  const endTime = new Date(session.endedAt);
  const visible = sessionLayoutItem(session, displayDate);
  const top = calculateYFromTime(visible.start);
  const height =
    (differenceInMinutes(visible.end, visible.start) / 60) * HOUR_HEIGHT;
  const timeLabel = session.isRunning
    ? `Working since ${format(startTime, "h:mm a")}`
    : `Worked ${format(startTime, "h:mm")} – ${format(endTime, "h:mm a")}`;

  return (
    <button
      type="button"
      data-work-session
      className={cn(
        "absolute z-10 my-0.5 overflow-hidden rounded-md border border-dashed px-2 py-0.5 text-left",
        "hover:brightness-95 hover:z-20"
      )}
      style={{
        top: `${top}px`,
        height: `${Math.max(height - 4, 16)}px`,
        left: `calc(${(100 / layout.columnCount) * layout.lane}% + ${layout.lane === 0 ? "4px" : "1px"})`,
        width: `calc(${100 / layout.columnCount - COLUMN_GAP_PCT}% - ${layout.lane === 0 ? "4px" : "1px"})`,
        borderColor: color,
        backgroundImage: `repeating-linear-gradient(135deg, color-mix(in srgb, ${color} 20%, transparent) 0 6px, transparent 6px 12px)`,
      }}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      aria-label={`${session.taskTitle}: ${timeLabel}`}
      title={`${session.taskTitle}\n${timeLabel}`}
    >
      <p className="truncate text-xs font-medium text-foreground">
        {session.taskTitle}
      </p>
      {height >= 40 && (
        <p className="truncate text-xs text-muted-foreground">{timeLabel}</p>
      )}
    </button>
  );
}
