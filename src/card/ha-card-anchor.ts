import { css, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { assert } from "superstruct";
import {
  fireEvent,
  HomeAssistant,
  LovelaceCard,
  LovelaceCardEditor,
} from "../ha";
import { BaseElement } from "../utils/base-element";
import { registerCustomCard } from "../utils/custom-cards";
import {
  CARD_DESCRIPTION,
  CARD_EDITOR_NAME,
  CARD_NAME,
  CARD_NAME_FRIENDLY,
} from "./const";
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

/** Match scroll-margin vs getBoundingClientRect().top (px). */
const SCROLL_ALIGN_TOLERANCE_PX = 16;

/** Backoff: delay before recovery step `step` (0-based), capped. */
const RECOVERY_BACKOFF_MS = (step: number): number =>
  Math.min(Math.round(80 * 1.35 ** step), 2800);

const RECOVERY_MAX_STEPS = 22;

const LOCATION_CHANGED_DEBOUNCE_MS = 150;

/** `hui-card` fires `card-updated` (bubbles, composed) when a card loads or upgrades; wait for quiet period. */
const CARD_SETTLE_QUIET_MS = 500;

/** If no `card-updated` (empty view, etc.), scroll anyway. */
const CARD_SETTLE_FALLBACK_MS = 3500;

/** Home Assistant `entity_id` characters (domain + at least one dot); not as strict as core validation. */
const ENTITY_ID_LIKELY = /^[a-z0-9_.-]+$/i;

function isLikelyEntityId(value: string): boolean {
  if (!value || !value.includes(".")) {
    return false;
  }
  const parts = value.split(".");
  if (parts.length < 2 || parts.some((p) => !p.length)) {
    return false;
  }
  return ENTITY_ID_LIKELY.test(value);
}

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

  /** Hash we already scrolled for; reset on hashchange or anchor id change (native anchor scrolls once per navigation). */
  private _lastScrolledHash: string | null = null;

  /** Cancels in-flight recovery when gen bumps (disconnect / new recovery run). */
  private _lovelaceScrollRetryGen = 0;

  /** Single chain: exponential backoff until aligned or max steps. */
  private _scrollRecoveryTimeoutId?: ReturnType<typeof setTimeout>;

  private _locationChangedDebounceId?: ReturnType<typeof setTimeout>;

  private _cardSettleDebounceId?: ReturnType<typeof setTimeout>;

  private _cardSettleFallbackId?: ReturnType<typeof setTimeout>;

  public setConfig(config: AnchorCardConfig): void {
    const normalizedConfig = normalizeAnchorCardConfig(config);
    assert(normalizedConfig, anchorCardConfigStruct);
    const nextAnchorId = computeAnchorId(normalizedConfig.anchor);
    const prevAnchorId = computeAnchorId(this._config?.anchor);
    if (nextAnchorId !== prevAnchorId) {
      this._lastScrolledHash = null;
    }
    this._config = normalizedConfig;
    this._applyAnchorId();
    this._armDeferredHashScroll();
  }

  public connectedCallback(): void {
    super.connectedCallback();
    window.addEventListener("hashchange", this._handleHashChange);
    window.addEventListener("location-changed", this._onHaLocationChanged);
    window.addEventListener("card-updated", this._onLovelaceCardUpdated, true);
    if (document.readyState !== "complete") {
      window.addEventListener("load", this._onWindowLoad, { once: true });
    }
    this._armDeferredHashScroll();
  }

  public disconnectedCallback(): void {
    super.disconnectedCallback();
    window.removeEventListener("hashchange", this._handleHashChange);
    window.removeEventListener("location-changed", this._onHaLocationChanged);
    window.removeEventListener("card-updated", this._onLovelaceCardUpdated, true);
    this._scrollToken++;
    this._lovelaceScrollRetryGen++;
    this._clearPendingScrollTimers();
    this._lastScrolledHash = null;
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
    this._lastScrolledHash = null;
    this._armDeferredHashScroll();
  };

  /** Home Assistant fires this on router / panel navigation (hui-root). */
  private _onHaLocationChanged = (): void => {
    if (this._locationChangedDebounceId !== undefined) {
      window.clearTimeout(this._locationChangedDebounceId);
    }
    this._locationChangedDebounceId = window.setTimeout(() => {
      this._locationChangedDebounceId = undefined;
      this._maybeRetryScrollForLovelaceUi();
    }, LOCATION_CHANGED_DEBOUNCE_MS);
  };

  private _onWindowLoad = (): void => {
    this._armDeferredHashScroll();
  };

  /**
   * Each `hui-card` dispatches `card-updated` when its inner card loads, lazy-upgrades (`ll-upgrade`),
   * or rebuilds. Debounce: scroll only after {@link CARD_SETTLE_QUIET_MS} with no further updates
   * so heavier cards finish layout first.
   */
  private _onLovelaceCardUpdated = (): void => {
    const anchorId = computeAnchorId(this._config?.anchor);
    if (!anchorId || window.location.hash !== `#${anchorId}`) {
      return;
    }

    if (this._cardSettleDebounceId !== undefined) {
      window.clearTimeout(this._cardSettleDebounceId);
    }

    this._cardSettleDebounceId = window.setTimeout(() => {
      this._cardSettleDebounceId = undefined;

      if (this._cardSettleFallbackId !== undefined) {
        window.clearTimeout(this._cardSettleFallbackId);
        this._cardSettleFallbackId = undefined;
      }

      this._executeHashScroll();
    }, CARD_SETTLE_QUIET_MS);
  };

  private _applyAnchorId(): void {
    const anchorId = computeAnchorId(this._config?.anchor);

    if (anchorId) {
      this.id = anchorId;
      return;
    }

    this.removeAttribute("id");
  }

  private _isScrollAligned(anchorId: string): boolean {
    if (this.id !== anchorId) {
      return false;
    }
    const marginTop = parseFloat(getComputedStyle(this).scrollMarginTop) || 0;
    const top = this.getBoundingClientRect().top;
    return Math.abs(top - marginTop) < SCROLL_ALIGN_TOLERANCE_PX;
  }

  /**
   * If the URL includes {@link ANCHOR_MORE_INFO_ENTITY_PARAM}, fire `hass-more-info` once this
   * anchor is aligned, then strip those query keys from the address bar.
   */
  private _maybeOpenMoreInfoAfterAnchorSettled(): void {
    const anchorId = computeAnchorId(this._config?.anchor);
    if (!anchorId || window.location.hash !== `#${anchorId}`) {
      return;
    }
    if (!this._isScrollAligned(anchorId)) {
      return;
    }

    let url: URL;
    try {
      url = new URL(window.location.href);
    } catch {
      return;
    }

    const entityId = url.searchParams.get(ANCHOR_MORE_INFO_ENTITY_PARAM);
    if (!entityId || !isLikelyEntityId(entityId)) {
      return;
    }

    const view = url.searchParams.get(ANCHOR_MORE_INFO_VIEW_PARAM) ?? undefined;
    url.searchParams.delete(ANCHOR_MORE_INFO_ENTITY_PARAM);
    url.searchParams.delete(ANCHOR_MORE_INFO_VIEW_PARAM);
    const next = `${url.pathname}${url.search}${url.hash}`;
    history.replaceState(history.state, "", next);

    // `MoreInfoMixin` listens on `<home-assistant>` (`../frontend/src/state/more-info-mixin.ts`).
    const root = document.querySelector("home-assistant") as HTMLElement | null;
    fireEvent(root ?? this, "hass-more-info", {
      entityId,
      ...(view !== undefined ? { view } : {}),
    });
  }

  private _clearPendingScrollTimers(): void {
    if (this._scrollRecoveryTimeoutId !== undefined) {
      window.clearTimeout(this._scrollRecoveryTimeoutId);
      this._scrollRecoveryTimeoutId = undefined;
    }
    if (this._locationChangedDebounceId !== undefined) {
      window.clearTimeout(this._locationChangedDebounceId);
      this._locationChangedDebounceId = undefined;
    }
    if (this._cardSettleDebounceId !== undefined) {
      window.clearTimeout(this._cardSettleDebounceId);
      this._cardSettleDebounceId = undefined;
    }
    if (this._cardSettleFallbackId !== undefined) {
      window.clearTimeout(this._cardSettleFallbackId);
      this._cardSettleFallbackId = undefined;
    }
  }

  /**
   * Do not scroll on hash match until cards have had time to load (`card-updated` quiet window),
   * or {@link CARD_SETTLE_FALLBACK_MS} elapses.
   */
  private _armDeferredHashScroll(): void {
    const anchorId = computeAnchorId(this._config?.anchor);
    const hash = window.location.hash;

    if (!anchorId || hash !== `#${anchorId}`) {
      if (this._cardSettleDebounceId !== undefined) {
        window.clearTimeout(this._cardSettleDebounceId);
        this._cardSettleDebounceId = undefined;
      }
      if (this._cardSettleFallbackId !== undefined) {
        window.clearTimeout(this._cardSettleFallbackId);
        this._cardSettleFallbackId = undefined;
      }
      return;
    }

    if (this._cardSettleDebounceId !== undefined) {
      window.clearTimeout(this._cardSettleDebounceId);
      this._cardSettleDebounceId = undefined;
    }
    if (this._cardSettleFallbackId !== undefined) {
      window.clearTimeout(this._cardSettleFallbackId);
      this._cardSettleFallbackId = undefined;
    }

    this._cardSettleFallbackId = window.setTimeout(() => {
      this._cardSettleFallbackId = undefined;
      this._executeHashScroll();
    }, CARD_SETTLE_FALLBACK_MS);
  }

  private _executeHashScroll(): void {
    const anchorId = computeAnchorId(this._config?.anchor);
    if (!anchorId || window.location.hash !== `#${anchorId}`) {
      return;
    }
    if (this._isScrollAligned(anchorId)) {
      this._clearPendingScrollTimers();
      this._maybeOpenMoreInfoAfterAnchorSettled();
      return;
    }
    this._lastScrolledHash = null;
    this._scheduleAnchorScroll();
    this._startLovelaceScrollRecovery();
  }

  /**
   * After HA navigation / full load, wait for cards again (same as initial hash open).
   */
  private _maybeRetryScrollForLovelaceUi(): void {
    const anchorId = computeAnchorId(this._config?.anchor);
    if (!anchorId || window.location.hash !== `#${anchorId}`) {
      return;
    }
    if (this._isScrollAligned(anchorId)) {
      this._clearPendingScrollTimers();
      this._maybeOpenMoreInfoAfterAnchorSettled();
      return;
    }
    this._armDeferredHashScroll();
  }

  /**
   * `hui-root` restores `window` scroll after the view mounts; slow layouts can undo our first
   * `scrollIntoView`. Prefer `location-changed` / `load`; otherwise exponential backoff until aligned
   * or {@link RECOVERY_MAX_STEPS}. Timers stop as soon as {@link _isScrollAligned} is true.
   */
  private _startLovelaceScrollRecovery(): void {
    const anchorId = computeAnchorId(this._config?.anchor);
    const hash = window.location.hash;

    if (!anchorId || hash !== `#${anchorId}`) {
      if (this._scrollRecoveryTimeoutId !== undefined) {
        window.clearTimeout(this._scrollRecoveryTimeoutId);
        this._scrollRecoveryTimeoutId = undefined;
      }
      return;
    }

    if (this._scrollRecoveryTimeoutId !== undefined) {
      window.clearTimeout(this._scrollRecoveryTimeoutId);
      this._scrollRecoveryTimeoutId = undefined;
    }
    const gen = ++this._lovelaceScrollRetryGen;
    this._scheduleRecoveryStep(anchorId, gen, 0);
  }

  private _scheduleRecoveryStep(
    anchorId: string,
    gen: number,
    step: number
  ): void {
    if (step >= RECOVERY_MAX_STEPS) {
      return;
    }

    const delay = RECOVERY_BACKOFF_MS(step);

    this._scrollRecoveryTimeoutId = window.setTimeout(() => {
      this._scrollRecoveryTimeoutId = undefined;

      if (gen !== this._lovelaceScrollRetryGen) {
        return;
      }
      if (window.location.hash !== `#${anchorId}` || this.id !== anchorId) {
        return;
      }

      if (this._isScrollAligned(anchorId)) {
        this._clearPendingScrollTimers();
        this._maybeOpenMoreInfoAfterAnchorSettled();
        return;
      }

      this._lastScrolledHash = null;
      this._scheduleAnchorScroll();
      this._scheduleRecoveryStep(anchorId, gen, step + 1);
    }, delay);
  }

  private _scheduleAnchorScroll(): void {
    const anchorId = computeAnchorId(this._config?.anchor);
    const hash = window.location.hash;

    if (!anchorId || hash !== `#${anchorId}`) {
      return;
    }

    if (this._lastScrolledHash === hash) {
      return;
    }

    const token = ++this._scrollToken;
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

      const aligned = this._isScrollAligned(anchorId);

      if (aligned || attempt >= 5) {
        if (aligned) {
          this._clearPendingScrollTimers();
          this._maybeOpenMoreInfoAfterAnchorSettled();
        }
        if (
          token === this._scrollToken &&
          window.location.hash === `#${anchorId}`
        ) {
          this._lastScrolledHash = window.location.hash;
        }
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
          scroll-margin-top: 80px;
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
