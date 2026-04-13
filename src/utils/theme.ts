import { css } from "lit";

export const themeVariables = css`
  --spacing: var(--energy-spacing, 10px);

  /* Title */
  --title-padding: var(--energy-title-padding, 24px 12px 8px);
  --title-spacing: var(--energy-title-spacing, 8px);
  --title-font-size: var(--energy-title-font-size, 24px);
  --title-font-weight: var(--energy-title-font-weight, normal);
  --title-line-height: var(--energy-title-line-height, 32px);
  --title-color: var(--energy-title-color, var(--primary-text-color));
  --title-letter-spacing: var(--energy-title-letter-spacing, -0.288px);
  --subtitle-font-size: var(--energy-subtitle-font-size, 16px);
  --subtitle-font-weight: var(--energy-subtitle-font-weight, normal);
  --subtitle-line-height: var(--energy-subtitle-line-height, 24px);
  --subtitle-color: var(--energy-subtitle-color, var(--secondary-text-color));
  --subtitle-letter-spacing: var(--energy-subtitle-letter-spacing, 0px);

  /* Card */
  --card-primary-font-size: var(--energy-card-primary-font-size, 14px);
  --card-secondary-font-size: var(--energy-card-secondary-font-size, 12px);
  --card-primary-font-weight: var(--energy-card-primary-font-weight, 500);
  --card-secondary-font-weight: var(--energy-card-secondary-font-weight, 400);
  --card-primary-line-height: var(--energy-card-primary-line-height, 20px);
  --card-secondary-line-height: var(--energy-card-secondary-line-height, 16px);
  --card-primary-color: var(
    --energy-card-primary-color,
    var(--primary-text-color)
  );
  --card-secondary-color: var(
    --energy-card-secondary-color,
    var(--primary-text-color)
  );
  --card-primary-letter-spacing: var(
    --energy-card-primary-letter-spacing,
    0.1px
  );
  --card-secondary-letter-spacing: var(
    --energy-card-secondary-letter-spacing,
    0.4px
  );

  /* Chips */
  --chip-spacing: var(--energy-chip-spacing, 8px);
  --chip-padding: var(--energy-chip-padding, 0 0.25em);
  --chip-height: var(--energy-chip-height, 36px);
  --chip-border-radius: var(--energy-chip-border-radius, 19px);
  --chip-border-width: var(
    --energy-chip-border-width,
    var(--ha-card-border-width, 1px)
  );
  --chip-border-color: var(
    --energy-chip-border-color,
    var(--ha-card-border-color, var(--divider-color))
  );
  --chip-box-shadow: var(
    --energy-chip-box-shadow,
    var(--ha-card-box-shadow, "none")
  );
  --chip-font-size: var(--energy-chip-font-size, 0.3em);
  --chip-font-weight: var(--energy-chip-font-weight, bold);
  --chip-icon-size: var(--energy-chip-icon-size, 0.5em);
  --chip-avatar-padding: var(--energy-chip-avatar-padding, 0.1em);
  --chip-avatar-border-radius: var(--energy-chip-avatar-border-radius, 50%);
  --chip-background: var(
    --energy-chip-background,
    var(--ha-card-background, var(--card-background-color, white))
  );
  /* Controls */
  --control-border-radius: var(--energy-control-border-radius, 12px);
  --control-height: var(--energy-control-height, 42px);
  --control-button-ratio: var(--energy-control-button-ratio, 1);
  --control-icon-size: var(--energy-control-icon-size, 0.5em);
  --control-spacing: var(--energy-control-spacing, 12px);

  /* Slider */
  --slider-threshold: var(--energy-slider-threshold);

  /* Input Number */
  --input-number-debounce: var(--energy-input-number-debounce);

  /* Layout */
  --layout-align: var(--energy-layout-align, center);

  /* Badge */
  --badge-size: var(--energy-badge-size, 16px);
  --badge-icon-size: var(--energy-badge-icon-size, 0.75em);
  --badge-border-radius: var(--energy-badge-border-radius, 50%);

  /* Icon */
  --icon-border-radius: var(--energy-icon-border-radius, 50%);
  --icon-size: var(--energy-icon-size, 36px);
  --icon-symbol-size: var(--energy-icon-symbol-size, 0.667em);
`;

