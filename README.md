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

**Incompatibility with `more-info-entity-id`:** Home Assistant opens the more-info dialog from the query string as soon as the Lovelace view loads, while this card intentionally scrolls to the anchor only after cards have settled. Using both in one URL (for example `?more-info-entity-id=script.reset_lights#anchor_lights`) means more-info appears immediately and the anchor scroll can still run afterward, so the two behaviors do not coordinate. Prefer separate links or open more-info after navigating without that query param.
