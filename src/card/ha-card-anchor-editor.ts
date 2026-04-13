import { css, html, LitElement, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { assert } from "superstruct";
import { configElementStyle, HomeAssistant } from "../ha";
import { HaFormSchema } from "../utils/form/ha-form";
import { CARD_EDITOR_NAME, CARD_NAME } from "./const";
import {
  ANCHOR_MORE_INFO_ENTITY_PARAM,
  ANCHOR_MORE_INFO_VIEW_PARAM,
} from "./anchor-query-params";
import {
  AnchorCardConfig,
  anchorCardConfigStruct,
  computeAnchorId,
  normalizeAnchorCardConfig,
} from "./ha-card-anchor-config";

@customElement(CARD_EDITOR_NAME)
export class HaCardAnchorEditor extends LitElement {
  @property({ attribute: false }) public hass?: HomeAssistant;

  @state() private _config?: AnchorCardConfig;

  private _schema: readonly HaFormSchema[] = [
    {
      name: "anchor",
      selector: {
        text: {},
      },
    },
  ] as const;

  public setConfig(config: AnchorCardConfig): void {
    const normalizedConfig = normalizeAnchorCardConfig(config);
    assert(normalizedConfig, anchorCardConfigStruct);
    this._config = normalizedConfig;
  }

  protected render() {
    if (!this.hass || !this._config) {
      return nothing;
    }

    const fullUrl = this._computeFullUrl();
    const exampleScrollOnly = this._buildExampleUrl({});
    const exampleMoreInfo = this._buildExampleUrl({
      entityId: "light.living_room",
    });
    const exampleHistory = this._buildExampleUrl({
      entityId: "script.reset_lights",
      view: "history",
    });

    return html`
      <div class="container">
        <ha-form
          .hass=${this.hass}
          .data=${{
            ...this._config,
            anchor: this._config.anchor || "",
          }}
          .schema=${this._schema}
          .computeLabel=${this._computeLabelCallback}
          .computeHelper=${this._computeHelperCallback}
          @value-changed=${this._valueChanged}
        ></ha-form>
        ${fullUrl
          ? html`
              <div class="links-block">
                <p class="links-block__label">Links</p>
                <p class="links-block__helper">
                  The first row keeps your current query string (and drops
                  <code>edit</code> only). The other rows use a clean URL for
                  this dashboard path. For more-info after scroll, use
                  <code>anchor-more-info-*</code> params (not core
                  <code>more-info-entity-id</code>). Replace sample entity ids;
                  views include <code>history</code>, <code>info</code>,
                  <code>settings</code>, <code>related</code>, etc.
                </p>
                ${this._renderLinkRow("This page + anchor", fullUrl)}
                ${exampleScrollOnly && exampleMoreInfo && exampleHistory
                  ? html`
                      ${this._renderLinkRow(
                        "Scroll to anchor only",
                        exampleScrollOnly
                      )}
                      ${this._renderLinkRow(
                        "After scroll, open more-info (default tab)",
                        exampleMoreInfo
                      )}
                      ${this._renderLinkRow(
                        "After scroll, open more-info on History",
                        exampleHistory
                      )}
                    `
                  : nothing}
              </div>
            `
          : nothing}
      </div>
    `;
  }

  private _valueChanged(ev: CustomEvent): void {
    const newConfig = normalizeAnchorCardConfig({
      ...(this._config || { type: `custom:${CARD_NAME}` }),
      ...ev.detail.value,
      type: `custom:${CARD_NAME}`,
    });

    this.dispatchEvent(
      new CustomEvent("config-changed", { detail: { config: newConfig } })
    );
  }

  private _computeFullUrl(): string | undefined {
    const anchorId = computeAnchorId(this._config?.anchor);

    if (!anchorId) {
      return undefined;
    }

    const url = new URL(window.location.href);
    url.hash = anchorId;
    url.searchParams.delete("edit");

    return url.toString();
  }

  /**
   * Example URLs for this dashboard path (no preserved query); uses
   * {@link ANCHOR_MORE_INFO_ENTITY_PARAM} / {@link ANCHOR_MORE_INFO_VIEW_PARAM}.
   */
  private _buildExampleUrl(options: {
    entityId?: string;
    view?: string;
  }): string | undefined {
    const anchorId = computeAnchorId(this._config?.anchor);
    if (!anchorId) {
      return undefined;
    }

    const url = new URL(
      `${window.location.origin}${window.location.pathname}`
    );
    if (options.entityId) {
      url.searchParams.set(ANCHOR_MORE_INFO_ENTITY_PARAM, options.entityId);
    }
    if (options.view) {
      url.searchParams.set(ANCHOR_MORE_INFO_VIEW_PARAM, options.view);
    }
    url.hash = `#${anchorId}`;
    return url.toString();
  }

  private _selectHaTextarea(ev: Event): void {
    const el = ev.currentTarget as HTMLElement & { select?: () => void };
    el.select?.();
  }

  /**
   * Uses {@link https://github.com/home-assistant/frontend/blob/dev/src/components/ha-textarea.ts | ha-textarea}
   * (Lovelace styling). No outer `ha-card` so link rows are not double-framed next to the field chrome.
   * Multiline is for long URLs that wrap; a single-line `ha-textfield` would not.
   */
  private _renderLinkRow(title: string, value: string) {
    return html`
      <div class="link-url-row">
        <div class="link-url-row__title">${title}</div>
        <ha-textarea
          readonly
          resize="vertical"
          .rows=${3}
          .value=${value}
          @focus=${this._selectHaTextarea}
          @click=${this._selectHaTextarea}
        ></ha-textarea>
      </div>
    `;
  }

  private _computeLabelCallback = (schema: HaFormSchema) => {
    switch (schema.name) {
      case "anchor":
        return "Anchor key";
      default:
        return undefined;
    }
  };

  private _computeHelperCallback = (schema: HaFormSchema) => {
    switch (schema.name) {
      case "anchor":
        return `Turns into ${
          (this._config?.anchor &&
            `#${computeAnchorId(this._config.anchor)}`) ||
          "#anchor_section"
        }`;
      default:
        return undefined;
    }
  };

  static get styles() {
    return [
      configElementStyle,
      css`
        .container {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        ha-form {
          display: block;
        }

        .links-block {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .links-block__label {
          font-weight: 600;
          margin: 0;
        }

        .links-block__helper {
          margin: 0;
          color: var(--secondary-text-color);
          font-size: 14px;
          line-height: 1.5;
        }

        .links-block code {
          font-size: 0.92em;
        }

        .link-url-row {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .link-url-row__title {
          font-size: var(--ha-font-size-m);
          font-weight: var(--ha-font-weight-medium);
          color: var(--primary-text-color);
        }

        .link-url-row ha-textarea {
          display: block;
          width: 100%;
        }

        /* Long URLs: wrap inside the inner control (re-exported part from ha-textarea). */
        .link-url-row ha-textarea::part(textarea) {
          overflow-wrap: anywhere;
          word-break: break-word;
          white-space: pre-wrap;
        }
      `,
    ];
  }
}