export const themeColorCss = css`
  /* RGB */
  /* Standard colors */
  --rgb-red: var(--energy-rgb-red, var(--default-red));
  --rgb-pink: var(--energy-rgb-pink, var(--default-pink));
  --rgb-purple: var(--energy-rgb-purple, var(--default-purple));
  --rgb-deep-purple: var(--energy-rgb-deep-purple, var(--default-deep-purple));
  --rgb-indigo: var(--energy-rgb-indigo, var(--default-indigo));
  --rgb-blue: var(--energy-rgb-blue, var(--default-blue));
  --rgb-light-blue: var(--energy-rgb-light-blue, var(--default-light-blue));
  --rgb-cyan: var(--energy-rgb-cyan, var(--default-cyan));
  --rgb-teal: var(--energy-rgb-teal, var(--default-teal));
  --rgb-green: var(--energy-rgb-green, var(--default-green));
  --rgb-light-green: var(--energy-rgb-light-green, var(--default-light-green));
  --rgb-lime: var(--energy-rgb-lime, var(--default-lime));
  --rgb-yellow: var(--energy-rgb-yellow, var(--default-yellow));
  --rgb-amber: var(--energy-rgb-amber, var(--default-amber));
  --rgb-orange: var(--energy-rgb-orange, var(--default-orange));
  --rgb-deep-orange: var(--energy-rgb-deep-orange, var(--default-deep-orange));
  --rgb-brown: var(--energy-rgb-brown, var(--default-brown));
  --rgb-light-grey: var(--energy-rgb-light-grey, var(--default-light-grey));
  --rgb-grey: var(--energy-rgb-grey, var(--default-grey));
  --rgb-dark-grey: var(--energy-rgb-dark-grey, var(--default-dark-grey));
  --rgb-blue-grey: var(--energy-rgb-blue-grey, var(--default-blue-grey));
  --rgb-black: var(--energy-rgb-black, var(--default-black));
  --rgb-white: var(--energy-rgb-white, var(--default-white));
  --rgb-disabled: var(--energy-rgb-disabled, var(--default-disabled));

  /* Action colors */
  --rgb-info: var(--energy-rgb-info, var(--rgb-blue));
  --rgb-success: var(--energy-rgb-success, var(--rgb-green));
  --rgb-warning: var(--energy-rgb-warning, var(--rgb-orange));
  --rgb-danger: var(--energy-rgb-danger, var(--rgb-red));

  /* State colors */
  --rgb-state-vacuum: var(--energy-rgb-state-vacuum, var(--rgb-teal));
  --rgb-state-fan: var(--energy-rgb-state-fan, var(--rgb-green));
  --rgb-state-light: var(--energy-rgb-state-light, var(--rgb-orange));
  --rgb-state-entity: var(--energy-rgb-state-entity, var(--rgb-blue));
  --rgb-state-media-player: var(
    --energy-rgb-state-media-player,
    var(--rgb-indigo)
  );
  --rgb-state-lock: var(--energy-rgb-state-lock, var(--rgb-blue));
  --rgb-state-number: var(--energy-rgb-state-number, var(--rgb-blue));
  --rgb-state-humidifier: var(--energy-rgb-state-humidifier, var(--rgb-purple));

  /* State alarm colors */
  --rgb-state-alarm-disarmed: var(
    --energy-rgb-state-alarm-disarmed,
    var(--rgb-info)
  );
  --rgb-state-alarm-armed: var(
    --energy-rgb-state-alarm-armed,
    var(--rgb-success)
  );
  --rgb-state-alarm-triggered: var(
    --energy-rgb-state-alarm-triggered,
    var(--rgb-danger)
  );

  /* State person colors */
  --rgb-state-person-home: var(
    --energy-rgb-state-person-home,
    var(--rgb-success)
  );
  --rgb-state-person-not-home: var(
    --energy-rgb-state-person-not-home,
    var(--rgb-danger)
  );
  --rgb-state-person-zone: var(--energy-rgb-state-person-zone, var(--rgb-info));
  --rgb-state-person-unknown: var(
    --energy-rgb-state-person-unknown,
    var(--rgb-grey)
  );

  /* State update colors */
  --rgb-state-update-on: var(--energy-rgb-state-update-on, var(--rgb-orange));
  --rgb-state-update-off: var(--energy-rgb-update-off, var(--rgb-green));
  --rgb-state-update-installing: var(
    --energy-rgb-update-installing,
    var(--rgb-blue)
  );

  /* State lock colors */
  --rgb-state-lock-locked: var(
    --energy-rgb-state-lock-locked,
    var(--rgb-green)
  );
  --rgb-state-lock-unlocked: var(
    --energy-rgb-state-lock-unlocked,
    var(--rgb-red)
  );
  --rgb-state-lock-pending: var(
    --energy-rgb-state-lock-pending,
    var(--rgb-orange)
  );

  /* State cover colors */
  --rgb-state-cover-open: var(--energy-rgb-state-cover-open, var(--rgb-blue));
  --rgb-state-cover-closed: var(
    --energy-rgb-state-cover-closed,
    var(--rgb-disabled)
  );

  /* State climate colors */
  --rgb-state-climate-auto: var(
    --energy-rgb-state-climate-auto,
    var(--rgb-green)
  );
  --rgb-state-climate-cool: var(
    --energy-rgb-state-climate-cool,
    var(--rgb-blue)
  );
  --rgb-state-climate-dry: var(
    --energy-rgb-state-climate-dry,
    var(--rgb-orange)
  );
  --rgb-state-climate-fan-only: var(
    --energy-rgb-state-climate-fan-only,
    var(--rgb-teal)
  );
  --rgb-state-climate-heat: var(
    --energy-rgb-state-climate-heat,
    var(--rgb-deep-orange)
  );
  --rgb-state-climate-heat-cool: var(
    --energy-rgb-state-climate-heat-cool,
    var(--rgb-green)
  );
  --rgb-state-climate-idle: var(
    --energy-rgb-state-climate-idle,
    var(--rgb-disabled)
  );
  --rgb-state-climate-off: var(
    --energy-rgb-state-climate-off,
    var(--rgb-disabled)
  );
`;
