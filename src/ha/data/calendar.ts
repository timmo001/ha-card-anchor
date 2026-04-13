import type { HomeAssistant } from "../types";

export interface Calendar {
  entity_id: string;
  name?: string;
  backgroundColor?: string;
}

export interface CalendarEvent {
  title: string;
  start: string;
  end?: string;
  backgroundColor?: string;
  borderColor?: string;
  calendar: string;
  eventData: CalendarEventData;
  [key: string]: any;
}

export interface CalendarEventData {
  uid?: string;
  recurrence_id?: string;
  summary: string;
  dtstart: string;
  dtend: string;
  rrule?: string;
  description?: string;
}

/** Values returned by the REST API and by the 2026.5+ event subscription. */
type CalendarDateValue = string | { dateTime: string } | { date: string };

/**
 * Raw event shape from GET /api/calendars/... and from websocket
 * `calendar/event/subscribe` (Home Assistant 2026.5+).
 */
export interface CalendarEventApiData {
  summary: string;
  start: CalendarDateValue;
  end: CalendarDateValue;
  description?: string | null;
  uid?: string | null;
  recurrence_id?: string | null;
  rrule?: string | null;
}

/** Payload pushed by `calendar/event/subscribe` (2026.5+). */
export interface CalendarEventSubscription {
  events: CalendarEventApiData[] | null;
}

/**
 * Real-time calendar event updates (core #156340). Available from Home Assistant 2026.5.
 * @see https://github.com/home-assistant/core/pull/156340
 */
export const supportsCalendarEventSubscription = (
  hass: HomeAssistant
): boolean => {
  const version = hass.config.version;
  if (!version) {
    return false;
  }
  const parts = version.split(".");
  if (parts.length < 2) {
    return false;
  }
  const year = parseInt(parts[0]!, 10);
  const month = parseInt(parts[1]!, 10);
  if (Number.isNaN(year) || Number.isNaN(month)) {
    return false;
  }
  return year > 2026 || (year === 2026 && month >= 5);
};

export const subscribeCalendarEvents = (
  hass: HomeAssistant,
  entity_id: string,
  start: Date,
  end: Date,
  callback: (update: CalendarEventSubscription) => void
) =>
  hass.connection.subscribeMessage<CalendarEventSubscription>(callback, {
    type: "calendar/event/subscribe",
    entity_id,
    start: start.toISOString(),
    end: end.toISOString(),
  });

const getCalendarDate = (dateObj: CalendarDateValue): string | undefined => {
  if (typeof dateObj === "string") {
    return dateObj;
  }
  if ("dateTime" in dateObj) {
    return dateObj.dateTime;
  }
  if ("date" in dateObj) {
    return dateObj.date;
  }
  return undefined;
};

/**
 * Normalize REST or subscription payloads to the card's CalendarEvent model.
 */
export const normalizeSubscriptionEventData = (
  eventData: CalendarEventApiData,
  calendar: Calendar
): CalendarEvent | null => {
  const eventStart = getCalendarDate(eventData.start);
  const eventEnd = getCalendarDate(eventData.end);
  if (!eventStart || !eventEnd) {
    return null;
  }
  const normalizedEventData: CalendarEventData = {
    summary: eventData.summary,
    dtstart: eventStart,
    dtend: eventEnd,
    description: eventData.description ?? undefined,
    uid: eventData.uid ?? undefined,
    recurrence_id: eventData.recurrence_id ?? undefined,
    rrule: eventData.rrule ?? undefined,
  };
  return {
    start: eventStart,
    end: eventEnd,
    title: eventData.summary,
    backgroundColor: calendar.backgroundColor,
    borderColor: calendar.backgroundColor,
    calendar: calendar.entity_id,
    eventData: normalizedEventData,
  };
};

export const fetchCalendarEvents = async (
  hass: HomeAssistant,
  start: Date,
  end: Date,
  calendars: Calendar[]
): Promise<{ events: CalendarEvent[]; errors: string[] }> => {
  if (!start || isNaN(start.getTime()) || !end || isNaN(end.getTime())) {
    console.error("Invalid date range:", { start, end });
    return { events: [], errors: [] };
  }

  const params = encodeURI(
    `?start=${start.toISOString()}&end=${end.toISOString()}`
  );

  const calEvents: CalendarEvent[] = [];
  const errors: string[] = [];
  const promises: Promise<CalendarEventApiData[]>[] = [];

  calendars.forEach((cal) => {
    promises.push(
      hass.callApi<CalendarEventApiData[]>(
        "GET",
        `calendars/${cal.entity_id}${params}`
      )
    );
  });

  for (const [idx, promise] of promises.entries()) {
    let result: CalendarEventApiData[];
    try {
      result = await promise;
    } catch (_err) {
      errors.push(calendars[idx]!.entity_id);
      continue;
    }
    const cal = calendars[idx]!;
    result.forEach((ev) => {
      const normalized = normalizeSubscriptionEventData(ev, cal);
      if (normalized) {
        calEvents.push(normalized);
      }
    });
  }

  return { events: calEvents, errors };
};
