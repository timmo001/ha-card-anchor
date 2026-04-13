import { HassEntity } from "home-assistant-js-websocket";
import { computeDomain } from "../common/entity/compute_domain";

export const UNAVAILABLE = "unavailable";
export const UNKNOWN = "unknown";
export const ON = "on";
export const OFF = "off";

export const UNAVAILABLE_STATES = [UNAVAILABLE, UNKNOWN] as const;
export const OFF_STATES = [UNAVAILABLE, UNKNOWN, OFF] as const;

// Helper function for literal includes without external dependency
const arrayLiteralIncludes =
  <T extends readonly unknown[]>(array: T) =>
  (value: unknown): value is T[number] =>
    array.includes(value as T[number]);

export const isUnavailableState = arrayLiteralIncludes(UNAVAILABLE_STATES);
export const isOffState = arrayLiteralIncludes(OFF_STATES);

export function isActive(stateObj: HassEntity) {
  const domain = computeDomain(stateObj.entity_id);
  const state = stateObj.state;

  if (["button", "input_button", "scene"].includes(domain)) {
    return state !== UNAVAILABLE;
  }

  if (OFF_STATES.includes(state as any)) {
    return false;
  }

  // Custom cases
  switch (domain) {
    case "cover":
    case "valve":
      return !["closed", "closing"].includes(state);
    case "device_tracker":
    case "person":
      return state !== "not_home";
    case "media_player":
      return state !== "standby";
    case "vacuum":
      return !["idle", "docked", "paused"].includes(state);
    case "plant":
      return state === "problem";
    default:
      return true;
  }
}

export function isAvailable(stateObj: HassEntity) {
  return stateObj.state !== UNAVAILABLE;
}

export function isOff(stateObj: HassEntity) {
  return stateObj.state === OFF;
}

export function isUnknown(stateObj: HassEntity) {
  return stateObj.state === UNKNOWN;
}

export function getEntityPicture(stateObj: HassEntity) {
  return (
    (stateObj.attributes.entity_picture_local as string | undefined) ||
    stateObj.attributes.entity_picture
  );
}

export function isNumericState(stateObj: HassEntity): boolean {
  const value = Number(stateObj.state);
  return Number.isFinite(value);
}
