interface Themes {
  darkMode: boolean;
  default_theme: string;
  themes: Record<string, Record<string, string>>;
}

export type { Themes };
