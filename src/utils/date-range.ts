import { HomeAssistant, calcDate, startOfDay, endOfDay, addDays } from "../ha";
import { endOfWeek } from "date-fns";

export function getDateRange(
  dateRange: string,
  hass: HomeAssistant
): { start: Date; end: Date } {
  const now = new Date();
  const locale = hass.locale;
  const config = hass.config;

  switch (dateRange) {
    case "today": {
      const start = now;
      const end = calcDate(now, endOfDay, locale, config);
      return { start, end };
    }
    case "today_tomorrow": {
      const start = now;
      const tomorrow = calcDate(now, addDays, locale, config, 1);
      const end = calcDate(tomorrow, endOfDay, locale, config);
      return { start, end };
    }
    case "tomorrow": {
      const tomorrow = calcDate(now, addDays, locale, config, 1);
      const start = calcDate(tomorrow, startOfDay, locale, config);
      const end = calcDate(tomorrow, endOfDay, locale, config);
      return { start, end };
    }
    case "week": {
      const start = now;
      const endDate = calcDate(now, addDays, locale, config, 6);
      const end = calcDate(endDate, endOfDay, locale, config);
      return { start, end };
    }
    case "this_week": {
      const start = now;
      // Calculate end of week based on HA's first_weekday, then subtract 1 day
      // Home Assistant first_weekday: 0=Monday, 6=Sunday
      // date-fns weekStartsOn: 0=Sunday, 1=Monday, ..., 6=Saturday
      const weekStartsOn = ((locale.first_weekday ?? 0) + 1) % 7;
      const endOfWeekDate = endOfWeek(now, {
        weekStartsOn: weekStartsOn as 0 | 1 | 2 | 3 | 4 | 5 | 6,
      });
      const endDateMinusOne = calcDate(
        endOfWeekDate,
        addDays,
        locale,
        config,
        -1
      );
      const end = calcDate(endDateMinusOne, endOfDay, locale, config);
      return { start, end };
    }
    default: {
      const start = now;
      const end = calcDate(now, endOfDay, locale, config);
      return { start, end };
    }
  }
}
