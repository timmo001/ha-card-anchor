enum NumberFormat {
  auto = "auto",
  numeric = "numeric",
  scientific = "scientific",
  language = "language",
  system = "system",
  comma_decimal = "comma_decimal",
  decimal_comma = "decimal_comma",
  space_comma = "space_comma",
  none = "none",
}

enum TimeZone {
  local = "local",
  server = "server",
}

interface FrontendLocaleData {
  language: string;
  number_format: NumberFormat;
  time_format: "24" | "12" | "system";
  first_weekday: 0 | 1;
  time_zone: TimeZone;
}

type TranslationCategory = string;

export { NumberFormat, TimeZone };
export type { FrontendLocaleData, TranslationCategory };
