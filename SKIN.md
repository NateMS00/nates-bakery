---
version: alpha
name: "Nate’s Bakery"
description: >
  A glazed-tile kitchen notebook, printed like a catalogue. Every screen sits on porcelain
  white, the milky glaze of a Lisbon azulejo; cobalt marks what is chosen, rated and branded;
  and ochre, the amarelo of polychrome tiles, is the one loud colour, on the single action
  that matters. Things are framed in blue-black ink lines like a block print. Fraunces names
  things big, heavy and soft, with its italic as the human voice; Atkinson Hyperlegible
  carries steps and notes; its mono cut is the archivist's hand for every number, label and
  button, because the real job is reading "125 g" from arm's length with flour on your hands.
  A recipe reads as a record card. Bake Mode is a dark stage with one step, one giant
  outlined number or one big clock at a time. Celebrations are rare and full cobalt.
  Dark mode is the same tile at night: deep cobalt glaze with cream text.

colors:
  # Brand & accent
  primary: "#1D3F9E"
  primary-active: "#142E78"
  primary-wash: "#DDE5F6"
  on-primary: "#FFFDF7"
  ochre: "#E8AE3A"
  ochre-active: "#D69A22"
  on-ochre: "#131A33"
  celebration: "#1D3F9E"
  on-celebration: "#FFFDF7"
  # Surface
  canvas: "#FBFBF9"
  surface-card: "#FFFFFF"
  surface-sunken: "#EEF0F4"
  stage: "#131A33"
  on-stage: "#F5EEDF"
  on-stage-muted: "#A9B0C8"
  stage-track: "#606A8E"
  # Text
  ink: "#131A33"
  body: "#2C3350"
  muted: "#5A617D"
  # Borders
  hairline: "#E4E5E9"
  border: "#7E8290"
  outline: "#131A33"
  # Semantic
  success: "#3B6A2C"
  success-wash: "#E0EBD6"
  warning: "#875208"
  warning-wash: "#F5E6C6"
  error: "#B0341C"
  error-wash: "#F7DDD5"
  info-wash: "#DDE5F6"
  # States
  focus-ring: "#2A5BD7"
  disabled: "#8A8E99"
  surface-disabled: "#ECEDF0"
  scrim: "rgba(19, 26, 51, 0.36)"

colors-dark:
  primary: "#9DB6FF"
  primary-active: "#C3D2FF"
  primary-wash: "#223060"
  on-primary: "#0D1326"
  ochre: "#E9B24A"
  ochre-active: "#F2C66E"
  on-ochre: "#131A33"
  celebration: "#1D3F9E"
  on-celebration: "#FFFDF7"
  canvas: "#0D1326"
  surface-card: "#151D38"
  surface-sunken: "#0A0F1F"
  stage: "#070B17"
  on-stage: "#F5EEDF"
  on-stage-muted: "#A9B0C8"
  stage-track: "#606A8E"
  ink: "#F4F0E6"
  body: "#D5D2C8"
  muted: "#9DA4C0"
  hairline: "#2A3456"
  border: "#6C7497"
  outline: "#D5D2C8"
  success: "#9CCB88"
  success-wash: "#1C2E17"
  warning: "#F0C46A"
  warning-wash: "#3A2E14"
  error: "#F28B74"
  error-wash: "#3D1C16"
  info-wash: "#1E2A52"
  focus-ring: "#8FB0FF"
  disabled: "#6A7090"
  surface-disabled: "#1B2340"
  scrim: "rgba(5, 8, 18, 0.64)"

typography:
  display-lg:
    fontFamily: "'Fraunces', 'Iowan Old Style', Georgia, serif"
    fontSize: 44px
    fontWeight: 600
    lineHeight: 1.05
    letterSpacing: -0.6px
    fontVariationSettings: "'SOFT' 50, 'opsz' 96"
  display-md:
    fontFamily: "'Fraunces', 'Iowan Old Style', Georgia, serif"
    fontSize: 34px
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: -0.4px
    fontVariationSettings: "'SOFT' 50, 'opsz' 72"
  heading:
    fontFamily: "'Fraunces', 'Iowan Old Style', Georgia, serif"
    fontSize: 24px
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: -0.2px
    fontVariationSettings: "'SOFT' 50, 'opsz' 36"
  subheading:
    fontFamily: "'Fraunces', 'Iowan Old Style', Georgia, serif"
    fontSize: 19px
    fontWeight: 500
    fontStyle: italic
    lineHeight: 1.3
    letterSpacing: 0
    fontVariationSettings: "'SOFT' 80, 'opsz' 24"
  step-text:
    fontFamily: "'Atkinson Hyperlegible Next', 'Avenir Next', system-ui, sans-serif"
    fontSize: 24px
    fontWeight: 500
    lineHeight: 1.45
    letterSpacing: 0
  timer:
    fontFamily: "'Atkinson Hyperlegible Mono', 'SF Mono', ui-monospace, monospace"
    fontSize: 34px
    fontWeight: 500
    lineHeight: 1
    letterSpacing: 0
    fontFeatureSettings: "'tnum' 1"
  body-lg:
    fontFamily: "'Atkinson Hyperlegible Next', 'Avenir Next', system-ui, sans-serif"
    fontSize: 18px
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: 0
  body-md:
    fontFamily: "'Atkinson Hyperlegible Next', 'Avenir Next', system-ui, sans-serif"
    fontSize: 17px
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: 0
  body-sm:
    fontFamily: "'Atkinson Hyperlegible Next', 'Avenir Next', system-ui, sans-serif"
    fontSize: 15px
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: 0
  amount:
    fontFamily: "'Atkinson Hyperlegible Mono', 'SF Mono', ui-monospace, monospace"
    fontSize: 17px
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: 0
    fontFeatureSettings: "'tnum' 1"
  amount-lg:
    fontFamily: "'Atkinson Hyperlegible Mono', 'SF Mono', ui-monospace, monospace"
    fontSize: 21px
    fontWeight: 500
    lineHeight: 1.35
    letterSpacing: 0
    fontFeatureSettings: "'tnum' 1"
  button:
    fontFamily: "'Atkinson Hyperlegible Mono', 'SF Mono', ui-monospace, monospace"
    fontSize: 15px
    fontWeight: 500
    lineHeight: 1
    letterSpacing: 1.2px
    textTransform: uppercase
  caption:
    fontFamily: "'Atkinson Hyperlegible Next', 'Avenir Next', system-ui, sans-serif"
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: 0.1px
  label:
    fontFamily: "'Atkinson Hyperlegible Next', 'Avenir Next', system-ui, sans-serif"
    fontSize: 13px
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: 0.9px
    textTransform: uppercase
  wordmark:
    fontFamily: "'Fraunces', 'Iowan Old Style', Georgia, serif"
    fontSize: 24px
    fontWeight: 700
    fontStyle: italic
    lineHeight: 1
    letterSpacing: -0.3px
    fontVariationSettings: "'SOFT' 100, 'opsz' 36"
  tile-title:
    fontFamily: "'Fraunces', 'Iowan Old Style', Georgia, serif"
    fontSize: 18px
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: -0.1px
    fontVariationSettings: "'SOFT' 50, 'opsz' 24"
  display-xl:
    fontFamily: "'Fraunces', 'Iowan Old Style', Georgia, serif"
    fontSize: 64px
    fontSizeMobile: 44px
    fontWeight: 900
    lineHeight: 0.95
    letterSpacing: -1.2px
    fontVariationSettings: "'SOFT' 100, 'opsz' 144"
  bake-number:
    fontFamily: "'Fraunces', 'Iowan Old Style', Georgia, serif"
    fontSize: 120px
    fontSizeMobile: 104px
    fontWeight: 900
    lineHeight: 0.85
    letterSpacing: -2px
    fontVariationSettings: "'SOFT' 100, 'opsz' 144"
    fontFeatureSettings: "'tnum' 1"
  voice:
    fontFamily: "'Fraunces', 'Iowan Old Style', Georgia, serif"
    fontSize: 17px
    fontWeight: 400
    fontStyle: italic
    lineHeight: 1.4
    letterSpacing: 0
    fontVariationSettings: "'SOFT' 100, 'opsz' 24"
  label-mono:
    fontFamily: "'Atkinson Hyperlegible Mono', 'SF Mono', ui-monospace, monospace"
    fontSize: 13px
    fontWeight: 400
    lineHeight: 1.3
    letterSpacing: 1.5px
    textTransform: lowercase
  tab:
    fontFamily: "'Atkinson Hyperlegible Mono', 'SF Mono', ui-monospace, monospace"
    fontSize: 15px
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: 0.3px
  timer-xl:
    fontFamily: "'Atkinson Hyperlegible Mono', 'SF Mono', ui-monospace, monospace"
    fontSize: 64px
    fontSizeMobile: 56px
    fontWeight: 500
    lineHeight: 1
    letterSpacing: -1px
    fontFeatureSettings: "'tnum' 1"

rounded:
  none: 0px
  sm: 4px
  md: 8px
  tile: 10px
  lg: 12px
  full: 9999px

spacing:
  xs: 4px
  sm: 8px
  md: 12px
  base: 16px
  lg: 24px
  xl: 32px
  2xl: 48px
  3xl: 64px
  section: 80px
  section-lg: 120px

sizing:
  touch-min: 48px
  touch-bake: 64px
  control-height: 48px
  icon: 24px
  icon-sm: 18px
  tile-band: 24px
  tile-mark: 18px
  tile-repeat: 32px
  content-max: 1200px
  tab-bar: 56px
  bake-progress: 6px
  bake-clock: 264px
  bake-clock-lg: 320px
  bake-clock-ring: 10px
  outline: 1px
  outline-text: 1.5px
  step-strip: 44px

elevation:
  float: "0 8px 24px rgba(19, 26, 51, 0.14), 0 1px 0 {colors.hairline}"
  bar: "0 -1px 0 {colors.hairline}, 0 -6px 16px rgba(19, 26, 51, 0.08)"
  float-dark: "0 8px 24px rgba(0, 0, 0, 0.5), 0 0 0 1px {colors.hairline}"
  bar-dark: "0 -1px 0 {colors.hairline}, 0 -6px 16px rgba(0, 0, 0, 0.4)"

motion:
  fast: 120ms
  base: 200ms
  sheet: 280ms
  step: 350ms
  celebrate: 600ms
  reduced: 150ms
  easing: "cubic-bezier(0.2, 0.8, 0.2, 1)"

