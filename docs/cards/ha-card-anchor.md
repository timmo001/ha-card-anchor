# Anchor Card

Use this card to create a stable in-page anchor inside a Home Assistant dashboard.

```yaml
type: custom:ha-card-anchor
anchor: nas
```

This creates an anchor target with the id `anchor_nas`.

Open the dashboard with a fragment like `#anchor_nas` to scroll to the card. The editor also shows a full copyable URL that preserves the current query string.
