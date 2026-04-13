# Anchor Card

A custom Home Assistant card for creating stable in-page anchor targets in a dashboard.

> [!WARNING]
> This card is experimental, breaking changes may occur.

## Installation

### HACS (Recommended)

Since this card is not yet in the default HACS store, you need to add it as a custom repository:

1. Open HACS in your Home Assistant instance
2. Click the **3 dots** in the top right corner
3. Select **"Custom repositories"**
4. Add repository URL: `https://github.com/timmo001/ha-card-anchor`
5. Select category: **Dashboard**
6. Click **"ADD"**
7. Find "Anchor Card" in the list and click **Download**

### Manual

1. Download `ha-card-anchor.js` from the latest release
2. Place it in your `config/www` folder
3. Add the resource in your Lovelace dashboard

### Publish to a running Home Assistant (SSH)

Same pattern as `ha-dashboard-maintenance`: copy `.env.example` to `.env`, set `PUBLISH_TARGET` (and optional `PUBLISH_PORT`), then run:

```bash
pnpm publish-to-local
```

This builds, checks `dist/ha-card-anchor.js`, and rsyncs it to `/config/www/community/ha-card-anchor/` on the remote.

## Usage

Add the card to your dashboard using the Lovelace UI editor or YAML:

```yaml
type: custom:ha-card-anchor
anchor: nas
```

Open the dashboard with `#anchor_nas` appended to the URL to scroll to this marker.

**More-info after scroll:** Use the anchor-prefixed query params (Home Assistant does not handle these; this card does after the anchor is aligned):

- `anchor-more-info-entity-id` — entity to open in more-info (same idea as core `more-info-entity-id`)
- `anchor-more-info-view` — optional; same idea as core `more-info-view`

Example: `?anchor-more-info-entity-id=script.reset_lights#anchor_lights`

The card dispatches `hass-more-info` on `<home-assistant>` (same listener as the rest of the UI; see `more-info-mixin` in the Home Assistant frontend).

**Do not use** core `more-info-entity-id` (or `more-info-view`) together with an anchor hash: the frontend opens that dialog immediately while this card defers scrolling until cards settle, so the behaviors clash. Use the `anchor-*` params above instead.
