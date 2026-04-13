import { HassEntity } from "home-assistant-js-websocket";
import { property, state } from "lit/decorators.js";
import {
  HomeAssistant,
  isActive,
  LovelaceGridOptions,
  LovelaceLayoutOptions,
} from "../ha";
import { computeAppearance, AppearanceSharedConfig } from "./appearance";
import { BaseElement } from "./base-element";
import { computeInfoDisplay } from "./info";

type EntitySharedConfig = {
  entity?: string;
  name?: string;
  icon?: string;
};

type BaseConfig = EntitySharedConfig & AppearanceSharedConfig;

export function computeDarkMode(hass?: HomeAssistant): boolean {
  if (!hass) return false;
  return (hass.themes as any).darkMode as boolean;
}
export class BaseCard<
  T extends BaseConfig = BaseConfig,
  E extends HassEntity = HassEntity,
> extends BaseElement {
  @state() protected _config?: T;

  @property({ reflect: true, type: String })
  public layout: string | undefined;

  protected get _stateObj(): E | undefined {
    if (!this._config || !this.hass || !this._config.entity) return undefined;

    const entityId = this._config.entity;
    return this.hass.states[entityId] as E;
  }

  protected get hasControls(): boolean {
    return false;
  }

  setConfig(config: T): void {
    this._config = {
      tap_action: {
        action: "more-info",
      },
      hold_action: {
        action: "more-info",
      },
      ...config,
    };
  }

  public getCardSize(): number | Promise<number> {
    let height = 1;
    if (!this._config) return height;
    const appearance = computeAppearance(this._config);
    if (appearance.layout === "vertical") {
      height += 1;
    }
    if (
      appearance?.layout !== "horizontal" &&
      this.hasControls &&
      !(
        "collapsible_controls" in this._config &&
        this._config?.collapsible_controls
      )
    ) {
      height += 1;
    }
    return height;
  }

  // For HA < 2024.11
  public getLayoutOptions(): LovelaceLayoutOptions {
    if (!this._config) {
      return {
        grid_columns: 2,
        grid_rows: 1,
      };
    }

    const options = {
      grid_columns: 2,
      grid_rows: 0,
    };

    const appearance = computeAppearance(this._config);

    const collapsible_controls =
      "collapsible_controls" in this._config &&
      Boolean(this._config.collapsible_controls);

    const hasInfo =
      appearance.primary_info !== "none" ||
      appearance.secondary_info !== "none";
    const hasIcon = appearance.icon_type !== "none";
    const active = this._stateObj && isActive(this._stateObj);

    const hasControls = this.hasControls && (!collapsible_controls || active);

    if (appearance.layout === "vertical") {
      if (hasIcon) {
        options.grid_rows += 1;
      }
      if (hasInfo) {
        options.grid_rows += 1;
      }
      if (hasControls) {
        options.grid_rows += 1;
      }
    }

    if (appearance.layout === "horizontal") {
      options.grid_rows = 1;
      options.grid_columns = 4;
    }

    if (appearance.layout === "default") {
      if (hasInfo || hasIcon) {
        options.grid_rows += 1;
      }
      if (hasControls) {
        options.grid_rows += 1;
      }
    }

    // If icon only, set 1x1 for size
    if (!hasControls && !hasInfo) {
      options.grid_columns = 1;
      options.grid_rows = 1;
    }

    // Ensure card has at least 1 row
    options.grid_rows = Math.max(options.grid_rows, 1);

    return options;
  }

  public getGridOptions(): LovelaceGridOptions {
    if (!this._config) {
      return {
        columns: 6,
        rows: 1,
      };
    }

    const options = {
      min_rows: 1,
      min_columns: 4,
      columns: 6,
      rows: 0, // initial value
    };

    const appearance = computeAppearance(this._config);

    const collapsible_controls =
      "collapsible_controls" in this._config &&
      Boolean(this._config.collapsible_controls);

    const hasInfo =
      appearance.primary_info !== "none" ||
      appearance.secondary_info !== "none";
    const hasIcon = appearance.icon_type !== "none";
    const active = this._stateObj && isActive(this._stateObj);

    const hasControls = this.hasControls && (!collapsible_controls || active);

    if (appearance.layout === "vertical") {
      if (hasIcon) {
        options.rows += 1;
      }
      if (hasInfo) {
        options.rows += 1;
      }
      if (hasControls) {
        options.rows += 1;
      }
      options.min_columns = 2;
    }

    if (appearance.layout === "horizontal") {
      options.rows = 1;
      options.columns = 12;
    }

    if (appearance.layout === "default") {
      if (hasInfo || hasIcon) {
        options.rows += 1;
      }
      if (hasControls) {
        options.rows += 1;
      }
    }

    // If icon only, set 3x1 for size
    if (!hasControls && !hasInfo) {
      options.columns = 3;
      options.rows = 1;
      options.min_columns = 2;
    }

    // Ensure card has at least 1 row
    options.rows = Math.max(options.rows, 1);
    options.min_rows = options.rows;

    return options;
  }
}
