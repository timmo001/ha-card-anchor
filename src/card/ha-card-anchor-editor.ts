import { css, html, LitElement, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { assert } from "superstruct";
import { configElementStyle, HomeAssistant } from "../ha";
import { HaFormSchema } from "../utils/form/ha-form";
import { CARD_EDITOR_NAME, CARD_NAME } from "./const";
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

  @state() private _copyFeedback?: string;

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
              <div class="copy-block">
                <p class="copy-block__label">Full link</p>
                <p class="copy-block__helper">
                  Copy this URL to keep any current query parameters, including
                  open more-info links, and add this anchor.
                </p>
                <input readonly .value=${fullUrl} @focus=${this._selectInput} />
                <button type="button" @click=${this._copyLink}>
                  Copy link
                </button>
                ${this._copyFeedback
                  ? html`
                      <p class="copy-block__feedback">${this._copyFeedback}</p>
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

  private _selectInput(ev: Event): void {
    const input = ev.currentTarget as HTMLInputElement;
    input.select();
  }

  private async _copyLink(): Promise<void> {
    const fullUrl = this._computeFullUrl();

    if (!fullUrl) {
      return;
    }

    try {
      await navigator.clipboard.writeText(fullUrl);
    } catch (_err) {
      const textarea = document.createElement("textarea");
      textarea.value = fullUrl;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }

    this._copyFeedback = "Copied link to clipboard";
    window.setTimeout(() => {
      if (this._copyFeedback === "Copied link to clipboard") {
        this._copyFeedback = undefined;
      }
    }, 2000);
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

        .copy-block {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .copy-block__label,
        .copy-block__helper,
        .copy-block__feedback {
          margin: 0;
        }

        .copy-block__label {
          font-weight: 600;
        }

        .copy-block__helper,
        .copy-block__feedback {
          color: var(--secondary-text-color);
          font-size: 14px;
          line-height: 1.5;
        }

        input {
          width: 100%;
          box-sizing: border-box;
          padding: 12px;
          border: 1px solid var(--divider-color);
          border-radius: 8px;
          font: inherit;
        }

        button {
          align-self: flex-start;
          padding: 10px 14px;
          border: 1px solid var(--divider-color);
          border-radius: 999px;
          background: none;
          color: inherit;
          font: inherit;
          cursor: pointer;
        }
      `,
    ];
  }
}
