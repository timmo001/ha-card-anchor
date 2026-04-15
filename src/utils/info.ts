export const INFOS = [
  "name",
  "state",
  "last-changed",
  "last-updated",
  "none",
] as const;
export type Info = (typeof INFOS)[number];

export const ICON_TYPES = ["icon", "entity-picture", "none"] as const;
export type IconType = (typeof ICON_TYPES)[number];