components:
  # ── Buttons ───────────────────────────────────────────
  button-primary:
    backgroundColor: "{colors.ochre}"
    textColor: "{colors.on-ochre}"
    borderColor: "{colors.outline}"
    borderWidth: "{sizing.outline}"
    typography: "{typography.button}"
    rounded: "{rounded.full}"
    minHeight: "{sizing.touch-min}"
    padding: "0 {spacing.lg}"
  button-primary-hover:
    backgroundColor: "{colors.ochre-active}"
  button-primary-active:
    backgroundColor: "{colors.ochre-active}"
    transform: "translateY(1px)"
  button-primary-focus:
    outline: "3px solid {colors.focus-ring}"
    outlineOffset: "3px"
  button-primary-disabled:
    backgroundColor: "{colors.surface-disabled}"
    textColor: "{colors.disabled}"
    borderColor: "{colors.hairline}"
    cursor: "not-allowed"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    borderColor: "{colors.outline}"
    borderWidth: "{sizing.outline}"
    typography: "{typography.button}"
    rounded: "{rounded.full}"
    minHeight: "{sizing.touch-min}"
    padding: "0 {spacing.lg}"
  button-secondary-hover:
    backgroundColor: "{colors.surface-sunken}"
  button-secondary-active:
    backgroundColor: "{colors.surface-sunken}"
    borderColor: "{colors.outline}"
    transform: "translateY(1px)"
  button-secondary-focus:
    outline: "3px solid {colors.focus-ring}"
    outlineOffset: "3px"
  button-secondary-disabled:
    backgroundColor: "{colors.surface-disabled}"
    borderColor: "{colors.hairline}"
    textColor: "{colors.disabled}"
    cursor: "not-allowed"
  button-destructive:
    backgroundColor: "{colors.error}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button}"
    rounded: "{rounded.full}"
    minHeight: "{sizing.touch-min}"
    padding: "0 {spacing.lg}"
  button-destructive-hover:
    backgroundColor: "{colors.error}"
    textDecoration: "underline"
  button-destructive-active:
    transform: "translateY(1px)"
  button-destructive-focus:
    outline: "3px solid {colors.focus-ring}"
    outlineOffset: "3px"
  button-destructive-disabled:
    backgroundColor: "{colors.surface-disabled}"
    textColor: "{colors.disabled}"
    cursor: "not-allowed"
  button-text:
    backgroundColor: "transparent"
    textColor: "{colors.primary}"
    typography: "{typography.body-md}"
    fontWeight: 700
    minHeight: "{sizing.touch-min}"
    padding: "0 {spacing.sm}"
    textDecoration: "none"
  button-text-hover:
    textDecoration: "underline"
    textUnderlineOffset: "3px"
  button-text-active:
    textColor: "{colors.primary-active}"
    textDecoration: "underline"
  button-text-focus:
    outline: "3px solid {colors.focus-ring}"
    outlineOffset: "2px"
    rounded: "{rounded.sm}"
  button-text-disabled:
    textColor: "{colors.disabled}"
    cursor: "not-allowed"
  icon-button:
    backgroundColor: "transparent"
    iconColor: "{colors.ink}"
    iconSize: "{sizing.icon}"
    size: "{sizing.touch-min}"
    rounded: "{rounded.md}"
  icon-button-hover:
    backgroundColor: "{colors.surface-sunken}"
  icon-button-active:
    backgroundColor: "{colors.primary-wash}"
    iconColor: "{colors.primary}"
  icon-button-focus:
    outline: "3px solid {colors.focus-ring}"
    outlineOffset: "2px"
  icon-button-disabled:
    iconColor: "{colors.disabled}"
    cursor: "not-allowed"
  text-link:
    textColor: "{colors.primary}"
    typography: "{typography.body-md}"
    textDecoration: "underline"
    textUnderlineOffset: "3px"
    textDecorationThickness: "1px"
  text-link-hover:
    textDecorationThickness: "2px"
  text-link-active:
    textColor: "{colors.primary-active}"
  text-link-focus:
    outline: "3px solid {colors.focus-ring}"
    outlineOffset: "2px"
    rounded: "{rounded.sm}"
  text-link-disabled:
    textColor: "{colors.disabled}"
    textDecoration: "none"
    cursor: "not-allowed"
  back-link:
    textColor: "{colors.primary}"
    typography: "{typography.button}"
    iconSize: "{sizing.icon-sm}"
    gap: "{spacing.xs}"
    minHeight: "{sizing.touch-min}"
    textDecoration: "none"
  back-link-hover:
    textDecoration: "underline"
    textUnderlineOffset: "3px"
  back-link-active:
    textColor: "{colors.primary-active}"
    textDecoration: "underline"
  back-link-focus:
    textDecoration: "underline"
    outline: "3px solid {colors.focus-ring}"
    outlineOffset: "2px"
    rounded: "{rounded.sm}"
  back-link-disabled:
    textColor: "{colors.disabled}"
    cursor: "not-allowed"
  nav-link:
    textColor: "{colors.body}"
    typography: "{typography.button}"
    minHeight: "{sizing.touch-min}"
    padding: "0 {spacing.md}"
    paddingMobile: "0 {spacing.sm}"
    borderBottom: "3px solid transparent"
  nav-link-hover:
    textColor: "{colors.ink}"
    borderBottom: "3px solid {colors.hairline}"
  nav-link-active:
    textColor: "{colors.primary}"
    borderBottom: "3px solid {colors.primary}"
  nav-link-focus:
    outline: "3px solid {colors.focus-ring}"
    outlineOffset: "2px"
  nav-link-disabled:
    textColor: "{colors.disabled}"
    cursor: "not-allowed"

  # ── Form controls ─────────────────────────────────────
  input:
    backgroundColor: "{colors.surface-card}"
    textColor: "{colors.ink}"
    placeholderColor: "{colors.muted}"
    borderColor: "{colors.border}"
    borderWidth: "1px"
    rounded: "{rounded.md}"
    minHeight: "{sizing.control-height}"
    padding: "0 {spacing.base}"
    typography: "{typography.body-md}"
  input-hover:
    borderColor: "{colors.ink}"
  input-active:
    borderColor: "{colors.primary}"
  input-focus:
    borderColor: "{colors.primary}"
    outline: "3px solid {colors.focus-ring}"
    outlineOffset: "1px"
  input-disabled:
    backgroundColor: "{colors.surface-disabled}"
    borderColor: "{colors.hairline}"
    textColor: "{colors.disabled}"
    cursor: "not-allowed"
  input-error:
    borderColor: "{colors.error}"
    borderWidth: "2px"
    helperTextColor: "{colors.error}"
  amount-input:
    backgroundColor: "{colors.surface-card}"
    textColor: "{colors.ink}"
    borderColor: "{colors.border}"
    borderWidth: "1px"
    rounded: "{rounded.md}"
    minHeight: "{sizing.control-height}"
    padding: "0 {spacing.md}"
    typography: "{typography.amount}"
    textAlign: "right"
    suffixColor: "{colors.muted}"
  amount-input-hover:
    borderColor: "{colors.ink}"
  amount-input-active:
    borderColor: "{colors.primary}"
  amount-input-focus:
    borderColor: "{colors.primary}"
    outline: "3px solid {colors.focus-ring}"
    outlineOffset: "1px"
  amount-input-disabled:
    backgroundColor: "{colors.surface-disabled}"
    textColor: "{colors.disabled}"
    cursor: "not-allowed"
  amount-input-error:
    borderColor: "{colors.error}"
    borderWidth: "2px"
    backgroundColor: "{colors.error-wash}"
    helperTextColor: "{colors.error}"
  textarea:
    backgroundColor: "{colors.surface-card}"
    textColor: "{colors.ink}"
    placeholderColor: "{colors.muted}"
    borderColor: "{colors.border}"
    borderWidth: "1px"
    rounded: "{rounded.md}"
    minHeight: "96px"
    padding: "{spacing.md} {spacing.base}"
    typography: "{typography.body-md}"
  textarea-hover:
    borderColor: "{colors.ink}"
  textarea-active:
    borderColor: "{colors.primary}"
  textarea-focus:
    borderColor: "{colors.primary}"
    outline: "3px solid {colors.focus-ring}"
    outlineOffset: "1px"
  textarea-disabled:
    backgroundColor: "{colors.surface-disabled}"
    textColor: "{colors.disabled}"
    cursor: "not-allowed"
  textarea-error:
    borderColor: "{colors.error}"
    borderWidth: "2px"
    helperTextColor: "{colors.error}"
  select:
    backgroundColor: "{colors.surface-card}"
    textColor: "{colors.ink}"
    borderColor: "{colors.border}"
    borderWidth: "1px"
    rounded: "{rounded.md}"
    minHeight: "{sizing.control-height}"
    padding: "0 {spacing.2xl} 0 {spacing.base}"
    typography: "{typography.body-md}"
    chevronColor: "{colors.primary}"
  select-hover:
    borderColor: "{colors.ink}"
  select-active:
    borderColor: "{colors.primary}"
  select-focus:
    borderColor: "{colors.primary}"
    outline: "3px solid {colors.focus-ring}"
    outlineOffset: "1px"
  select-disabled:
    backgroundColor: "{colors.surface-disabled}"
    textColor: "{colors.disabled}"
    chevronColor: "{colors.disabled}"
    cursor: "not-allowed"
  select-error:
    borderColor: "{colors.error}"
    borderWidth: "2px"
    helperTextColor: "{colors.error}"
  checkbox:
    size: "24px"
    hitArea: "{sizing.touch-min}"
    backgroundColor: "{colors.surface-card}"
    borderColor: "{colors.border}"
    borderWidth: "1.5px"
    rounded: "{rounded.sm}"
    checkedBackgroundColor: "{colors.primary}"
    checkColor: "{colors.on-primary}"
  checkbox-hover:
    borderColor: "{colors.ink}"
  checkbox-active:
    backgroundColor: "{colors.primary}"
    borderColor: "{colors.primary}"
  checkbox-focus:
    outline: "3px solid {colors.focus-ring}"
    outlineOffset: "2px"
  checkbox-disabled:
    backgroundColor: "{colors.surface-disabled}"
    borderColor: "{colors.hairline}"
    checkColor: "{colors.disabled}"
    cursor: "not-allowed"
  checkbox-error:
    borderColor: "{colors.error}"
    borderWidth: "2px"
  radio:
    size: "24px"
    hitArea: "{sizing.touch-min}"
    backgroundColor: "{colors.surface-card}"
    borderColor: "{colors.border}"
    borderWidth: "1.5px"
    rounded: "{rounded.full}"
    checkedBorderColor: "{colors.primary}"
    dotColor: "{colors.primary}"
    dotSize: "10px"
  radio-hover:
    borderColor: "{colors.ink}"
  radio-active:
    borderColor: "{colors.primary}"
    borderWidth: "2px"
  radio-focus:
    outline: "3px solid {colors.focus-ring}"
    outlineOffset: "2px"
  radio-disabled:
    backgroundColor: "{colors.surface-disabled}"
    borderColor: "{colors.hairline}"
    dotColor: "{colors.disabled}"
    cursor: "not-allowed"
  radio-error:
    borderColor: "{colors.error}"
    borderWidth: "2px"
  choice-chip:
    backgroundColor: "{colors.surface-card}"
    textColor: "{colors.ink}"
    borderColor: "{colors.border}"
    borderWidth: "1px"
    typography: "{typography.body-sm}"
    fontWeight: 700
    rounded: "{rounded.md}"
    minHeight: "{sizing.touch-min}"
    padding: "0 {spacing.base}"
    countColor: "{colors.muted}"
    gap: "{spacing.sm}"
  choice-chip-hover:
    borderColor: "{colors.ink}"
    backgroundColor: "{colors.surface-sunken}"
  choice-chip-active:
    backgroundColor: "{colors.primary}"
    borderColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    countColor: "{colors.on-primary}"
  choice-chip-focus:
    outline: "3px solid {colors.focus-ring}"
    outlineOffset: "2px"
  choice-chip-disabled:
    backgroundColor: "{colors.surface-disabled}"
    borderColor: "{colors.hairline}"
    textColor: "{colors.disabled}"
    cursor: "not-allowed"
  toggle:
    trackWidth: "52px"
    trackHeight: "32px"
    hitArea: "{sizing.touch-min}"
    trackColor: "{colors.surface-sunken}"
    trackBorderColor: "{colors.border}"
    thumbColor: "{colors.surface-card}"
    thumbBorderColor: "{colors.border}"
    rounded: "{rounded.full}"
    onTrackColor: "{colors.primary}"
    onThumbColor: "{colors.on-primary}"
  toggle-hover:
    trackBorderColor: "{colors.ink}"
  toggle-active:
    trackColor: "{colors.primary}"
    trackBorderColor: "{colors.primary}"
  toggle-focus:
    outline: "3px solid {colors.focus-ring}"
    outlineOffset: "2px"
  toggle-disabled:
    trackColor: "{colors.surface-disabled}"
    trackBorderColor: "{colors.hairline}"
    thumbColor: "{colors.surface-disabled}"
    cursor: "not-allowed"
  segmented:
    backgroundColor: "{colors.surface-sunken}"
    borderColor: "{colors.border}"
    borderWidth: "1px"
    rounded: "{rounded.md}"
    padding: "{spacing.xs}"
    gap: "{spacing.xs}"
  segmented-item:
    backgroundColor: "transparent"
    textColor: "{colors.body}"
    typography: "{typography.button}"
    rounded: "{rounded.sm}"
    minHeight: "40px"
    hitArea: "{sizing.touch-min}"
    padding: "0 {spacing.md}"
  segmented-item-hover:
    backgroundColor: "{colors.surface-card}"
    textColor: "{colors.ink}"
  segmented-item-active:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
  segmented-item-focus:
    outline: "3px solid {colors.focus-ring}"
    outlineOffset: "1px"
  segmented-item-disabled:
    textColor: "{colors.disabled}"
    cursor: "not-allowed"
  chip-filter:
    backgroundColor: "{colors.primary-wash}"
    textColor: "{colors.primary}"
    typography: "{typography.caption}"
    fontWeight: 700
    rounded: "{rounded.full}"
    minHeight: "36px"
    hitArea: "{sizing.touch-min}"
    padding: "0 {spacing.sm} 0 {spacing.md}"
    removeIconColor: "{colors.primary}"
  chip-filter-hover:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    removeIconColor: "{colors.on-primary}"
  chip-filter-active:
    backgroundColor: "{colors.primary-active}"
    textColor: "{colors.on-primary}"
    removeIconColor: "{colors.on-primary}"
  chip-filter-focus:
    outline: "3px solid {colors.focus-ring}"
    outlineOffset: "2px"
  chip-filter-disabled:
    backgroundColor: "{colors.surface-disabled}"
    textColor: "{colors.disabled}"
    removeIconColor: "{colors.disabled}"
    cursor: "not-allowed"

  # ── Rating & favorite ─────────────────────────────────
  star-rating:
    starSize: "22px"
    starSizePrompt: "40px"
    hitArea: "{sizing.touch-min}"
    gap: "0"
    filledColor: "{colors.primary}"
    emptyStrokeColor: "{colors.border}"
    emptyFillColor: "transparent"
  star-rating-hover:
    previewFillColor: "{colors.primary}"
    previewOpacity: 0.55
  star-rating-active:
    filledColor: "{colors.primary}"
    transform: "scale(1.08)"
  star-rating-focus:
    outline: "3px solid {colors.focus-ring}"
    outlineOffset: "1px"
    rounded: "{rounded.sm}"
  star-rating-disabled:
    filledColor: "{colors.disabled}"
    emptyStrokeColor: "{colors.hairline}"
    cursor: "not-allowed"
  star-display:
    starSize: "16px"
    gap: "2px"
    filledColor: "{colors.primary}"
    emptyStrokeColor: "{colors.border}"
    unratedTextColor: "{colors.muted}"
    unratedTypography: "{typography.caption}"
  favorite-toggle:
    size: "{sizing.touch-min}"
    iconSize: "{sizing.icon}"
    rounded: "{rounded.md}"
    iconColor: "{colors.ink}"
    iconStyle: "outline"
  favorite-toggle-hover:
    backgroundColor: "{colors.surface-sunken}"
  favorite-toggle-active:
    iconColor: "{colors.primary}"
    iconStyle: "filled"
  favorite-toggle-focus:
    outline: "3px solid {colors.focus-ring}"
    outlineOffset: "2px"
  favorite-toggle-disabled:
    iconColor: "{colors.disabled}"
    cursor: "not-allowed"

  # ── Markers & labels ──────────────────────────────────
  marker-estimated:
    backgroundColor: "{colors.warning-wash}"
    textColor: "{colors.warning}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "{spacing.xs} {spacing.sm}"
    glyph: "~"
  marker-converted:
    backgroundColor: "{colors.info-wash}"
    textColor: "{colors.primary}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "{spacing.xs} {spacing.sm}"
    hitArea: "{sizing.touch-min}"
    glyph: "="
  marker-converted-hover:
    textDecoration: "underline"
  marker-converted-active:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
  marker-converted-focus:
    outline: "3px solid {colors.focus-ring}"
    outlineOffset: "2px"
  marker-converted-disabled:
    backgroundColor: "{colors.surface-disabled}"
    textColor: "{colors.disabled}"
  marker-missing:
    backgroundColor: "{colors.error-wash}"
    textColor: "{colors.error}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "{spacing.xs} {spacing.sm}"
    glyph: "!"
  marker-suggested:
    backgroundColor: "transparent"
    textColor: "{colors.muted}"
    borderColor: "{colors.hairline}"
    borderWidth: "1px"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "{spacing.xs} {spacing.sm}"
  category-label:
    textColor: "{colors.primary}"
    typography: "{typography.label}"
  group-heading:
    textColor: "{colors.primary}"
    typography: "{typography.subheading}"
    borderBottom: "1px solid {colors.hairline}"
    paddingBottom: "{spacing.xs}"
    marginTop: "{spacing.lg}"
  time-mark:
    textColor: "{colors.ink}"
    fontWeight: 700
    textDecoration: "none"
    whiteSpace: "nowrap"
  step-eyebrow:
    textColor: "{colors.primary}"
    typography: "{typography.label}"
    fontSize: 15px
    separator: " · "
  step-number:
    textColor: "{colors.primary}"
    typography: "{typography.amount}"
    fontWeight: 700
    minWidth: "2ch"

  # ── Surfaces & list items ─────────────────────────────
  card:
    backgroundColor: "{colors.surface-card}"
    textColor: "{colors.ink}"
    borderColor: "{colors.outline}"
    borderWidth: "{sizing.outline}"
    rounded: "{rounded.tile}"
    padding: "{spacing.base}"
  recipe-tile:
    backgroundColor: "{colors.surface-card}"
    textColor: "{colors.ink}"
    borderColor: "{colors.outline}"
    borderWidth: "{sizing.outline}"
    rounded: "{rounded.tile}"
    picture: "{components.recipe-picture}"
    pictureAspectRatio: "4 / 5"
    pictureRule: "1px solid {colors.outline}"
    textPadding: "{spacing.sm} {spacing.md} {spacing.md}"
    gap: "{spacing.xs}"
    categoryTypography: "{typography.label}"
    categoryColor: "{colors.primary}"
    titleTypography: "{typography.tile-title}"
    titleLines: 2
    metaTypography: "{typography.caption}"
    metaColor: "{colors.muted}"
  recipe-tile-hover:
    titleDecoration: "underline"
    textUnderlineOffset: "3px"
  recipe-tile-active:
    transform: "scale(0.98)"
  recipe-tile-focus:
    outline: "3px solid {colors.focus-ring}"
    outlineOffset: "3px"
    rounded: "{rounded.lg}"
  recipe-tile-disabled:
    textColor: "{colors.disabled}"
    cursor: "default"
  draft-row:
    backgroundColor: "{colors.surface-card}"
    textColor: "{colors.ink}"
    borderColor: "{colors.border}"
    borderWidth: "1px"
    borderStyle: "dashed"
    rounded: "{rounded.lg}"
    padding: "{spacing.md} {spacing.base}"
    typography: "{typography.body-md}"
    statusTypography: "{typography.caption}"
    statusColor: "{colors.muted}"
  draft-row-hover:
    borderColor: "{colors.primary}"
    borderStyle: "solid"
  draft-row-active:
    backgroundColor: "{colors.primary-wash}"
    borderColor: "{colors.primary}"
    borderStyle: "solid"
  draft-row-focus:
    outline: "3px solid {colors.focus-ring}"
    outlineOffset: "2px"
  draft-row-disabled:
    backgroundColor: "{colors.surface-sunken}"
    textColor: "{colors.muted}"
    cursor: "default"
  bake-tile:
    backgroundColor: "{colors.surface-card}"
    textColor: "{colors.ink}"
    borderColor: "{colors.outline}"
    borderWidth: "{sizing.outline}"
    rounded: "{rounded.tile}"
    picture: "{components.recipe-picture}"
    pictureRule: "1px solid {colors.outline}"
    pictureAspectRatio: "1 / 1"
    dateChip: "{components.picture-chip}"
    gap: "{spacing.sm}"
    titleTypography: "{typography.body-sm}"
    titleWeight: 700
    metaTypography: "{typography.caption}"
    metaColor: "{colors.muted}"
  bake-tile-hover:
    titleDecoration: "underline"
  bake-tile-active:
    transform: "scale(0.98)"
  bake-tile-focus:
    outline: "3px solid {colors.focus-ring}"
    outlineOffset: "3px"
    rounded: "{rounded.lg}"
  bake-tile-disabled:
    textColor: "{colors.disabled}"
  check-row:
    borderBottom: "1px solid {colors.outline}"
    padding: "{spacing.md} 0"
    minHeight: "{sizing.touch-min}"
    gap: "{spacing.md}"
    checkSize: "{sizing.icon}"
    uncheckedColor: "{colors.border}"
    checkedColor: "{colors.success}"
    nameTypography: "{typography.body-md}"
    originalTypography: "{typography.caption}"
    originalColor: "{colors.muted}"
    amountTypography: "{typography.amount}"
  check-row-hover:
    backgroundColor: "{colors.surface-sunken}"
  check-row-active:
    backgroundColor: "{colors.primary-wash}"
  check-row-focus:
    outline: "3px solid {colors.focus-ring}"
    outlineOffset: "-3px"
  check-row-disabled:
    textColor: "{colors.disabled}"
  source-card:
    backgroundColor: "{colors.surface-card}"
    borderColor: "{colors.outline}"
    borderWidth: "{sizing.outline}"
    rounded: "{rounded.tile}"
    padding: "{spacing.md}"
    gap: "{spacing.md}"
    reelWidth: "64px"
    reelAspectRatio: "9 / 16"
    reelRounded: "{rounded.md}"
    playBadge: "{components.picture-button}"
    handleTypography: "{typography.body-sm}"
    handleWeight: 700
    captionTypography: "{typography.body-sm}"
    captionColor: "{colors.body}"
    captionLines: 2
  ingredient-row:
    borderBottom: "1px solid {colors.outline}"
    padding: "{spacing.md} 0"
    nameTypography: "{typography.body-md}"
    nameColor: "{colors.ink}"
    amountTypography: "{typography.amount}"
    amountColor: "{colors.ink}"
    unitTypography: "{typography.body-md}"
    unitColor: "{colors.muted}"
    unitGap: "3px"
    originalTypography: "{typography.caption}"
    originalColor: "{colors.muted}"
  timer-row:
    backgroundColor: "{colors.surface-card}"
    borderColor: "{colors.hairline}"
    borderWidth: "1px"
    rounded: "{rounded.lg}"
    padding: "{spacing.md} {spacing.base}"
    labelTypography: "{typography.caption}"
    labelColor: "{colors.muted}"
    timeTypography: "{typography.timer}"
    timeSizeCompact: "28px"
    timeColor: "{colors.ink}"
  timer-row-done:
    backgroundColor: "{colors.warning-wash}"
    borderColor: "{colors.warning}"
    timeColor: "{colors.warning}"
  menu:
    backgroundColor: "{colors.surface-card}"
    borderColor: "{colors.hairline}"
    borderWidth: "1px"
    rounded: "{rounded.lg}"
    shadow: "{elevation.float}"
    padding: "{spacing.xs} 0"
    minWidth: "200px"
  menu-item:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    minHeight: "{sizing.touch-min}"
    padding: "0 {spacing.base}"
  menu-item-hover:
    backgroundColor: "{colors.surface-sunken}"
  menu-item-active:
    backgroundColor: "{colors.primary-wash}"
    textColor: "{colors.primary}"
  menu-item-focus:
    outline: "3px solid {colors.focus-ring}"
    outlineOffset: "-3px"
  menu-item-disabled:
    textColor: "{colors.disabled}"
    cursor: "not-allowed"
  menu-item-destructive:
    textColor: "{colors.error}"

  # ── Feedback ──────────────────────────────────────────
  notice-info:
    backgroundColor: "{colors.info-wash}"
    textColor: "{colors.ink}"
    accentColor: "{colors.primary}"
    borderLeft: "4px solid {colors.primary}"
    rounded: "{rounded.md}"
    padding: "{spacing.md} {spacing.base}"
    typography: "{typography.body-sm}"
  notice-warning:
    backgroundColor: "{colors.warning-wash}"
    textColor: "{colors.ink}"
    accentColor: "{colors.warning}"
    borderLeft: "4px solid {colors.warning}"
    rounded: "{rounded.md}"
    padding: "{spacing.md} {spacing.base}"
    typography: "{typography.body-sm}"
  notice-error:
    backgroundColor: "{colors.error-wash}"
    textColor: "{colors.ink}"
    accentColor: "{colors.error}"
    borderLeft: "4px solid {colors.error}"
    rounded: "{rounded.md}"
    padding: "{spacing.md} {spacing.base}"
    typography: "{typography.body-sm}"
  inline-confirmation:
    backgroundColor: "{colors.success-wash}"
    textColor: "{colors.ink}"
    iconColor: "{colors.success}"
    rounded: "{rounded.md}"
    padding: "{spacing.sm} {spacing.md}"
    typography: "{typography.body-sm}"
  timer-alert:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.heading}"
    padding: "{spacing.base} {spacing.lg}"
    shadow: "{elevation.float}"
    borderBottom: "4px solid {colors.ochre}"
  progress-stage:
    typography: "{typography.body-md}"
    pendingColor: "{colors.muted}"
    currentColor: "{colors.ink}"
    doneColor: "{colors.success}"
    markerSize: "{sizing.icon-sm}"
    gap: "{spacing.sm}"
  skeleton:
    backgroundColor: "{colors.surface-sunken}"
    rounded: "{rounded.sm}"
    shimmerColor: "{colors.hairline}"

  # ── Overlays & bars ───────────────────────────────────
  sheet:
    backgroundColor: "{colors.surface-card}"
    textColor: "{colors.ink}"
    roundedTop: "{rounded.lg}"
    shadow: "{elevation.float}"
    padding: "{spacing.lg} {spacing.base}"
    height: "fit-content"
    maxHeight: "90vh"
    headerCloseButton: "{components.icon-button}"
    handleColor: "{colors.border}"
    scrimColor: "{colors.scrim}"
    topEdge: "{components.tile-band}"
  modal:
    backgroundColor: "{colors.surface-card}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    shadow: "{elevation.float}"
    padding: "{spacing.xl}"
    height: "fit-content"
    maxHeight: "90vh"
    headerCloseButton: "{components.icon-button}"
    scrimColor: "{colors.scrim}"
    titleTypography: "{typography.heading}"
  action-bar:
    backgroundColor: "{colors.canvas}"
    shadow: "{elevation.bar}"
    padding: "{spacing.md} {spacing.base} calc({spacing.md} + env(safe-area-inset-bottom))"
  app-header:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    minHeight: "64px"
    padding: "0 {spacing.base}"
    bottomEdge: "{components.tile-band}"
  app-footer:
    backgroundColor: "{colors.canvas}"
    borderTop: "1px solid {colors.outline}"
    padding: "{spacing.lg} {spacing.base}"
    marginTop: "{spacing.2xl}"
    linkColor: "{colors.muted}"
    typography: "{typography.caption}"
  wordmark:
    textColor: "{colors.primary}"
    typography: "{typography.wordmark}"
  tab-bar:
    backgroundColor: "{colors.canvas}"
    borderTop: "1px solid {colors.outline}"
    height: "{sizing.tab-bar}"
    padding: "0 0 env(safe-area-inset-bottom)"
  tab-bar-item:
    textColor: "{colors.muted}"
    iconSize: "{sizing.icon}"
    labelTypography: "{typography.caption}"
    labelSize: 13px
    gap: "2px"
    minWidth: "{sizing.touch-min}"
  tab-bar-item-hover:
    textColor: "{colors.ink}"
  tab-bar-item-active:
    textColor: "{colors.primary}"
    labelWeight: 700
  tab-bar-item-focus:
    outline: "3px solid {colors.focus-ring}"
    outlineOffset: "-3px"
  tab-bar-item-disabled:
    textColor: "{colors.disabled}"
  view-tab:
    look: "{components.choice-radio}"
    semantics: "tablist"
    groupGapMobile: "{spacing.md}"
    wrapRowGap: "0"
    countTypography: "{typography.label-mono}"
  section-tabs:
    backgroundColor: "{colors.canvas}"
    borderBottom: "1px solid {colors.outline}"
    gap: "{spacing.lg}"
    position: "sticky"
  section-tab:
    textColor: "{colors.muted}"
    typography: "{typography.tab}"
    minHeight: "{sizing.touch-min}"
    borderBottom: "3px solid transparent"
  section-tab-hover:
    textColor: "{colors.ink}"
  section-tab-active:
    textColor: "{colors.primary}"
    borderBottom: "3px solid {colors.primary}"
  section-tab-focus:
    outline: "3px solid {colors.focus-ring}"
    outlineOffset: "-3px"
  section-tab-disabled:
    textColor: "{colors.disabled}"
  cover-picture:
    aspectRatio: "4 / 3"
    maxHeight: "56vh"
    backgroundColor: "{colors.surface-sunken}"
    roundedMobile: "{rounded.none}"
    rounded: "{rounded.lg}"
  picture-button:
    backgroundColor: "{colors.surface-card}"
    iconColor: "{colors.ink}"
    borderColor: "{colors.outline}"
    borderWidth: "{sizing.outline}"
    size: "40px"
    hitArea: "{sizing.touch-min}"
    rounded: "{rounded.full}"
  picture-button-hover:
    backgroundColor: "{colors.surface-sunken}"
  picture-button-active:
    backgroundColor: "{colors.primary-wash}"
    iconColor: "{colors.primary}"
  picture-button-focus:
    outline: "3px solid {colors.focus-ring}"
    outlineOffset: "2px"
  picture-button-disabled:
    iconColor: "{colors.disabled}"
  picture-chip:
    backgroundColor: "{colors.surface-card}"
    textColor: "{colors.ink}"
    typography: "{typography.caption}"
    fontWeight: 700
    borderColor: "{colors.outline}"
    borderWidth: "{sizing.outline}"
    rounded: "{rounded.full}"
    padding: "{spacing.xs} {spacing.sm}"
    inset: "{spacing.sm}"
  bake-progress:
    surface: "{colors.stage}"
    segmentHeight: "{sizing.bake-progress}"
    segmentGap: "4px"
    groupGap: "{spacing.sm}"
    rounded: "{rounded.full}"
    doneColor: "{colors.on-stage}"
    currentColor: "{colors.ochre}"
    pendingColor: "{colors.stage-track}"
    labelTypography: "{typography.label-mono}"
    labelColor: "{colors.on-stage-muted}"
    currentLabelColor: "{colors.on-stage}"
  timer-chip:
    backgroundColor: "{colors.ochre}"
    textColor: "{colors.on-ochre}"
    typography: "{typography.amount}"
    fontSize: 15px
    rounded: "{rounded.full}"
    padding: "0 {spacing.md}"
    minHeight: "32px"
    hitArea: "{sizing.touch-min}"
    icon: "clock"
    whiteSpace: "nowrap"
  timer-chip-hover:
    backgroundColor: "{colors.ochre-active}"
  timer-chip-active:
    backgroundColor: "{colors.ochre-active}"
    transform: "translateY(1px)"
  timer-chip-focus:
    outline: "3px solid {colors.ochre}"
    outlineOffset: "3px"
  timer-chip-disabled:
    backgroundColor: "{colors.stage-track}"
    textColor: "{colors.on-stage-muted}"

  # ── Azulejo motif ─────────────────────────────────────
  tile-band:
    height: "{sizing.tile-band}"
    backgroundColor: "{colors.canvas}"
    patternColor: "{colors.primary}"
    patternRepeat: "{sizing.tile-band}"
    borderTop: "1px solid {colors.primary}"
    borderBottom: "1px solid {colors.primary}"
  tile-mark:
    size: "{sizing.tile-mark}"
    patternColor: "{colors.primary}"
    gap: "{spacing.sm}"
  tile-panel:
    backgroundColor: "{colors.primary-wash}"
    patternColor: "{colors.primary}"
    patternRepeat: "{sizing.tile-repeat}"
    rounded: "{rounded.lg}"
    borderColor: "{colors.primary}"
    borderWidth: "1px"
    aspectRatio: "3 / 2"
  # ── Personality round (October 2026) ──────────────────
  azulejo-fill:
    backgroundColor: "{colors.primary-wash}"
    patternColor: "{colors.primary}"
    patternRepeat: "56px"
    rounded: "{rounded.none}"
  display-title:
    typography: "{typography.display-xl}"
    textColor: "{colors.ink}"
    accentStyle: "italic"
    outlineStroke: "{sizing.outline-text} currentColor"
    outlineMinSize: "44px"
  record-card:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    borderColor: "{colors.outline}"
    borderWidth: "{sizing.outline}"
    rounded: "{rounded.tile}"
    padding: "{spacing.md} {spacing.base}"
    actionsGap: "{spacing.sm}"
  record-row:
    borderBottom: "1px solid {colors.outline}"
    padding: "{spacing.sm} 0"
    minHeight: "40px"
    labelTypography: "{typography.label-mono}"
    labelColor: "{colors.muted}"
    valueTypography: "{typography.body-md}"
    valueColor: "{colors.ink}"
    titleTypography: "{typography.heading}"
    titleLayout: "stacked"
    voiceTypography: "{typography.voice}"
  choice-radio:
    glyphTypography: "{typography.amount}"
    glyphOff: "( )"
    glyphOn: "(●)"
    labelTypography: "{typography.tab}"
    textColor: "{colors.muted}"
    gap: "{spacing.sm}"
    groupGap: "{spacing.lg}"
    groupGapCompact: "{spacing.md}"
    wrapRowGap: "0"
    minHeight: "{sizing.touch-min}"
  choice-radio-hover:
    textColor: "{colors.ink}"
  choice-radio-active:
    textColor: "{colors.ink}"
    glyphColor: "{colors.primary}"
  choice-radio-focus:
    outline: "3px solid {colors.focus-ring}"
    outlineOffset: "2px"
    rounded: "{rounded.sm}"
  choice-radio-disabled:
    textColor: "{colors.disabled}"
  split-hero:
    height: "min(calc(100svh - 64px), 760px)"
    columns: "1fr 1fr"
    divider: "1px solid {colors.outline}"
    stagedPicture: "{components.recipe-picture}"
    stagedFrame: "1px solid {colors.outline}"
    stagedMat: "{colors.surface-card}"
    stagedMatPadding: "{spacing.md}"
    stagedMaxWidth: "72%"
    stagedRounded: "{rounded.tile}"
    backdrop: "{components.azulejo-fill}"
    card: "{components.record-card}"
    cardWidth: "min(400px, 80%)"
  celebration:
    backgroundColor: "{colors.celebration}"
    textColor: "{colors.on-celebration}"
    titleTypography: "{typography.display-xl}"
    bodyTypography: "{typography.body-md}"
    illustrationSize: "160px"
    actionBackground: "{colors.on-celebration}"
    actionText: "{colors.celebration}"
    actionTypography: "{typography.button}"
    actionRounded: "{rounded.full}"
    enterDuration: "{motion.celebrate}"
  celebration-toast:
    backgroundColor: "{colors.celebration}"
    textColor: "{colors.on-celebration}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.full}"
    padding: "{spacing.sm} {spacing.base}"
    duration: "6s"
  bake-stage:
    backgroundColor: "{colors.stage}"
    textColor: "{colors.on-stage}"
    mutedColor: "{colors.on-stage-muted}"
    focusRing: "3px solid {colors.ochre}"
    secondaryButtonBorder: "{colors.on-stage}"
    secondaryButtonText: "{colors.on-stage}"
    padding: "{spacing.base} {spacing.lg}"
  bake-step-number:
    typography: "{typography.bake-number}"
    strokeColor: "{colors.on-stage}"
    strokeWidth: "{sizing.outline-text}"
    fill: "transparent"
  step-stack:
    maxVisible: 3
    maxVisibleCompact: 2
    gap: "{spacing.xs}"
    overflowTypography: "{typography.label-mono}"
    overflowColor: "{colors.on-stage-muted}"
  step-strip:
    backgroundColor: "{colors.on-stage}"
    textColor: "{colors.stage}"
    typography: "{typography.tab}"
    numberTypography: "{typography.amount}"
    rounded: "{rounded.md}"
    padding: "0 {spacing.md}"
    minHeight: "{sizing.step-strip}"
    doneGlyph: "✓"
    runningGlyph: "◷"
  step-strip-hover:
    textDecoration: "underline"
  step-strip-active:
    transform: "scale(0.98)"
  step-strip-focus:
    outline: "3px solid {colors.ochre}"
    outlineOffset: "2px"
  step-strip-disabled:
    textColor: "{colors.stage-track}"
  bake-clock:
    size: "{sizing.bake-clock}"
    sizeLarge: "{sizing.bake-clock-lg}"
    ringWidth: "{sizing.bake-clock-ring}"
    ringColor: "{colors.ochre}"
    trackColor: "{colors.stage-track}"
    tickColor: "{colors.on-stage-muted}"
    timeTypography: "{typography.timer-xl}"
    timeColor: "{colors.on-stage}"
    stateTypography: "{typography.label-mono}"
    stateColor: "{colors.on-stage-muted}"
  bake-clock-done:
    ringColor: "{colors.ochre}"
    ringProgress: "full"
    stateText: "Done"
  timer-pill:
    backgroundColor: "{colors.ochre}"
    textColor: "{colors.on-ochre}"
    rounded: "{rounded.full}"
    minHeight: "{sizing.touch-min}"
    padding: "{spacing.xs} {spacing.xs} {spacing.xs} {spacing.sm}"
    ringSize: "32px"
    labelTypography: "{typography.body-sm}"
    timeTypography: "{typography.amount}"
    actionBorder: "1px solid {colors.on-ochre}"
    maxVisible: 2
