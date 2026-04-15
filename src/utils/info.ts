import { HassEntity } from "home-assistant-js-websocket";
import { getEntityPicture } from "../ha";

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

export function computeEntityPicture(stateObj: HassEntity, iconType: IconType) {
  return iconType === "entity-picture" ? getEntityPicture(stateObj) : undefined;
}
