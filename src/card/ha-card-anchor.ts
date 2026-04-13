import { css, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { assert } from "superstruct";
import { HomeAssistant, LovelaceCard, LovelaceCardEditor } from "../ha";
import { BaseElement } from "../utils/base-element";
import { registerCustomCard } from "../utils/custom-cards";
import {
  CARD_DESCRIPTION,
  CARD_EDITOR_NAME,
  CARD_NAME,
  CARD_NAME_FRIENDLY,
} from "./const";
import {
  AnchorCardConfig,
  anchorCardConfigStruct,
  computeAnchorId,
  normalizeAnchorCardConfig,
} from "./ha-card-anchor-config";

registerCustomCard({
  type: CARD_NAME,
  name: CARD_NAME_FRIENDLY,
  description: CARD_DESCRIPTION,
});

@customElement(CARD_NAME)
export class HaCardAnchor extends BaseElement implements LovelaceCard {
  public static async getConfigElement(): Promise<LovelaceCardEditor> {
    await import("./ha-card-anchor-editor");
    return document.createElement(CARD_EDITOR_NAME) as LovelaceCardEditor;
  }

  public static async getStubConfig(): Promise<AnchorCardConfig> {
    return {
      type: `custom:${CARD_NAME}`,
      anchor: "section",
    };
  }

  @property({ attribute: false }) public hass!: HomeAssistant;

  @property({ type: Boolean, reflect: true }) public preview = false;

  @state() private _config?: AnchorCardConfig;

  private _scrollToken = 0;

  public setConfig(config: AnchorCardConfig): void {
    const normalizedConfig = normalizeAnchorCardConfig(config);
    assert(normalizedConfig, anchorCardConfigStruct);
    this._config = normalizedConfig;
    this._applyAnchorId();
    this._scheduleAnchorScroll();
  }

  public connectedCallback(): void {
    super.connectedCallback();
    window.addEventListener("hashchange", this._handleHashChange);
    this._scheduleAnchorScroll();
  }

  public disconnectedCallback(): void {
    super.disconnectedCallback();
    window.removeEventListener("hashchange", this._handleHashChange);
    this._scrollToken++;
  }

  public getCardSize(): number {
    return this.preview ? 1 : 0;
  }

  public getGridOptions() {
    return {
      columns: "full",
      rows: "auto",
      min_columns: 1,
    };
  }

  protected updated(): void {
    this._applyAnchorId();
    this._scheduleAnchorScroll();
  }

  protected render() {
    if (!this.preview) {
      return nothing;
    }

    const anchorId = computeAnchorId(this._config?.anchor);

    return html`
      <ha-card>
        <div class="preview-line">
          <span class="preview-hash">
            ${anchorId
              ? `#${anchorId}`
              : "Set an anchor key in the card editor"}
          </span>
        </div>
      </ha-card>
    `;
  }

  private _handleHashChange = () => {
    this._scheduleAnchorScroll();
  };

  private _applyAnchorId(): void {
    const anchorId = computeAnchorId(this._config?.anchor);

    if (anchorId) {
      this.id = anchorId;
      return;
    }

    this.removeAttribute("id");
  }

  private _scheduleAnchorScroll(): void {
    const anchorId = computeAnchorId(this._config?.anchor);
    const token = ++this._scrollToken;

    if (!anchorId || window.location.hash !== `#${anchorId}`) {
      return;
    }

    this._attemptAnchorScroll(anchorId, token, 0);
  }

  private _attemptAnchorScroll(
    anchorId: string,
    token: number,
    attempt: number
  ): void {
    if (token !== this._scrollToken) {
      return;
    }

    requestAnimationFrame(() => {
      if (
        token !== this._scrollToken ||
        this.id !== anchorId ||
        window.location.hash !== `#${anchorId}`
      ) {
        return;
      }

      this.scrollIntoView({
        behavior: "auto",
        block: "start",
      });

      if (attempt >= 5 || Math.abs(this.getBoundingClientRect().top) < 4) {
        return;
      }

      window.setTimeout(() => {
        this._attemptAnchorScroll(anchorId, token, attempt + 1);
      }, 150);
    });
  }

  static get styles() {
    return [
      super.styles,
      css`
        :host {
          display: block;
          height: 0;
          overflow: hidden;
          scroll-margin-top: 16px;
        }

        :host([preview]) {
          height: auto;
          overflow: visible;
        }

        ha-card {
          --ha-card-padding: 0;
          border: 1px dashed var(--divider-color, rgba(0, 0, 0, 0.12));
          box-shadow: none;
          background: none;
        }

        .preview-line {
          display: flex;
          flex-direction: row;
          align-items: center;
          gap: 8px;
          width: 100%;
          box-sizing: border-box;
          padding: 6px 10px;
          min-height: 0;
        }

        .preview-hash {
          flex: 1 1 auto;
          margin: 0;
          min-width: 0;
          font-family: var(--code-font-family, monospace);
          font-size: 13px;
          line-height: 1.25;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      `,
    ];
  }
}