---

## Overview

Nate’s Bakery reads like a baker's notebook left on a tiled Lisbon counter. The base canvas is `{colors.canvas}` (#FBFBF9), porcelain: the milky, near-neutral white of real tin glaze, a hair off pure white so white cards still read as a step up. It was a warm cream until October 2026, but cream made everything sepia and muddied the food photos (bakes are already golden and brown); now the warmth comes from the photos and the stars, and cobalt reads as pure as it does on a real tile. `{colors.primary}` (#1D3F9E) is azulejo cobalt, the colour of hand-painted tiles: it marks what is selected (a filter, a scale preset, a favorite), the ratings, and the tile motif that frames the app. What you can do next (Start baking, Import, Save) is the one ochre `{colors.ochre}` button on the screen. Depth is flat: photos and spacing separate content first, 1px ink `{colors.outline}` lines frame tiles and rule lists like a print, and only floating layers get a shadow. Titles are set in Fraunces with its soft axis turned up, which gives a hand-lettered warmth; everything you read while baking is set in Atkinson Hyperlegible, built for low-vision legibility, because grams misread from a metre away ruin a bake.

The design takes its DNA from three places, without copying any of them: the cobalt-on-white repetition of Lisbon's azulejo façades and the historic tile workshops that painted them; the calm, content-first hierarchy of recipe managers like Mela, whose cook mode proved that big type beats clever layout in a kitchen; and the confident pattern-plus-type packaging of Portuguese heritage brands like Claus Porto, where one strong pattern carries the brand so the rest can stay quiet.

