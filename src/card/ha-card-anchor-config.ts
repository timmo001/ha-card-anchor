import { assign, object, optional, string } from "superstruct";
import { LovelaceCardConfig } from "../ha";
import { lovelaceCardConfigStruct } from "../shared/config/lovelace-card-config";

export interface AnchorCardConfig extends LovelaceCardConfig {
  anchor?: string;
}

export const anchorCardConfigStruct = assign(
  lovelaceCardConfigStruct,
  object({
    anchor: optional(string()),
  })
);

export const normalizeAnchorKey = (value?: string): string | undefined => {
  if (!value?.trim()) {
    return undefined;
  }

  const normalized = value
    .trim()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .replace(/_+/g, "_");

  return normalized || undefined;
};

export const computeAnchorId = (value?: string): string | undefined => {
  const anchor = normalizeAnchorKey(value);

  return anchor ? `anchor_${anchor}` : undefined;
};

export const normalizeAnchorCardConfig = (
  config: AnchorCardConfig
): AnchorCardConfig => {
  const anchor = normalizeAnchorKey(config.anchor);

  if (!anchor) {
    const { anchor: _anchor, ...rest } = config;
    return rest;
  }

  return {
    ...config,
    anchor,
  };
};