**October 2026: the personality round.** The first version was clean but read like a well-made template. Three references reshaped it, none of them copied: **Object & Archive**, an art-print shop that presents each work as a catalogue record (mono labels, serif values, ink rules, typographic radio buttons); **Vibe**, a drinks brand with an oversized soft serif, ink-outlined photos and one loud accent colour; and **Bucks Sauce**, a dark, theatrical site with one idea per screen, outlined numerals and cards that stack as you go. Taken from them: the recipe as a record card, Fraunces at display weight, outlined numerals, ink outlines on everything, ochre as the one loud colour, a dark stage for Bake Mode, and a few celebration moments. Deliberately not taken: their small, faint text, hidden radio inputs, scroll-jacking, loaders in front of content, and motion with no reduced-motion fallback.

**Key Characteristics:**
- Cobalt `{colors.primary}` on porcelain `{colors.canvas}` is the identity, and ink `{colors.ink}` is blue-black, never neutral. Cobalt marks what is selected, rated or branded, and since October 2026 it also gets a few big moments: the azulejo fill behind a recipe without a photo, and the celebration screen.
- Photos lead. Recipes and bakes are shown as large photo tiles (`recipe-tile`, `bake-tile`, `cover-picture`), the way a cookbook would, so the screen is warm because the food is.
- The azulejo motif (`tile-band`, `tile-panel`, and sparingly `tile-mark`) is the signature, used for a few brand moments only: the band under the header and along sheets, and tile fields where a photo is missing or a page is empty. Always decorative, never behind text. Restraint is what keeps it special.
- Ochre `{colors.ochre}` (amarelo, the yellow of polychrome tiles) is the one loud colour: it fills the single primary button on a screen, Bake Mode's current progress segment, and timer chips, clocks and pills. Nothing else.
- Type has three voices: Fraunces names things, big, heavy and soft, with its italic as the human voice ("from Avó Lurdes", bake notes); Atkinson Hyperlegible Next is for reading steps and notes; Atkinson Hyperlegible Mono is the archivist's hand, for every number, record label and button.
- Printed, not plastic: tiles, cards, photos and buttons carry a 1px `{colors.outline}` ink edge, like a block print or a stamped label. Buttons, chips and timer pills are pills (`{rounded.full}`); tiles, cards and photos use `{rounded.tile}` (10px); fields and notices keep `{rounded.md}`.
- Lines are ink, not grout: list rules, record rows, tile and photo frames are `{colors.outline}`. `{colors.hairline}` survives only in skeletons and as the edge of disabled controls. Shadows exist only on `sheet`, `modal`, `menu`, `timer-alert`, and the sticky `action-bar`.
- One idea at a time where it matters: Bake Mode is a dark stage (`bake-stage`) with one step, one giant outlined number or one big clock per screen.

### Voice

The words carry personality too, and cost nothing to build. The voice is a baker's notebook: warm, plain, a little wry, about Nathan's own kitchen.
- **The wink lives in the heading, never in the sentence under it.** Display titles may play ("Nothing out of the oven *yet.*", "This link has gone *stale.*", "Bake no. 5 *in the book.*"); the line under them always says plainly what happened and what to do, so the meaning never depends on the joke.
- **One wink per screen at most**, and only on empty states, system pages, page titles and celebrations. Forms, buttons, field labels, markers, timers and Bake Mode steps stay literal.
- **No jokes in failures that might worry someone**: "Something went *wrong.*", not a pun, when data could be at stake. A stale share link is fine; a failed save is not.
- **The italic word is the human one**: the second half of a display title ("Your *recipes.*"), the source ("from Avó Lurdes"), notes in quotes. Never italic for emphasis inside a sentence.
- **Kitchen words over app words** where they're just as clear: recipe box, bake, oven, in the book; never "items", "entries" or "content".
- Mechanics stay as before: sentence case, no exclamation marks, no "please", no "successfully".

---

## Colors

Every colour has a light value (`colors`) and a dark value (`colors-dark`) under the same token name. Components always reference the token; the theme swaps the value.

### Brand & Accent
- **Cobalt** (`{colors.primary}` — #1D3F9E; dark #9DB6FF): selected states (choice radios, chips, current nav item, favorite on), filled rating stars (9.0:1), links, category labels, group headings, the wordmark, and the tile motif. It reads as "act here" or "this is chosen". 8.3:1 on canvas, so it is also safe for text.
- **Cobalt deep** (`{colors.primary-active}` — #142E78; dark #C3D2FF): hover and pressed state of cobalt surfaces. Darker in light mode, lighter in dark mode, so the pressed state always moves away from the background.
- **Cobalt wash** (`{colors.primary-wash}` — #DDE5F6; dark #223060): the pale blue of a thin glaze. Fill for active filter chips, hovered secondary buttons, pressed list items, and the `tile-panel` ground. Ink text on it is 13.6:1.
- **On cobalt** (`{colors.on-primary}` — #FFFDF7; dark #0D1326): text and icons on cobalt fills. 9.2:1. Kept a touch warm on purpose: it matches the app icon's N.
- **Ochre** (`{colors.ochre}` — #E8AE3A; dark #E9B24A), hover **ochre deep** (`{colors.ochre-active}` — #D69A22; dark #F2C66E): amarelo, the yellow of polychrome tiles and of a well-baked crust. The one loud colour, replacing cobalt as the primary button fill in October 2026 (it replaced the old `crust` token, which was only for stars). Only for: the one `button-primary` per screen, `timer-chip`, `timer-pill`, the `bake-clock` ring, Bake Mode's current progress segment, the `timer-alert` edge, and the focus ring on the dark stage. Text on it is always **on-ochre** (`{colors.on-ochre}` — #131A33 in both themes): 8.6:1, 7.0:1 on hover. Ochre against porcelain is only 1.9:1, so an ochre button always keeps its 1px `{colors.outline}` edge: the edge, not the fill, is what meets the 3:1 non-text rule. Never ochre text.
- **Celebration** (`{colors.celebration}` — #1D3F9E, the same in both themes) with **on-celebration** (`{colors.on-celebration}` — #FFFDF7): the full cobalt screen after a milestone bake and the small bake-saved toast. Fixed deep cobalt in dark mode too (dark-mode `primary` is a light blue that cream text can't sit on). 9.2:1.

### Surface
- **Porcelain** (`{colors.canvas}` — #FBFBF9; dark #0D1326): page background everywhere, and the fill of `app-header`, `tab-bar`, `action-bar`, and `tile-band`. Near-neutral, so cobalt reads at full strength and food photos keep their own colour. Dark mode turns it into night-cobalt glaze.
- **Glazed card** (`{colors.surface-card}` — #FFFFFF; dark #151D38): cards, form fields, sheets, modals, menus, and the solid chips and buttons that sit on photos. Only 1.04:1 against canvas, so a card always keeps its ink `{colors.outline}` edge.
- **Grout** (`{colors.surface-sunken}` — #EEF0F4; dark #0A0F1F): recessed areas: the segmented control track, unselected `view-tab`s, icon-button hover, picture placeholders, skeletons, toggle track. A faint cool grey, the shadow side of glaze.

### Stage
The dark surface of Bake Mode, the same in both themes so Bake Mode always feels like a different mode, and so a bright screen doesn't glare in the kitchen.
- **Stage** (`{colors.stage}` — #131A33; dark #070B17): Bake Mode's background, edge to edge.
- **On stage** (`{colors.on-stage}` — #F5EEDF; dark same): step text, the outlined step number, the clock digits, finished-step strips. 14.9:1 (17.0:1 dark).
- **On stage muted** (`{colors.on-stage-muted}` — #A9B0C8): the step eyebrow, counts, clock state. 8.0:1.
- **Stage track** (`{colors.stage-track}` — #606A8E): pending progress segments and the empty clock ring. 3.2:1 on stage, so it meets the 3:1 non-text rule.

### Text
- **Ink** (`{colors.ink}` — #131A33; dark #F4F0E6): headings, amounts, step text, anything the eye must land on. A blue-black, like the darkest cobalt brushstrokes, so it belongs with the palette. 16.6:1 on canvas.
- **Body** (`{colors.body}` — #2C3350; dark #D5D2C8): longer reading text: notes in the bake log, captions, descriptions. 12:1.
- **Muted** (`{colors.muted}` — #5A617D; dark #9DA4C0): metadata only: "Baked 12 Sep", "Not rated", counts, placeholders, input suffixes. 5.9:1 on canvas, 5.4:1 on grout and 4.8:1 on cobalt wash, so it passes AA even at `{typography.caption}`, but it is never used for body copy.

### Borders & Hairlines
- **Ink outline** (`{colors.outline}` — #131A33; dark #D5D2C8): since October 2026 the line of the system. The 1px edge of tiles, cards, photos, buttons, chips and the record card, and the rule under list rows, record rows, tabs and the header. 16.6:1 on canvas (12.2:1 dark), so every outlined control also meets 3:1 on its own.
- **Grout line** (`{colors.hairline}` — #E4E5E9; dark #2A3456): retired as a structural line; it stays only in skeleton shimmer and the edge of disabled controls.
- **Border** (`{colors.border}` — #7E8290; dark #6C7497): the edge of every control a user must find: inputs, selects, checkboxes, toggles, empty stars, pending progress segments. 3.7:1 on canvas, 3.8:1 on cards, 3.4:1 on grout and 3.0:1 on cobalt wash, so it meets the 3:1 non-text rule on every surface a control sits on, which `hairline` does not. Never use `hairline` for a control's edge.

### Semantic
- **Success** (`{colors.success}` — #3B6A2C; dark #9CCB88) on **Success wash** (`{colors.success-wash}` — #E0EBD6; dark #1C2E17): completed import stages, "Marked as baked", "Link copied". An olive glaze green.
- **Warning** (`{colors.warning}` — #875208; dark #F0C46A) on **Warning wash** (`{colors.warning-wash}` — #F5E6C6; dark #3A2E14): the Estimated marker, the has-estimates notice, a finished timer row. Darker than ochre so text passes: 5.3:1 on its wash.
- **Error** (`{colors.error}` — #B0341C; dark #F28B74) on **Error wash** (`{colors.error-wash}` — #F7DDD5; dark #3D1C16): the Missing marker, field errors, failed import, destructive buttons. A terracotta red, from roof tiles rather than alarm red. 4.9:1 on its wash.
- **Info wash** (`{colors.info-wash}` — #DDE5F6; dark #1E2A52): background of the Converted marker and `notice-info`; text on it uses `{colors.primary}` or `{colors.ink}`.

### States
- **Focus ring** (`{colors.focus-ring}` — #2A5BD7; dark #8FB0FF): the keyboard focus outline on every interactive component, always 3px with an offset so it sits on the background, not on the component. Focus itself moves the same way for every input (into an overlay when it opens, back to its trigger when it closes), but the ring shows only for keyboard use: after a tap or click it stays hidden, and Tab, arrow keys or Esc bring it back. Text fields keep their ring when tapped, since it marks where you're typing. 5.7:1 against canvas and 5.9:1 against cards. Brighter than cobalt so a focused cobalt button still shows a distinct ring.
- **Disabled** (`{colors.disabled}` — #8A8E99; dark #6A7090) on **Disabled surface** (`{colors.surface-disabled}` — #ECEDF0; dark #1B2340): controls that can't be used. They lose their cobalt entirely and turn to grey glaze, so "unavailable" reads by shape and colour, not by opacity. Use sparingly: BONES prefers explaining over disabling (Save recipe stays enabled).
- **Scrim** (`{colors.scrim}`): the dimmed layer behind sheets and modals: cobalt-ink at 36% in light mode, so the canvas dims toward ink instead of flat grey, and near-black at 64% in dark mode.

---

## Typography

**Display face**: Fraunces, a soft old-style serif with an adjustable "softness" axis. Turned to `SOFT 50` for titles, `SOFT 80` for group headings, and `SOFT 100` at `opsz 36` for the wordmark, its rounded terminals feel hand-painted, like lettering on a tile panel, without becoming a novelty face. Since October 2026 it also works at display weight: `display-xl` and `bake-number` use weight 900 with `SOFT 100` at `opsz 144`, the chunky 1970s soft serif the face was designed after (Windsor, Cooper), and `display-title` may set one word in outline. Tried `SOFT 0` at the largest optical size (`opsz 144`) for the wordmark — sharp, high-contrast strokes with thin hairlines, like a sign painter's display lettering — but at the wordmark's 24px size its hairlines broke up at device pixel ratio 1, in both themes; kept the soft cut (2026-10-15). The app icon's N stays on the sharp cut: large enough (180–1024px) that the same hairlines hold up fine there.

**Reading face**: Atkinson Hyperlegible Next, designed by the Braille Institute so letters that are easy to confuse (I, l, 1; O, 0) stay distinct. It carries steps, notes, fields and body text.

**Number face**: Atkinson Hyperlegible Mono, the same family's monospaced cut, for every amount, timer and step number, and since October 2026 for every button (`button`, uppercase), tab (`tab`) and record label (`label-mono`, lowercase): the archivist's hand. Tabular figures keep columns of grams aligned on one right edge, so "85 g" and "125 g" line up for fast scanning.

### Font Import

The fonts are self-hosted, not loaded from Google Fonts: this guarantees Fraunces's `SOFT` axis (the look depends on it), keeps the app working offline as a Home Screen web app, and sends no request to a third party. The source files are the variable TTFs in `design-reference/fonts/` (SIL Open Font License, included). Convert them to woff2 and subset to Latin (Basic Latin, Latin-1 Supplement, Latin Extended-A, plus the ½ ¼ ¾ fractions, °, ×, and typographic punctuation) before shipping.

| Family name | File | Axes kept |
|---|---|---|
| Fraunces | `Fraunces.woff2` | wght 300–900, opsz 9–144, SOFT 0–100 |
| Fraunces (italic) | `Fraunces-Italic.woff2` | same |
| Atkinson Hyperlegible Next | `AtkinsonHyperlegibleNext.woff2` | wght 400–700 |
| Atkinson Hyperlegible Mono | `AtkinsonHyperlegibleMono.woff2` | wght 400–700 |

Weight 900 must survive subsetting (October 2026; it was cut at 700 before). Declare each with `font-display: swap`, and preload the two used in the first viewport (Fraunces upright and Atkinson Hyperlegible Next). In Next.js, `next/font/local` does all of this.

### Type Scale

| Token | Face | Size | Weight | Line Height | Tracking | Use |
|---|---|---|---|---|---|---|
| `display-xl` | Fraunces | 64px (44px mobile) | 900 | 0.95 | -1.2px | Top-level page titles ("Your *bakes.*"), celebration title |
| `bake-number` | Fraunces, outlined | 120px (104px mobile) | 900 | 0.85 | -2px | Bake Mode's step number, decorative |
| `display-lg` | Fraunces | 44px | 600 | 1.05 | -0.6px | Page H1 on desktop (Import, Edit), recipe title on desktop |
| `display-md` | Fraunces | 34px | 600 | 1.1 | -0.4px | Page H1 on mobile; recipe title on mobile |
| `heading` | Fraunces | 24px | 600 | 1.25 | -0.2px | Section H2s, recipe titles in lists, modal titles |
| `subheading` | Fraunces italic | 19px | 500 | 1.3 | 0 | Component group headings (Crust, Filling) |
| `voice` | Fraunces italic | 17px | 400 | 1.4 | 0 | The human voice: "from Avó Lurdes, via reel", quoted bake notes |
| `step-text` | Atkinson Next | 24px | 500 | 1.45 | 0 | Bake Mode's current step (28px from tablet up) |
| `timer-xl` | Atkinson Mono | 64px (56px mobile) | 500 | 1 | -1px | The `bake-clock` digits |
| `timer` | Atkinson Mono | 34px | 500 | 1 | 0 | Remaining time in timer rows |
| `body-lg` | Atkinson Next | 18px | 400 | 1.55 | 0 | Steps on the Recipe and Shared Recipe pages |
| `body-md` | Atkinson Next | 17px | 400 | 1.55 | 0 | Default text, ingredient names, fields |
| `body-sm` | Atkinson Next | 15px | 400 | 1.5 | 0 | Notices, secondary text, bake log notes on mobile |
| `amount` | Atkinson Mono | 17px | 500 | 1.4 | 0 | Grams in ingredient rows, amount inputs, step numbers |
| `amount-lg` | Atkinson Mono | 21px | 500 | 1.35 | 0 | Grams in Bake Mode's "For this step" |
| `button` | Atkinson Mono | 15px | 500 | 1 | 1.2px | Uppercase: buttons, nav links, back links |
| `tab` | Atkinson Mono | 15px | 500 | 1.2 | 0.3px | Section tabs, `choice-radio` labels, step strips |
| `label-mono` | Atkinson Mono | 13px | 400 | 1.3 | 1.5px | Lowercase: record labels, step eyebrow, clock state |
| `caption` | Atkinson Next | 14px | 400 | 1.4 | 0.1px | Metadata: dates, counts, "Not rated", status lines |
| `label` | Atkinson Next | 13px | 700 | 1.2 | 0.9px | Uppercase: category labels, markers, field eyebrows |
| `wordmark` | Fraunces italic | 24px | 700 | 1 | -0.3px | The "Nate’s Bakery" wordmark only |

### Principles
- The body size is 17px, one step above the usual 16, and nothing a baker reads mid-bake is under 15px: phones sit on the counter, not in the hand.
- Fraunces's `WONK` axis stays at the font file's default (on). Its leaning n, m, h and k are part of the hand-made feel, visible in the wordmark; don't set `WONK` to 0.
- Serif is for naming things (recipes, sections, groups, the human voice); sans is for reading (steps, notes); mono is for doing and recording (buttons, tabs, labels, numbers). Never set a step, a button or a field in Fraunces, and never set a recipe title in Atkinson. Bake Mode's step text stays in Atkinson Next on purpose, even on the stage: it is the one thing read from a metre away mid-task. The personality there comes from the outlined number and the clock.
- Outline type (`display-title` accent word, `bake-number`) is only for 44px and up, with a 1.5px stroke, and never for something that must be read quickly. A decorative outlined number is `aria-hidden` when the same information exists as text (the step eyebrow).
- Step numbers use the mono `step-number` in numbered step lists (Recipe page, editor) and `bake-number` in Bake Mode; Bake Mode's text heading is the `step-eyebrow`.
- Every number that is weighed or timed uses a mono token (`amount`, `amount-lg`, `timer`, `step-number`), so figures never shift width as a timer counts down or a scale changes. The unit after it ("g") is set in the reading face in `{colors.muted}`, 3px from the number, because a monospaced space leaves an awkward gap ("250  g").
- Times inside step text ("15 min") are not set in mono; they use `time-mark`, bold in the reading face and the body text color, so the sentence keeps its rhythm and nothing looks like a link.
- Atkinson's zero is slashed in both the Mono and Next cuts, with no plain alternate. It stays: telling 0 from O at arm's length is worth the slightly technical look.
- Weight, not size alone, carries hierarchy in the sans: 400 to read, 500 for steps and amounts, 700 for actions and labels.
- Uppercase appears only in `label` (+0.9px) and `button` (+1.2px, on pill buttons, nav links and back links), and only for one to three words. `button-text` stays sentence case. `label-mono` is always lowercase.

### Font Substitutes
All three faces are free (SIL Open Font License) and self-hosted. Fallbacks, in order: Fraunces → Iowan Old Style → Georgia; Atkinson Hyperlegible Next → Avenir Next → system-ui; Atkinson Hyperlegible Mono → SF Mono → ui-monospace. Fallbacks must keep tabular figures for amounts (`font-variant-numeric: tabular-nums`).

---

## Layout

### Spacing Scale
A 4px base. `{spacing.base}` (16px) is the default gap inside cards and the mobile page gutter; `{spacing.lg}` (24px) separates sections on mobile and sets the tablet gutter; `{spacing.xl}` (32px) separates sections on desktop and sets the desktop gutter; `{spacing.2xl}`–`{spacing.section}` are for empty states and page-level breathing room. BONES's "small / medium / large gap" maps to `{spacing.sm}` / `{spacing.base}` / `{spacing.lg}` (mobile) and `{spacing.md}` / `{spacing.lg}` / `{spacing.xl}` (desktop).

### Grid & Containers
- Max content width: `{sizing.content-max}` (1200px), centered.
- Columns: 4 on mobile, 8 on tablet, 12 on desktop.
- Gutters (page side padding and column gap): `{spacing.base}` on mobile, `{spacing.lg}` on tablet, `{spacing.xl}` on desktop.
- Reading columns (Import, Bake Log, Link Unavailable) cap at 8 of 12 columns so lines stay under about 75 characters.

### Page Top
Every page's content starts `{spacing.lg}` (24px) below the `tile-band` on mobile and `{spacing.xl}` (32px) on tablet and desktop, whatever comes first (an H1, a back link, a message). The band is a frame; nothing should touch it.

### Whitespace Philosophy
Generous around the things you act on, tight inside the things you scan. Ingredient rows are compact (`{spacing.md}` vertical padding) so a whole list fits on one screen; sections breathe (`{spacing.lg}`–`{spacing.xl}`) so the page reads as a sequence of tiles. Empty space is porcelain canvas, a hair off pure white, so a sparse screen still feels like a surface and white cards still lift off it. Since October 2026 major sections get real stage time: the gap after a `split-hero` and between the Recipe page's big sections is `{spacing.section-lg}` (120px) on desktop and `{spacing.2xl}` on mobile. Lists stay dense; the space goes between sections, never between rows. Photo grids are the exception to tight scanning: tiles get `{spacing.md}` between columns and `{spacing.base}` between rows, so each photo reads on its own.

### The Azulejo Motif
The signature pattern is one square tile, repeated. Draw it as an inline SVG at `{sizing.tile-repeat}` (or `{sizing.tile-band}` in the band), stroked in the component's `patternColor`:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true">
  <g fill="none" stroke="currentColor" stroke-width="1.5">
    <path d="M0 6A6 6 0 0 0 6 0M18 0a6 6 0 0 0 6 6M24 18a6 6 0 0 0-6 6M6 24a6 6 0 0 0-6-6"/>
    <path d="M12 4.5 19.5 12 12 19.5 4.5 12Z"/>
  </g>
  <circle cx="12" cy="12" r="2" fill="currentColor"/>
</svg>
```

Quarter circles in each corner meet their neighbours to form full circles across tiles, and the centre diamond gives each tile its own rhythm, which is the classic azulejo effect: a simple unit that becomes a field. The motif is always `aria-hidden` and never carries meaning. Nothing is ever set directly on it: the only things allowed on top are solid components, the `record-card` and, on phones and tablets where the field replaces a cover, the `picture-button`s (Back, Favorite, Share, Edit), the same as on a cover photo.

---

## Elevation

### Surface Tiers
| Tier | Token | Appearance |
|---|---|---|
| Page floor | `{colors.canvas}` | Base layer, porcelain white; photo tiles sit directly on it |
| Recessed | `{colors.surface-sunken}` | Tracks, placeholders, hover wells |
| Card / tile | `{colors.surface-card}` | 1px `{colors.outline}` ink edge, no shadow |
| Sticky bar | `{colors.canvas}` | `{elevation.bar}`: a hairline plus a soft upward shadow |
| Menu, sheet, modal, timer alert | `{colors.surface-card}` | `{elevation.float}` (light) or `{elevation.float-dark}` (dark), over `{colors.scrim}` where modal |

### Shadow Definitions
This system is border-first: cards, tiles and list items use a 1px `{colors.outline}` ink edge and no shadow. Shadows exist only on layers that genuinely float above the page:
- `{elevation.float}`: `0 8px 24px rgba(19, 26, 51, 0.14), 0 1px 0 {colors.hairline}`: menus, sheets, modals, `timer-alert`.
- `{elevation.bar}`: `0 -1px 0 {colors.hairline}, 0 -6px 16px rgba(19, 26, 51, 0.08)`: the sticky `action-bar`, whose shadow points up because it sits at the bottom.
- `{elevation.float-dark}`: `0 8px 24px rgba(0, 0, 0, 0.5), 0 0 0 1px {colors.hairline}`: dark mode replaces `float`, adding a hairline ring because shadows barely show on dark surfaces.
- `{elevation.bar-dark}`: `0 -1px 0 {colors.hairline}, 0 -6px 16px rgba(0, 0, 0, 0.4)`: dark mode replaces `bar` on the sticky `action-bar`, with a stronger shadow so the bar still separates from night-cobalt content.

### Motion
- `{motion.fast}` (120ms): hover and press feedback, chip removal, star fill.
- `{motion.base}` (200ms): disclosure expand (Read more), inline confirmations appearing, check items leaving Needs Your Check.
- `{motion.sheet}` (280ms): sheets sliding up, modals fading and scaling from 0.98.
- `{motion.step}` (350ms): Bake Mode's step change (the new step rises from a -3° tilt and settles; the finished one shrinks into a `step-strip`).
- `{motion.celebrate}` (600ms): the `celebration` screen arriving (title and sticker settle in, once).
- All use `{motion.easing}`. Under `prefers-reduced-motion: reduce`, transitions drop to instant or a plain `{motion.reduced}` (150ms) fade, nothing slides, tilts or scales, and the layout never changes.

**Motion rules (October 2026).** Motion only answers something the user did or a state that changed: a step advanced, a bake saved, a timer finished, tiles arriving on first load. Never scroll-driven: no scroll-jacking, smooth-scroll libraries, pinned sections or scroll-scrubbed text. No loaders in front of content. Nothing loops except a running timer's ring. Durations stay between 120 and 600ms.

---

## Components

**`button-primary`** — Ochre pill (`{colors.ochre}`, `{rounded.full}`) with a 1px `{colors.outline}` edge and `{colors.on-ochre}` uppercase mono `{typography.button}` text, at least `{sizing.touch-min}` tall with `{spacing.lg}` side padding. One per screen: Start baking, Import from a reel, Save recipe, Log a bake, Next step. The one exception: the same action may appear twice when one copy scrolls out of view, such as Save recipe in the page header and again at the end of the sticky left column on Review Import. Two different primary actions on one screen, never. In sticky bars it is full width. States: hover and active deepen to `{colors.ochre-active}` (active also nudges 1px down); focus adds a 3px `{colors.focus-ring}` outline at 3px offset; disabled turns to `{colors.surface-disabled}` with `{colors.disabled}` text and a hairline edge.

**`button-secondary`** — An outlined pill: no fill, 1px `{colors.outline}` edge, ink text; same size and shape as primary. On the stage it turns cream (`{colors.on-stage}` edge and text). For every other action: Mark as baked, Previous, Try another link, Import again, Keep reviewing. States: hover fills `{colors.surface-sunken}`; active keeps it with a 1px press; focus 3px ring at 3px offset; disabled goes grey glaze with a hairline border.

**`button-destructive`** — Terracotta fill (`{colors.error}`) with `{colors.on-primary}` text; used only as the confirming action inside a destructive confirmation (Discard, Delete, Leave, Revoke), never as the first button a user sees. States: hover underlines the label (the colour already sits at its darkest safe value); active presses 1px; focus 3px ring; disabled grey glaze.

**`button-text`** — No fill, cobalt label in the reading face, bold, sentence case (`{typography.body-md}` at 700), `{sizing.touch-min}` hit height. Unlike the pill buttons it is never uppercase mono: it often sits inside or right after a sentence ("1 amount is an estimate. Confirm it"), where uppercase reads as a shout and as a separate button. For low-emphasis actions: Discard (the entry point), Read more, Show less, Show more, Show all, Clear filters, Skip, Undo, Close. States: hover underlines at 3px offset; active darkens to `{colors.primary-active}`; focus 3px ring with `{rounded.sm}`; disabled `{colors.disabled}`.

**`icon-button`** — A `{sizing.touch-min}` square with a `{sizing.icon}` icon in `{colors.ink}`; always has an accessible name. Used for Share, Edit, row menus, account, Exit, Pause, Clear timer. States: hover fills `{colors.surface-sunken}`; active fills `{colors.primary-wash}` and turns the icon cobalt; focus 3px ring; disabled `{colors.disabled}` icon.

**`text-link`** — Cobalt, underlined at 1px with a 3px offset, in the surrounding text's size. Used inside sentences and for navigation-like links: Watch reel, See all bakes, Add notes. Back links use `back-link` instead. States: hover thickens the underline to 2px; active `{colors.primary-active}`; focus 3px ring; disabled grey, no underline.

**`back-link`** — The "‹ Library" / "‹ Recipe title" link at the top of a page: cobalt with an `{sizing.icon-sm}` chevron, in uppercase mono `{typography.button}` when it names a page ("‹ LIBRARY"), and in `{typography.tab}` (mono, sentence case) when it carries a recipe title ("‹ Pastéis de nata"), because a long title in tracked capitals gets far wider and truncates early; no underline at rest, because the chevron and position already make it unmistakably navigation (WCAG only requires the underline for links inside running text). Its hit area is the full `{sizing.touch-min}` height. States: hover underlines at 3px offset; active `{colors.primary-active}` and underlined; focus underlined plus the 3px ring; disabled grey.

**`nav-link`** — The shell's Library and Import links: `{colors.body}` `{typography.button}` with a 3px bottom bar. States: hover darkens to ink and shows a hairline bar; active (current page) turns cobalt with a cobalt bar, and also carries `aria-current="page"`; focus 3px ring; disabled grey. Below 768px its side padding drops to `{spacing.sm}` (8px) and the header items sit 4px apart, so "Nate’s Bakery", Import and the account menu fit on one line at 320px; the 48px tap height never shrinks, and the wordmark never wraps.

**`input`** — Glazed card fill, 1px `{colors.border}` edge (not hairline: it must meet 3:1), `{rounded.md}`, `{sizing.control-height}` tall, `{typography.body-md}`; labels always visible above the field in `{typography.label}` or `{typography.body-sm}` bold, never placeholder-only. States: hover ink border; active cobalt border; focus cobalt border plus 3px ring at 1px offset; disabled grey glaze; error 2px `{colors.error}` border with the message directly below in `{colors.error}` `{typography.body-sm}`, linked with `aria-describedby`.

**`amount-input`** — The grams field in the recipe editor: like `input` but in `{typography.amount}`, right-aligned, with a fixed "g" suffix in `{colors.muted}` inside the field. States match `input`; its error state also fills `{colors.error-wash}`, because a Missing amount is the one error that blocks saving and should be findable at a glance.

**`textarea`** — Like `input`, multi-line, at least 96px tall and growing with content; for step text and bake log notes. States match `input`.

**`select`** — Like `input` with a cobalt chevron at the end; for Category and the desktop Rating filter. States match `input`; disabled also greys the chevron.

**`checkbox`** — A 24px square box with a 1.5px `{colors.border}` edge and `{rounded.sm}` (a slightly eased tile corner), inside a `{sizing.touch-min}` hit area that includes its label. Checked fills cobalt with an `{colors.on-primary}` tick. Used in Bake Mode's ingredient checklist and the Ingredients used picker. States: hover ink border; active (checked) cobalt; focus 3px ring; disabled grey; error 2px error border.

**`radio`** — A 24px round control with a 1.5px `{colors.border}` ring inside a 48px hit area that includes its label; selected shows a 10px cobalt dot and a cobalt ring. For single-choice lists that need to read as a list (long option labels, descriptions under each option). Grouped in a `fieldset` with a legend. States: hover ink ring; active (selected) 2px cobalt ring with the dot; focus 3px ring; disabled grey; error 2px error ring.

**`choice-chip`** — A single-choice option drawn as a tile: glazed card fill, `{colors.border}` edge, bold `body-sm` label with an optional muted count ("Cake 6"), 48px tall, `{rounded.md}`. Chips wrap to new lines, never scroll. The selected chip fills cobalt like a painted tile. Use it instead of `radio` when the options are short and should be seen at a glance (category and rating in the Filters sheet); the group is a radio group for assistive technology (`role="radiogroup"`, each chip `role="radio"` with `aria-checked`). Not to be confused with `chip-filter`, which removes an active filter. States: hover grout fill and ink edge; active (selected) cobalt fill with on-primary text and count; focus 3px ring; disabled grey.

**`toggle`** — A 52×32px pill track (`{colors.surface-sunken}`, border edge) with a round thumb, inside a 48px hit area, always with a visible text label; on state fills the track cobalt. Used for Favorites (desktop filter) and To taste. States: hover ink track border; active (on) cobalt track; focus 3px ring; disabled grey.

**`segmented`** + **`segmented-item`** — A grout-coloured track (`{colors.surface-sunken}`) with a `{colors.border}` edge holding equal items; the selected item fills cobalt with `{colors.on-primary}` text, like one blue tile in a row of white ones. Used for scale presets and the Status filter. Items are 40px tall inside a 48px hit area. Item states: hover card fill and ink text; active (selected) cobalt fill; focus 3px ring at 1px offset; disabled grey text.

**`chip-filter`** — An active-filter chip: cobalt wash pill, cobalt bold caption text, and a remove "×" whose hit area covers the whole chip (48px tall); wraps to new lines, never scrolls. Accessible name reads "Remove filter: Cake". States: hover and active invert to cobalt fill with light text; focus 3px ring; disabled grey.

**`star-rating`** — Five 22px stars, drawn small so the rating supports the title instead of competing with it, each its own 48px target and radio option ("Rate 4 out of 5"); filled stars in cobalt `{colors.primary}` (amarelo until October 2026, when ochre became the button colour), empty stars as `{colors.border}` outlines so an unrated recipe still shows its controls clearly. Pressing the current rating clears it. In a prompt where rating is the only task (the Rating prompt after Mark as baked or a new bake log entry), stars are drawn at `starSizePrompt` (40px), centered, with the Skip action directly below them. States: hover previews the fill up to the pointer at 55% strength; active pops the chosen star to 1.08 scale for `{motion.fast}`; focus 3px ring around the focused star; disabled grey.

**`star-display`** — The read-only rating in lists and shared pages: 16px stars in cobalt with outline empties, labeled "Rated 4 out of 5"; when unrated, the text "Not rated" in `{colors.muted}` `{typography.caption}` replaces the stars.

**`favorite-toggle`** — A heart icon button: outline heart in ink when off, filled cobalt heart when on; announces as a pressed toggle named "Favorite". States: hover grout well; active (on) filled cobalt; focus 3px ring; disabled grey. In recipe lists the same heart appears as a non-interactive mark.

**`marker-estimated`** — An uppercase `label` tag, "~ Estimated", `{colors.warning}` on `{colors.warning-wash}`, `{rounded.sm}`. Always text plus glyph, never colour alone.

**`marker-converted`** — "= Converted", cobalt on `{colors.info-wash}`. On the Recipe page it is a button that reveals the original amount ("was 1 cup"), with `aria-expanded`. States: hover underlines; active inverts to cobalt fill; focus 3px ring; disabled grey.

**`marker-missing`** — "! Missing", `{colors.error}` on `{colors.error-wash}`; appears in Needs Your Check and beside empty amount fields.

**`marker-suggested`** — "Suggested", a quiet outlined tag in `{colors.muted}` with a hairline border, next to a category the importer pre-selected.

**`category-label`** — The recipe's category as an uppercase cobalt `label` above titles. Plain text, not a link.

**`group-heading`** — Component group names (Crust, Filling, Assembly) in Fraunces italic `subheading`, cobalt, with an ink rule under them and `{spacing.lg}` above, like a painted label on a tile panel.

**`time-mark`** — Times detected in step text ("15 min", "2 hours"): bold in the reading face, in `{colors.ink}` like the sentence around it, never breaking across lines. No cobalt and no underline: on the Recipe and Shared Recipe pages it is not interactive, and link styling would invite a tap that does nothing (cobalt is reserved for things you can act on). Weight alone lets times stand out when scanning a step. In Bake Mode the same times become `button-secondary` timer buttons.

**`step-eyebrow`** — The one-line heading above a step in Bake Mode, "filling · step 3 · first rise": `label-mono` at 15px in `{colors.on-stage-muted}`, lowercase, joined with middle dots. It is the page's H1 for assistive technology but visually small; the outlined `bake-number` above it is the visual anchor and is `aria-hidden`. (Before October 2026 this was an uppercase label in the reading face and mono was avoided because "Step 3" read like code; on the stage, next to a giant number, the mono label reads as a catalogue entry instead.)

**`step-number`** — Step numbers in cobalt bold `{typography.amount}`, at least 2 characters wide so steps 1–9 and 10+ align.

**`card`** — The glazed tile: `{colors.surface-card}` with a 1px `{colors.outline}` ink edge, `{rounded.tile}`, `{spacing.base}` padding. For Latest Bake, bake log entries, Needs Your Check, the Source block, and the editor's group blocks. Not interactive.

**`recipe-tile`** — A recipe in the Library grid, drawn like a printed card: a 1px `{colors.outline}` frame at `{rounded.tile}` on a glazed-card fill, the recipe picture at 4:5 on top with an ink rule under it, then, inside `textPadding`, the category label, the title in `tile-title` (2 lines, then truncates), and, only when there is something to say, one meta line in muted caption ("★★★★☆ · Baked 13 Oct"). "Not rated" and "Not baked yet" are not printed here; their absence says it. A favorite shows as a small filled cobalt heart at the end of the meta line. The whole tile is one link. States: hover underlines the title; active presses to 0.98 (instant under reduced motion); focus 3px ring around the whole tile; disabled grey (not used today). Replaces the bordered `recipe-item` card. A recipe without a picture shows `azulejo-fill` in the picture frame.

**`draft-row`** — A text row (no picture) on a glazed card with a dashed `{colors.border}` edge, the visual idea of a tile not yet fired, plus a status caption ("Importing…", "Ready to review"). While importing it is non-interactive and shown in its disabled look (grout fill, muted text) with a live status. States: hover solid cobalt border; active cobalt wash; focus 3px ring; disabled as described.

**`ingredient-row`** — Name in ink `body-md` on the left, grams in ink `amount` on a shared right edge (the "g" unit in muted `body-md`, 3px after the number), an ink rule below each row, and markers or the "was 1 cup" original in muted caption under the name. A "to taste" ingredient shows the words "to taste" in muted `body-md` where the amount would be, with no marker: markers are only for amounts that need attention.

**`timer-row`** — A card with the step label in muted caption and the time in `{typography.timer}` (34px); in Bake Mode's mobile strip, the compact form puts the label on its own truncated line and the time at `timeSizeCompact` (28px) beside the controls; Pause and Clear are `icon-button`s. When the timer finishes, `timer-row-done` fills it with `{colors.warning-wash}` and turns the time and border `{colors.warning}` until dismissed.

**`menu`** + **`menu-item`** — Anchored dropdowns (account menu, row menus on desktop): a glazed card with `{elevation.float}`; items are 48px rows of ink `body-md`. `menu-item-destructive` (Delete) uses `{colors.error}` text. Item states: hover grout fill; active cobalt wash and text; focus 3px inset ring; disabled grey. On mobile, row menus (editor rows, bake log entries) render their items inside a `sheet`; the account menu stays an anchored dropdown on every device, because three items don't justify a sheet.

**`notice-info`**, **`notice-warning`**, **`notice-error`** — One-line banners inside the page (has-estimates, timer alerts card, save failed, import failed): a wash background with a 4px left accent in the semantic colour, ink `body-sm` text, and an optional `button-text` action at the end. Warning is for estimates; info for timer alerts and "Everything checked"; error for failures and the save-blocked summary.

**`inline-confirmation`** — Short success lines that appear in place: "Marked as baked today · Undo", "Link copied". Olive wash with an olive check icon; announced politely to screen readers; disappears after 10 seconds or on the next action.

**`timer-alert`** — The finished-timer banner across the top of the viewport: cobalt fill, `{colors.on-primary}` `heading` text, a 4px ochre bottom edge like a painted tile border, `{elevation.float}`, and a Dismiss `button-secondary` rendered on the dark fill with `{colors.on-primary}` text and border. It is the only cobalt-filled surface that isn't a button, because it is the loudest moment in the app.

**`progress-stage`** — Import stage lines: a small marker (empty circle when pending, spinning ring when current, olive check when done) and the stage name, muted when pending, ink when current, olive when done. The spinner stops under reduced motion and shows "In progress" text.

**`skeleton`** — Loading placeholders in `{colors.surface-sunken}` blocks with `{rounded.sm}`, sized to the final content; a slow shimmer toward `{colors.hairline}`, removed under reduced motion.

**`recipe-picture`** — A recipe's picture: its cover, which is a bake photo Nathan chose as cover, else the reel thumbnail. Cropped to the frame the component asks for (4:5 in `recipe-tile`, 4:3 in `cover-picture`, 1:1 in `bake-tile`), from a stored focal point (default: centre). Its edge comes from the component around it: the tile's ink frame, or the 1px ink outline at `{rounded.tile}` when it stands alone. While it loads, the frame is `{colors.surface-sunken}`. When there is none, the frame becomes a small `tile-panel` (cobalt motif on cobalt wash), the same in both themes, so a recipe without a photo still looks deliberate. Text on pictures: see the rule after `tile-panel`.

**`sheet`** — The mobile bottom sheet: glazed card with top corners at `{rounded.lg}`, a grab handle in `{colors.border}`, a thin `tile-band` along its top edge as the brand touch, over `{colors.scrim}`. Its height fits its content (never empty space below the last element), up to 90% of the viewport, after which the body scrolls; BONES-shell lists the few exceptions with pinned footers or full-screen forms. A header row holds the title and a close X (`icon-button`) at its end; there is no Close button at the bottom.

**`modal`** — The desktop dialog: glazed card, `{rounded.lg}`, `{spacing.xl}` padding, over the scrim, with `{elevation.float}`. Sized to its content up to 90% of the viewport. A header row holds the title in `heading` and a close X (`icon-button`) at its end; actions sit directly under the content, never pushed to a far corner.

**`action-bar`** — The sticky bottom bar on mobile (Start baking, Import from a reel, Save recipe, Log a bake, Bake Mode's step nav): canvas fill, `{elevation.bar}`, `{spacing.md}` padding plus the device's bottom safe area.

**`app-header`** — The shell header: canvas fill, 64px tall, wordmark on the left, with a `tile-band` as its bottom edge on every page of the App and Share variants. In Bake Mode (Focus variant) the band is dropped to keep attention on the step.

**`app-footer`** — The shell footer: canvas fill with an ink top rule, `{spacing.2xl}` above it, and its links (Privacy) in muted `caption`, underlined as `text-link`s. Quiet on purpose: it only has to be findable.

**`wordmark`** — "Nate’s Bakery" (typographic apostrophe) in Fraunces italic `wordmark` style, cobalt. Links to the Library in the App variant; plain text in the Share variant.

**`app-icon`** — The Home Screen and app icon: an azulejo tile frame (rounded square outline with a diamond at each corner) around the wordmark's italic N, tin glaze (#F6F2E8, the app's canvas before October 2026, kept in the icon as a brand colour on purpose: on cobalt the warm cream feels hand-glazed) on cobalt (`{colors.primary}`), full bleed, square corners (iOS rounds them). The N uses the sharp cut (`SOFT 0`, `opsz 144`), unlike the wordmark: at icon sizes its hairlines hold up. Exports: 1024 master, 512 and 192 (web manifest, purpose any), apple-touch-icon 180. Artwork: `design-reference/icons/app-icon.svg`; source in the Design System file, Branding → Logo (chosen by Nathan, 2026-10-15).

**`favicon`** — The browser tab icon: the N alone on cobalt, no frame, because at 16–32px the frame turns to noise. Soft cut, matching the wordmark (`SOFT 100`, `opsz 36`): `design-reference/icons/favicon-chunky.svg`. The sharp version (`favicon-sharp.svg`) is kept for reference; its hairlines break up at tab size.

**`tile-band`** — A 24px strip of the azulejo motif in cobalt on canvas, between two 1px cobalt rules, like the painted border (barra) that frames a tile panel. Used under `app-header` on top-level screens (Library, Import, Bakes) and along the top of `sheet`. Not on the Recipe page when it has a cover: the photo is the header there. Decorative and hidden from assistive technology.

**`tile-mark`** — A single 18px azulejo tile in cobalt. Since October 2026 it is no longer stamped before every H2: repeated on every section it stopped meaning anything. It is kept for two places only: the centre of a picture placeholder while it loads, and before the heading of an empty state. Section titles stand on type alone. Decorative and hidden from assistive technology.

**`tile-panel`** — A 3:2 panel of the motif at 32px repeat, cobalt on `{colors.primary-wash}`, with a cobalt 1px frame. Used as the illustration in empty states (Library empty, Bakes empty, Bake log empty), during import processing, on Link Unavailable, and, small, in place of a missing picture. Text always sits outside the panel, never on it.

**Text on pictures** (rule for every photo) — No text is ever set directly on a photo. What may sit on one is a solid `picture-chip` or `picture-button` (glazed-card fill, never translucent, never a gradient scrim), because its contrast then doesn't depend on the photo. Keep them to the corners, `{spacing.sm}` in from the edge.

**`cover-picture`** — The recipe's large picture at the top of the Recipe page: 4:3, full bleed on mobile (edge to edge, square corners, starting under the status bar), `{rounded.lg}` and inside the content column on tablet and desktop, capped at 56% of the viewport height. The Back, Favorite, Share and Edit controls float over its top corners as `picture-button`s. Its source is the recipe's cover: a bake photo chosen as cover, else the reel thumbnail. No cover → no cover area at all; the page starts with a normal back row.

**`picture-button`** — A round 40px button (48px hit area) with a solid glazed-card fill, ink outline and an ink icon, for controls that sit on a photo (Back, Favorite, Share, Edit on the cover; the play badge on a reel). The one round shape in the system besides chips and toggles, because a round button reads as floating, not as part of the photo. Always has an accessible name. States: hover grout fill; active cobalt wash and cobalt icon; focus 3px ring at 2px offset; disabled grey icon.

**`picture-chip`** — A small solid label on a photo's corner, glazed-card fill with an ink outline, ink bold caption, pill-shaped: the date on a `bake-tile` ("15 / Thu"). Same rule as above: solid, never translucent.

**`bake-tile`** — A bake in the Bakes diary: the bake's photo, square, with a `picture-chip` date in its top-left corner, then the recipe title in bold `body-sm` and one meta line: that bake's stars in cobalt, then "2nd bake" or the scale when it isn't 1×. One link to the bake. A bake without a photo is not drawn as a tile with an empty frame; it becomes a full-width `card` row (small tile-panel square, title and date, a one-line note preview, stars), so the grid never fills with placeholders.

**`check-row`** — One converted or estimated amount to check on Review Import: a round check control (empty `{colors.border}` ring, or olive filled check when confirmed), the ingredient name with "from 3 cups" in muted caption under it, the grams on the right in `amount`, and a chevron. Two targets with separate names: the check control confirms ("Confirm flour, 360 g") and the rest of the row jumps to the field in the editor. The confirmed state is never colour alone: the icon changes shape and screen readers hear "Confirmed" or "Not checked". A Missing amount uses the same row with the `marker-missing` tag in place of the check control, since it can't be confirmed until it has a number.

**`source-card`** — The reel on Review Import: a glazed card with a 64px-wide 9:16 reel frame on the left (with a `picture-button` play badge centred on it, opening the reel), and on the right the creator handle in bold, the first 2 lines of the caption, and Watch reel. It replaces the bare portrait strip: the reel reads as a reference to open, not as the recipe's picture.

**`tab-bar`** + **`tab-bar-item`** — The bottom navigation of the installed app (Home Screen mode only; BONES-shell): canvas fill, a hairline on top, `{sizing.tab-bar}` tall plus the home-indicator safe area, four equal items, each an icon over a 13px label. The current tab is cobalt with a bold label and `aria-current="page"`; others are muted (5.9:1). Hidden on detail and task screens (Recipe, Review Import, Edit, Bake Mode, Bake Log), which have their own sticky action. States: hover ink; active (current) cobalt and bold; focus 3px inset ring; disabled grey.

**`view-tab`** — The Library's view switcher (Recipes, Favorites, Drafts), drawn as a row of `choice-radio`s ("(●) Recipes  ( ) Favorites  ( ) Drafts") with an optional count in `label-mono`. It looks like a radio group but stays built as a tab list (`role="tablist"`, `aria-selected`, arrow keys), because that's what it does; the glyph is `aria-hidden`. Under 768px the gap between choices is `{spacing.md}` so all three fit one row at 390px; if they still wrap (larger text), the next line sits directly under the first (each choice is already 48px tall), never with an extra gap. States as `choice-radio`.

**`section-tabs`** + **`section-tab`** — Anchor tabs on the Recipe page (Ingredients, Steps, Bakes): mono `tab` text, muted until current, with a 3px cobalt bar under the current one and an ink rule under the row, sticky under the top of the screen once the cover scrolls away. They jump to sections of one long page and mark the section in view; they never hide content, because a baker cross-checks steps and grams constantly. Built as links with `aria-current="location"`, not as a tab panel.

**`bake-progress`** — Bake Mode's position, on the stage: one 6px pill segment per step, 4px apart, grouped by component group with an `{spacing.sm}` gap and the group name under each group in `label-mono`. Finished segments are cream (`{colors.on-stage}`), the current one ochre, pending ones `{colors.stage-track}` (3.2:1 on the stage). Purely visual: the "3 / 7" count in the header and the step eyebrow carry the position for screen readers. Recipes without groups show one row and no labels. More than 16 steps: segments shrink but never below 4px wide; labels truncate.

**`timer-chip`** — A detected time inside Bake Mode's step text ("let it rise ◷ 1 h 30"): an ochre pill in mono with a clock glyph, never wrapping. On a step with a `bake-clock` it is a label that matches the clock (tapping it focuses the clock's Start). This replaced the outlined cobalt chip in October 2026.

**`azulejo-fill`** — The motif as a full field, cobalt on cobalt wash at a 56px repeat, no frame: the right half of `split-hero` and the picture area of a `recipe-tile` when a recipe has no photo. Same rules as all motif: decorative, `aria-hidden`, nothing set directly on it.

**`display-title`** — A top-level page title in `display-xl`, where one word may switch to Fraunces italic or to outline (1.5px stroke, transparent fill): "Your *bakes.*", "Bake no. 05". The accent word is still real text in the heading, so screen readers read the title normally. Outline only at 44px and up. One per page, on Library, Bakes and the celebration screen.

**`record-card`** + **`record-row`** — The recipe as a catalogue record, the centre of the Recipe page: a porcelain card with a 1px ink edge at `{rounded.tile}`, holding rows of `label-mono` label on the left (lowercase, muted: recipe, from, rating, baked, yield) and the value on the right (the title in `heading` Fraunces, the source in `voice` italic, stars, mono counts and times), each row closed by an ink rule, except the last row before the card's bottom edge (the edge closes it; a rule there would double it) and the row right before a full-width photo (the photo's own edge closes it). The title row is stacked: its label on one line and the title under it, left-aligned, full width of the card, because long titles ("Brown butter chocolate chip cookies") wrapped right-aligned over three lines are hard to read. The other rows keep label left, value right. Built as a description list (`dl`, `dt`, `dd`); the title row's value is the page's H1. The card ends with the page's actions: Start baking (`button-primary`) and Log bake (`button-secondary`) side by side.

**`choice-radio`** — A typographic single choice, from the catalogue look: "(●) 1×  ( ) 2×". A mono glyph, `( )` or `(●)` with the dot in cobalt, followed by the label in `tab`; unselected options are muted (5.9:1, never faded with opacity), the selected one ink. Built on a real, visually hidden `input type="radio"` (never `display: none`) inside a `fieldset` with a legend, so it is keyboard- and screen-reader-native; the whole label is the 48px target. Used for scale presets, the Library views (as tabs), the cover/bake photo switch in `split-hero`, and short option sets in sheets. Every group uses `groupGapCompact` (`{spacing.md}`) under 768px and in columns narrower than 480px; when a group wraps, the next line sits directly under the first (each choice is already 48px tall), never with an extra row gap. States: hover ink text; active (selected) ink text and cobalt dot; focus 3px ring around glyph and label; disabled grey.

**`split-hero`** — The Recipe page's first screen on desktop (1280px and up): two halves, at most one viewport tall (capped at 760px), with an ink rule between them. Left: the bake photo staged like a framed print, on a glazed-card mat with an ink frame, at most 72% of the half's width, with a `choice-radio` under it to switch between the latest bake, the cover and all bakes. Right: `azulejo-fill` with the `record-card` centred on it, solid, never translucent. The rest of the page (ingredients and method) follows on plain canvas after `{spacing.section-lg}`. Below 1280px the hero becomes the `cover-picture` with the `record-card` overlapping its bottom edge by 32px.

**`celebration`** + **`celebration-toast`** — After saving a bake. Milestones (first bake of a recipe, a new best rating, every 5th bake) get the full screen: deep cobalt (`{colors.celebration}`) edge to edge, Nathan's illustration (160px) in the middle, a `display-title` such as "Bake no. 5 *in the book.*", one line under it ("Pão de Deus · ★★★★★ · your best one yet") and a cream pill "Back to recipe". Focus moves to the title; the screen is announced as a dialog. Every other save shows the toast instead: a cobalt pill at the bottom, "Bake saved · Undo", 6 seconds, announced politely. Under reduced motion the screen simply appears.

**`bake-stage`** — Bake Mode's surface: `{colors.stage}` edge to edge in both themes, cream text, ochre for the one loud thing, and an ochre 3px focus ring (the normal blue ring is too dark on the stage). Secondary buttons on the stage are cream outlined pills. The app's header, tab bar and tile band are gone; the stage has its own top row (Exit, recipe title in `voice`, "3 / 7").

**`bake-step-number`** — The current step's number, "03", in `bake-number`: Fraunces 900, outline only (1.5px cream stroke, transparent fill), two digits. Decorative (`aria-hidden`); the step eyebrow carries the number for assistive technology. On a step with a timer, the `bake-clock` takes its place, because one screen has one hero.

**`step-stack`** + **`step-strip`** — Finished steps, stacked under the progress bar: each a cream strip in `tab` text on the stage colour, "02  Knead  ✓", 44px tall, 4px apart. The last 3 are shown (2 on a clock step or on screens under 740px tall), and older ones collapse into "+2 more done" in `label-mono`. A step whose timer is still running shows "◷ running" instead of the check. Tapping a strip goes back to that step. Strips are 44px rather than 48px (a documented exception; WCAG 2.5.5 asks 44px) so three fit on a phone. States: hover underline; active presses to 0.98; focus ochre ring; disabled not used.

**`bake-clock`** — The hero of a step with a timer: a 264px ring (320px from tablet up) with a 10px track in `{colors.stage-track}` and the remaining time as an ochre arc that empties as time runs, four quarter ticks, and the digits in `timer-xl` cream, solid (never outlined) with tabular figures. Under the digits, the state in `label-mono` ("ready", "running", "paused", "done") and, while running, "Keep this screen open" (a web app can't reliably ring once the phone locks). Below the ring: −1 min, Start/Pause/Resume and +1 min. While the clock is idle, Start is the screen's ochre `button-primary` and Next step is secondary; once it runs, Next step is primary again. It is a `role="timer"` element that doesn't announce every second: it speaks at 1 minute left and when done. When done, `bake-clock-done` fills the ring solid ochre, the state reads "Done", the chime plays and the phone vibrates where supported; nothing flashes. The screen stays awake (Screen Wake Lock) for all of Bake Mode.

**`timer-pill`** — A running timer whose step you've left: an ochre pill pinned under Bake Mode's header, with a 32px mini ring, the step name, the time in `amount` and a Pause button. Two at most are visible, then "+1" opens the list. When one finishes, its pill becomes the `timer-alert`.

---

## Responsive Behavior

| Breakpoint | Width | Key Changes |
|---|---|---|
| Mobile | < 768px | 4 columns, `{spacing.base}` gutters. Page H1s use `display-md`; top-level titles `display-xl` at 44px. Primary actions move into the sticky `action-bar`. Filters live in a `sheet`. Row menus render as sheets; the account menu stays a dropdown. `step-text` at 24px |
| Tablet | 768–1279px | 8 columns, `{spacing.lg}` gutters. Two-column recipe layout (scale and ingredients 4, steps 4). `step-text` at 28px. Sheets become `modal`s. Primary actions return to page headers except in Bake Mode |
| Desktop | ≥ 1280px | 12 columns, `{spacing.xl}` gutters. Page H1s use `display-lg`; top-level titles `display-xl` at 64px. The Recipe page opens with `split-hero`. Filters in one row. All menus as anchored `menu`s |
| Wide | > 1264px content | Content caps at `{sizing.content-max}` (1200px) and centers; the `tile-band` still runs the full window width |

### Touch Targets
- Every interactive element is at least `{sizing.touch-min}` (48×48px), above WCAG's 44px, because hands in a kitchen are wet, floury, or gloved.
- Bake Mode's Previous and Next step buttons are `{sizing.touch-bake}` (64px) tall, big enough to hit with a knuckle. `step-strip`s are the one exception below 48px: 44px, so three finished steps fit on a phone.
- Adjacent small targets (the five stars, chip remove buttons) keep full 48px hit areas even when the visible glyph is smaller.
- Form controls are `{sizing.control-height}` (48px) tall; text in fields is at least 17px, which also stops iOS Safari from zooming into focused fields (it zooms under 16px).

### Collapsing Strategy
- Navigation: in Safari, Library and Import links and the account menu fit the mobile top bar. Installed on the Home Screen, a `tab-bar` (Library, Import, Bakes, Profile) replaces them on top-level screens (BONES-shell).
- Grids: photo grids (Library, Bakes) are 2 columns on mobile, 3 on tablet, 4 on desktop; the recipe page's ingredients/steps split collapses to one column under 768px.
- Spacing: section gaps step down one token on mobile (`{spacing.xl}` → `{spacing.lg}`).
- Type: only `display-lg` → `display-md` and `step-text` 28 → 24px change size; body sizes never shrink on mobile.

### Mobile Browser Viewport
Learned on a real iPhone in Safari, where Chrome-based tests passed while the phone failed:
- Everything pinned to the bottom (`action-bar`, `sheet`, Bake Mode's step nav and timer strip, the footer of full-screen forms) is positioned against the **visible area** the browser reports live (the visual viewport), never the full page height (`100vh`), so it sits above Safari's toolbar and the keyboard on any device. Nothing hardcodes a toolbar or keyboard height.
- A `sheet`'s height comes from its content (`height: auto`, `bottom: auto` over a dialog's default inset), capped at 90% of the visible area with its body scrolling inside. Never let two opposing edges (top and bottom) decide a sheet's height.
- While the on-screen keyboard is open, page `action-bar`s hide, and a full-screen form keeps the focused field scrolled into view above its footer once the keyboard has finished opening.

### Dark Mode
- Follows the device setting (`prefers-color-scheme`) by default. Every colour token has a `colors-dark` value; components don't change.
- Cobalt flips from a deep fill to a light glaze-blue (`#9DB6FF`), and `on-primary` flips to the night canvas, so primary buttons stay the brightest thing on the page.
- `elevation.float` becomes `elevation.float-dark`, and `elevation.bar` becomes `elevation.bar-dark`.
- The azulejo motif keeps using `{colors.primary}`, so it glows light blue on night-cobalt, like tiles under a streetlight.
- Ink outlines flip to `{colors.outline}` dark (#D5D2C8), a soft cream line. Ochre stays ochre with ink text. The stage and the celebration screen keep their own colours in both themes.

---

## Known Gaps

- **Maskable app icon**: Android's maskable format crops to a circle and would cut off the app icon's corner diamonds. Not made yet, since the app is used on an iPhone, which never crops.
- **Manual theme switch**: dark mode follows the device only. An in-app Light/Dark/System control would need a place in the account menu.
- **Logo and illustrations**: Nathan is drawing a new logo (wordmark plus monogram for the app icon and favicon) and a set of line illustrations (celebration, empty Library, empty Bakes, no results, import done, offline). Brief: ink, cobalt, ochre and canvas only; must work in one colour and reversed; about a 1.5px stroke at 160px to match the 1px UI outlines; SVG, transparent background; decorative (`alt=""`). Until they land, `celebration` uses a `tile-panel` square and the current wordmark and app icon stay.
- **Timer sound**: the finished-timer sound (a short, warm chime, not an alarm buzz) needs to be chosen or produced.

---

## Do / Don't

| Do | Don't |
|---|---|
| Keep cobalt `{colors.primary}` for selected states, stars, links, the tile motif, `azulejo-fill` and `celebration` | Use cobalt as a button fill or for body text |
| Use ochre `{colors.ochre}` for the one primary button, timer chips, pills and clocks, and Bake Mode's current segment, always with ink text and an ink edge | Use ochre for text, backgrounds, decoration, or a second primary button |
| Put grams, timers, and step numbers in `amount`, `amount-lg`, `timer`, or `step-number` | Set any weighed or timed number in a proportional face |
| Name things in Fraunces; read in Atkinson Next (steps, notes); do and record in Atkinson Mono (buttons, tabs, labels, numbers) | Set steps, buttons, or form text in Fraunces |
| Frame tiles, cards, photos and buttons with a 1px `{colors.outline}` ink edge; rule lists in ink | Use grey hairlines as structure, or add drop shadows to cards or list items; shadows are for floating layers only |
| Put controls and labels on photos only as solid `picture-button`s and `picture-chip`s | Set text directly on a photo, or use translucent chips or gradient scrims |
| Edge controls with `{colors.border}` so they meet 3:1 | Use `{colors.hairline}` as the only edge of an input, checkbox, or empty star |
| Use `{spacing.*}` tokens for every gap and padding | Invent in-between values like 10px or 20px |
| Keep one primary action per screen (the same action may repeat when one copy scrolls away); everything else is secondary, text, or icon | Put two different ochre-filled actions on one screen, or two copies side by side |
| Show markers as text plus glyph ("~ Estimated") | Signal Estimated, Converted, or Missing by colour alone |
| Mark times in step text with weight only (`time-mark`: bold, body colour) | Give anything that isn't interactive link styling (cobalt, underline) |
| Use the azulejo motif as a frame (header band, sheet edge), an empty-state panel, or a missing-picture tile | Put text on top of the pattern, use it as a page background, or stamp it before section titles |
| Set the "g" after an amount in the reading face, muted, 3px away | Let the monospaced face set the unit, leaving a wide gap |
| Make buttons, chips and timer pills pills; tiles, cards and photos `{rounded.tile}`; fields and notices `{rounded.md}` | Mix radii within one component, or leave anything sharp-cornered |
| Keep 48px targets, 64px in Bake Mode | Shrink targets on mobile to fit more in a row; wrap instead |
| Show focus with the 3px `{colors.focus-ring}` outline and offset | Remove outlines or rely on a colour shift to show focus |
| Move focus into overlays and back for every input, showing the ring only for keyboard use | Skip moving focus on touch, or show a ring on a button the user just tapped |
| Anchor bottom UI to the visible area the browser reports live | Use `100vh` or a hardcoded toolbar or keyboard height |
| Animate only in answer to an action or a state change, 120–600ms, with a reduced-motion fade | Scroll-jack, pin sections, scrub text on scroll, loop decoration, or put a loader in front of content |
| Use outline type only at 44px and up, for display words and the step number | Outline anything small, or anything that must be read at a glance (clock digits, amounts) |
| Build `choice-radio` on a real, visually hidden radio input | Hide the input with `display: none` or fake the choice with divs |

---

## Agent Checklist

1. Read this SKIN.md, then SKELETON.md and the route's BONES files, before writing any UI.
2. Generate the theme once from `colors` and `colors-dark` as CSS custom properties with identical names (`--color-primary`), switched by `prefers-color-scheme`; components never branch on the theme.
3. Self-host the three fonts as described in Font Import (woff2, Latin subset, `font-display: swap`); apply `font-variant-numeric: tabular-nums` wherever a mono token is used.
4. `{colors.ochre}` fills one `button-primary` per screen plus timer chips, pills, the clock ring and Bake Mode's current segment, always with `{colors.on-ochre}` text and an ink edge. `{colors.primary}` is for selected states, stars, links, the wordmark, the tile motif, `azulejo-fill` and `celebration`.
5. Every number the user weighs or times uses `amount`, `amount-lg`, `timer`, or `step-number`, right-aligned in lists; its unit uses the reading face in `{colors.muted}`; times inside step text use `time-mark`.
6. Tiles, cards, photos and buttons have a 1px `{colors.outline}` edge, and rows an ink rule; use `{elevation.float}` only for `menu`, `sheet`, `modal`, and `timer-alert`, and `{elevation.bar}` only for `action-bar`.
7. Every interactive element implements its `-hover`, `-active`, `-focus`, and `-disabled` variants, and form fields their `-error` variant, with the 3px `{colors.focus-ring}` outline, shown for keyboard use only (text fields also when tapped).
8. Every tap target is at least `{sizing.touch-min}`; Bake Mode's step buttons use `{sizing.touch-bake}`.
9. Markers (Estimated, Converted, Missing, Suggested) always show their text and glyph.
10. Render the azulejo SVG exactly as given, `aria-hidden`, and never under text.
11. Honour `prefers-reduced-motion`: no slides, tilts, scales, spinners, or shimmer; a 150ms fade at most, and the layout never changes. Motion follows the Motion rules: never scroll-driven.
12. Anchor every bottom-pinned element and sheet to the live visible area (Mobile Browser Viewport); sheets size to their content.
13. Bake Mode is a `bake-stage` in both themes: ochre focus ring, `bake-step-number` or `bake-clock` as the one hero, finished steps in the `step-stack`, Screen Wake Lock on.
14. If you need a value this file doesn't define, check Known Gaps first; otherwise use the nearest token and report it. Never add a colour, font, radius, or shadow.
