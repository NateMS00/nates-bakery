---
version: alpha
name: Backery
description: >
  A glazed-tile kitchen notebook. Every screen sits on a warm tin-glaze white, like the
  surface of a Lisbon azulejo, with a single deep cobalt doing all the talking: primary
  actions, selected states, and the tile motif that edges the app. A soft, slightly wonky
  serif (Fraunces) carries titles with a hand-made warmth, while a hyperlegible sans and
  its monospaced sibling carry steps and grams, because the real job is reading "125 g"
  from arm's length with flour on your hands. Depth comes from grout-like hairlines and
  flat glazed surfaces, not shadows; only things that float (sheets, modals, the sticky
  action bar) lift off the page. The one warm note is amarelo, the ochre of polychrome
  tiles, reserved for ratings and "Estimated" amounts. Dark mode is the same tile at
  night: deep cobalt glaze with cream text.

colors:
  # Brand & accent
  primary: "#1D3F9E"
  primary-active: "#142E78"
  primary-wash: "#DDE5F6"
  on-primary: "#FFFDF7"
  crust: "#A86A0C"
  # Surface
  canvas: "#F6F2E8"
  surface-card: "#FFFDF7"
  surface-sunken: "#ECE6D8"
  # Text
  ink: "#131A33"
  body: "#2C3350"
  muted: "#5A617D"
  # Borders
  hairline: "#DDD5C3"
  border: "#8C8573"
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
  disabled: "#8E8A7D"
  surface-disabled: "#E8E3D7"
  scrim: "rgba(19, 26, 51, 0.36)"

colors-dark:
  primary: "#9DB6FF"
  primary-active: "#C3D2FF"
  primary-wash: "#223060"
  on-primary: "#0D1326"
  crust: "#E9B24A"
  canvas: "#0D1326"
  surface-card: "#151D38"
  surface-sunken: "#0A0F1F"
  ink: "#F4F0E6"
  body: "#D5D2C8"
  muted: "#9DA4C0"
  hairline: "#2A3456"
  border: "#6C7497"
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
    fontFamily: "'Atkinson Hyperlegible Next', 'Avenir Next', system-ui, sans-serif"
    fontSize: 16px
    fontWeight: 700
    lineHeight: 1
    letterSpacing: 0.1px
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

rounded:
  none: 0px
  sm: 4px
  md: 8px
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

elevation:
  float: "0 8px 24px rgba(19, 26, 51, 0.14), 0 1px 0 {colors.hairline}"
  bar: "0 -1px 0 {colors.hairline}, 0 -6px 16px rgba(19, 26, 51, 0.08)"
  float-dark: "0 8px 24px rgba(0, 0, 0, 0.5), 0 0 0 1px {colors.hairline}"
  bar-dark: "0 -1px 0 {colors.hairline}, 0 -6px 16px rgba(0, 0, 0, 0.4)"

motion:
  fast: 120ms
  base: 200ms
  sheet: 280ms
  easing: "cubic-bezier(0.2, 0.8, 0.2, 1)"

components:
  # ── Buttons ───────────────────────────────────────────
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    minHeight: "{sizing.touch-min}"
    padding: "0 {spacing.lg}"
  button-primary-hover:
    backgroundColor: "{colors.primary-active}"
  button-primary-active:
    backgroundColor: "{colors.primary-active}"
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
    backgroundColor: "{colors.surface-card}"
    textColor: "{colors.primary}"
    borderColor: "{colors.primary}"
    borderWidth: "1.5px"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    minHeight: "{sizing.touch-min}"
    padding: "0 {spacing.lg}"
  button-secondary-hover:
    backgroundColor: "{colors.primary-wash}"
  button-secondary-active:
    backgroundColor: "{colors.primary-wash}"
    borderColor: "{colors.primary-active}"
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
    rounded: "{rounded.md}"
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
    typography: "{typography.button}"
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
    filledColor: "{colors.crust}"
    emptyStrokeColor: "{colors.border}"
    emptyFillColor: "transparent"
  star-rating-hover:
    previewFillColor: "{colors.crust}"
    previewOpacity: 0.55
  star-rating-active:
    filledColor: "{colors.crust}"
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
    filledColor: "{colors.crust}"
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
    textColor: "{colors.primary}"
    fontWeight: 700
    textDecoration: "underline dotted"
    textDecorationThickness: "2px"
    textUnderlineOffset: "4px"
    whiteSpace: "nowrap"
  step-number:
    textColor: "{colors.primary}"
    typography: "{typography.amount}"
    fontWeight: 700
    minWidth: "2ch"

  # ── Surfaces & list items ─────────────────────────────
  card:
    backgroundColor: "{colors.surface-card}"
    textColor: "{colors.ink}"
    borderColor: "{colors.hairline}"
    borderWidth: "1px"
    rounded: "{rounded.lg}"
    padding: "{spacing.base}"
  recipe-item:
    backgroundColor: "{colors.surface-card}"
    textColor: "{colors.ink}"
    borderColor: "{colors.hairline}"
    borderWidth: "1px"
    rounded: "{rounded.lg}"
    padding: "{spacing.base}"
    titleTypography: "{typography.heading}"
    metaTypography: "{typography.caption}"
    metaColor: "{colors.muted}"
  recipe-item-hover:
    borderColor: "{colors.primary}"
  recipe-item-active:
    backgroundColor: "{colors.primary-wash}"
    borderColor: "{colors.primary}"
  recipe-item-focus:
    outline: "3px solid {colors.focus-ring}"
    outlineOffset: "2px"
  recipe-item-disabled:
    backgroundColor: "{colors.surface-disabled}"
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
  ingredient-row:
    borderBottom: "1px solid {colors.hairline}"
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
    borderBottom: "4px solid {colors.crust}"
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
    borderTop: "1px solid {colors.hairline}"
    padding: "{spacing.lg} {spacing.base}"
    marginTop: "{spacing.2xl}"
    linkColor: "{colors.muted}"
    typography: "{typography.caption}"
  wordmark:
    textColor: "{colors.primary}"
    typography: "{typography.wordmark}"

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
---

## Overview

Backery reads like a baker's notebook left on a tiled Lisbon counter. The base canvas is `{colors.canvas}` (#F6F2E8), a warm tin-glaze white rather than paper white, so long recipe pages feel soft and ceramic instead of clinical. `{colors.primary}` (#1D3F9E) is azulejo cobalt, the colour of hand-painted tiles, and it is the only strong colour in the system: it marks what you can do next (Start baking, Import, Save), what is selected (a filter, a scale preset, a favorite), and the tile motif that frames the app. Depth is flat and glazed: surfaces are separated by grout-like `{colors.hairline}` lines, and only floating layers get a shadow. Titles are set in Fraunces with its soft axis turned up, which gives a hand-lettered warmth; everything you read while baking is set in Atkinson Hyperlegible, built for low-vision legibility, because grams misread from a metre away ruin a bake.

The design takes its DNA from three places, without copying any of them: the cobalt-on-white repetition of Lisbon's azulejo façades and the historic tile workshops that painted them; the calm, content-first hierarchy of recipe managers like Mela, whose cook mode proved that big type beats clever layout in a kitchen; and the confident pattern-plus-type packaging of Portuguese heritage brands like Claus Porto, where one strong pattern carries the brand so the rest can stay quiet.

**Key Characteristics:**
- One colour does the work: `{colors.primary}` cobalt on `{colors.canvas}` tin-glaze white, echoing blue-and-white tiles. No second brand colour competes with it.
- The azulejo motif (`tile-band`, `tile-mark`, `tile-panel`) is the signature. A 24px painted border edges the app header, a single tile stamps each section title, and a tile field fills empty states. Always decorative, never behind text.
- Amarelo `{colors.crust}`, the ochre of polychrome tiles, is the single warm note, reserved for star ratings and the finished-timer edge.
- Type splits by job: Fraunces (soft serif) for names and titles, Atkinson Hyperlegible Next for reading, Atkinson Hyperlegible Mono for every number you weigh or time.
- Softened tile corners, not bubbles: `{rounded.md}` (8px) on buttons, notices, fields, and the segmented control, like the eased edge of a glazed tile; nothing is pill-shaped except chips and toggles.
- Elevation is border-first; shadows exist only on `sheet`, `modal`, `menu`, `timer-alert`, and the sticky `action-bar`.

---

## Colors

Every colour has a light value (`colors`) and a dark value (`colors-dark`) under the same token name. Components always reference the token; the theme swaps the value.

### Brand & Accent
- **Cobalt** (`{colors.primary}` — #1D3F9E; dark #9DB6FF): primary buttons, selected states (segmented items, chips, current nav item, favorite on), links, category labels, group headings, the wordmark, and the tile motif. It reads as "act here" or "this is chosen". 8.3:1 on canvas, so it is also safe for text.
- **Cobalt deep** (`{colors.primary-active}` — #142E78; dark #C3D2FF): hover and pressed state of cobalt surfaces. Darker in light mode, lighter in dark mode, so the pressed state always moves away from the background.
- **Cobalt wash** (`{colors.primary-wash}` — #DDE5F6; dark #223060): the pale blue of a thin glaze. Fill for active filter chips, hovered secondary buttons, pressed list items, and the `tile-panel` ground. Ink text on it is 13.6:1.
- **On cobalt** (`{colors.on-primary}` — #FFFDF7; dark #0D1326): text and icons on cobalt fills. 9.2:1.
- **Amarelo** (`{colors.crust}` — #A86A0C; dark #E9B24A): ochre from polychrome tiles, and the colour of a well-baked crust. Only for filled rating stars and the bottom edge of `timer-alert`. It is a graphic colour (4.0:1 on canvas, above the 3:1 needed for non-text), so it is never used for text.

### Surface
- **Tin glaze** (`{colors.canvas}` — #F6F2E8; dark #0D1326): page background everywhere, and the fill of `app-header`, `action-bar`, and `tile-band`. Warm, so cobalt glows against it the way it does on real tiles. Dark mode turns it into night-cobalt glaze.
- **Glazed card** (`{colors.surface-card}` — #FFFDF7; dark #151D38): cards, list items, form fields, sheets, modals, menus. A step lighter than canvas in light mode, a step lighter in dark mode too, so cards read as the raised tile.
- **Grout** (`{colors.surface-sunken}` — #ECE6D8; dark #0A0F1F): recessed areas: the segmented control track, icon-button hover, skeleton placeholders, toggle track.

### Text
- **Ink** (`{colors.ink}` — #131A33; dark #F4F0E6): headings, amounts, step text, anything the eye must land on. A blue-black, like the darkest cobalt brushstrokes, so it belongs with the palette. 15.4:1.
- **Body** (`{colors.body}` — #2C3350; dark #D5D2C8): longer reading text: notes in the bake log, transcript, descriptions. 11:1.
- **Muted** (`{colors.muted}` — #5A617D; dark #9DA4C0): metadata only: "Baked 12 Sep", "Not rated", counts, placeholders, input suffixes. 5.5:1 on canvas and 4.9:1 on grout, so it passes AA even at `{typography.caption}`, but it is never used for body copy.

### Borders & Hairlines
- **Grout line** (`{colors.hairline}` — #DDD5C3; dark #2A3456): separates cards, ingredient rows, and sections, like grout between tiles. Decorative, deliberately quiet (it carries no information on its own).
- **Border** (`{colors.border}` — #8C8573; dark #6C7497): the edge of every control a user must find: inputs, selects, checkboxes, toggles, empty stars. 3.3:1 on canvas, meeting the 3:1 non-text contrast rule, which `hairline` does not. Never use `hairline` for a control's edge.

### Semantic
- **Success** (`{colors.success}` — #3B6A2C; dark #9CCB88) on **Success wash** (`{colors.success-wash}` — #E0EBD6; dark #1C2E17): completed import stages, "Marked as baked", "Link copied". An olive glaze green.
- **Warning** (`{colors.warning}` — #875208; dark #F0C46A) on **Warning wash** (`{colors.warning-wash}` — #F5E6C6; dark #3A2E14): the Estimated marker, the has-estimates notice, a finished timer row. Darker than amarelo so text passes: 5.3:1 on its wash.
- **Error** (`{colors.error}` — #B0341C; dark #F28B74) on **Error wash** (`{colors.error-wash}` — #F7DDD5; dark #3D1C16): the Missing marker, field errors, failed import, destructive buttons. A terracotta red, from roof tiles rather than alarm red. 4.9:1 on its wash.
- **Info wash** (`{colors.info-wash}` — #DDE5F6; dark #1E2A52): background of the Converted marker and `notice-info`; text on it uses `{colors.primary}` or `{colors.ink}`.

### States
- **Focus ring** (`{colors.focus-ring}` — #2A5BD7; dark #8FB0FF): the keyboard focus outline on every interactive component, always 3px with an offset so it sits on the background, not on the component. 5.3:1 against canvas and 5.8:1 against cards. Brighter than cobalt so a focused cobalt button still shows a distinct ring.
- **Disabled** (`{colors.disabled}` — #8E8A7D; dark #6A7090) on **Disabled surface** (`{colors.surface-disabled}` — #E8E3D7; dark #1B2340): controls that can't be used. They lose their cobalt entirely and turn to grey glaze, so "unavailable" reads by shape and colour, not by opacity. Use sparingly: BONES prefers explaining over disabling (Save recipe stays enabled).
- **Scrim** (`{colors.scrim}`): the dimmed layer behind sheets and modals: cobalt-ink at 36% in light mode, so the warm canvas dims without turning grey, and near-black at 64% in dark mode.

---

## Typography

**Display face**: Fraunces, a soft old-style serif with an adjustable "softness" axis. Turned to `SOFT 50` for titles and `SOFT 80–100` for group headings and the wordmark, its rounded terminals feel hand-painted, like lettering on a tile panel, without becoming a novelty face.

**Reading face**: Atkinson Hyperlegible Next, designed by the Braille Institute so letters that are easy to confuse (I, l, 1; O, 0) stay distinct. It carries steps, notes, buttons, and labels.

**Number face**: Atkinson Hyperlegible Mono, the same family's monospaced cut, for every amount, timer, and step number. Tabular figures keep columns of grams aligned on one right edge, so "85 g" and "125 g" line up for fast scanning.

### Font Import

The fonts are self-hosted, not loaded from Google Fonts: this guarantees Fraunces's `SOFT` axis (the look depends on it), keeps the app working offline as a Home Screen web app, and sends no request to a third party. The source files are the variable TTFs in `design-reference/fonts/` (SIL Open Font License, included). Convert them to woff2 and subset to Latin (Basic Latin, Latin-1 Supplement, Latin Extended-A, plus the ½ ¼ ¾ fractions, °, ×, and typographic punctuation) before shipping.

| Family name | File | Axes kept |
|---|---|---|
| Fraunces | `Fraunces.woff2` | wght 300–700, opsz 9–144, SOFT 0–100 |
| Fraunces (italic) | `Fraunces-Italic.woff2` | same |
| Atkinson Hyperlegible Next | `AtkinsonHyperlegibleNext.woff2` | wght 400–700 |
| Atkinson Hyperlegible Mono | `AtkinsonHyperlegibleMono.woff2` | wght 400–700 |

Declare each with `font-display: swap`, and preload the two used in the first viewport (Fraunces upright and Atkinson Hyperlegible Next). In Next.js, `next/font/local` does all of this.

### Type Scale

| Token | Face | Size | Weight | Line Height | Tracking | Use |
|---|---|---|---|---|---|---|
| `display-lg` | Fraunces | 44px | 600 | 1.05 | -0.6px | Page H1 on desktop (Library, recipe title) |
| `display-md` | Fraunces | 34px | 600 | 1.1 | -0.4px | Page H1 on mobile; recipe title on mobile |
| `heading` | Fraunces | 24px | 600 | 1.25 | -0.2px | Section H2s, recipe titles in lists, modal titles |
| `subheading` | Fraunces italic | 19px | 500 | 1.3 | 0 | Component group headings (Crust, Filling) |
| `step-text` | Atkinson Next | 24px | 500 | 1.45 | 0 | Bake Mode's current step (28px from tablet up) |
| `timer` | Atkinson Mono | 34px | 500 | 1 | 0 | Remaining time in timer rows |
| `body-lg` | Atkinson Next | 18px | 400 | 1.55 | 0 | Steps on the Recipe and Shared Recipe pages |
| `body-md` | Atkinson Next | 17px | 400 | 1.55 | 0 | Default text, ingredient names, fields |
| `body-sm` | Atkinson Next | 15px | 400 | 1.5 | 0 | Notices, secondary text, bake log notes on mobile |
| `amount` | Atkinson Mono | 17px | 500 | 1.4 | 0 | Grams in ingredient rows, amount inputs, step numbers |
| `amount-lg` | Atkinson Mono | 21px | 500 | 1.35 | 0 | Grams in Bake Mode's "For this step" |
| `button` | Atkinson Next | 16px | 700 | 1 | 0.1px | Buttons, nav links, segmented items |
| `caption` | Atkinson Next | 14px | 400 | 1.4 | 0.1px | Metadata: dates, counts, "Not rated", status lines |
| `label` | Atkinson Next | 13px | 700 | 1.2 | 0.9px | Uppercase: category labels, markers, field eyebrows |
| `wordmark` | Fraunces italic | 24px | 700 | 1 | -0.3px | The "Backery" wordmark only |

### Principles
- The body size is 17px, one step above the usual 16, and nothing a baker reads mid-bake is under 15px: phones sit on the counter, not in the hand.
- Fraunces's `WONK` axis stays at the font file's default (on). Its leaning n, m, h and k are part of the hand-made feel, visible in the wordmark; don't set `WONK` to 0.
- Serif is for naming things (recipes, sections, groups); sans is for doing things (steps, buttons, notes). Never set a step or a button in Fraunces, and never set a recipe title in Atkinson.
- Every number that is weighed or timed uses a mono token (`amount`, `amount-lg`, `timer`, `step-number`), so figures never shift width as a timer counts down or a scale changes. The unit after it ("g") is set in the reading face in `{colors.muted}`, 3px from the number, because a monospaced space leaves an awkward gap ("250  g").
- Times inside step text ("15 min") are not set in mono; they use `time-mark` in the reading face, so the sentence keeps its rhythm.
- Atkinson's zero is slashed in both the Mono and Next cuts, with no plain alternate. It stays: telling 0 from O at arm's length is worth the slightly technical look.
- Weight, not size alone, carries hierarchy in the sans: 400 to read, 500 for steps and amounts, 700 for actions and labels.
- Uppercase appears only in `label`, always tracked +0.9px, and only for short tags (one to three words).

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
Generous around the things you act on, tight inside the things you scan. Ingredient rows are compact (`{spacing.md}` vertical padding) so a whole list fits on one screen; sections breathe (`{spacing.lg}`–`{spacing.xl}`) so the page reads as a sequence of tiles. Empty space is warm canvas, never pure white, so a sparse screen still feels like a surface, not a void.

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

Quarter circles in each corner meet their neighbours to form full circles across tiles, and the centre diamond gives each tile its own rhythm, which is the classic azulejo effect: a simple unit that becomes a field. The motif is always `aria-hidden`, never carries meaning, and never sits behind text.

---

## Elevation

### Surface Tiers
| Tier | Token | Appearance |
|---|---|---|
| Page floor | `{colors.canvas}` | Base layer, tin-glaze white |
| Recessed | `{colors.surface-sunken}` | Tracks, placeholders, hover wells |
| Card / tile | `{colors.surface-card}` | 1px `{colors.hairline}` border, no shadow |
| Sticky bar | `{colors.canvas}` | `{elevation.bar}`: a hairline plus a soft upward shadow |
| Menu, sheet, modal, timer alert | `{colors.surface-card}` | `{elevation.float}` (light) or `{elevation.float-dark}` (dark), over `{colors.scrim}` where modal |

### Shadow Definitions
This system is border-first: cards and list items use a 1px `{colors.hairline}` border and no shadow. Shadows exist only on layers that genuinely float above the page:
- `{elevation.float}`: `0 8px 24px rgba(19, 26, 51, 0.14), 0 1px 0 {colors.hairline}`: menus, sheets, modals, `timer-alert`.
- `{elevation.bar}`: `0 -1px 0 {colors.hairline}, 0 -6px 16px rgba(19, 26, 51, 0.08)`: the sticky `action-bar`, whose shadow points up because it sits at the bottom.
- `{elevation.float-dark}`: `0 8px 24px rgba(0, 0, 0, 0.5), 0 0 0 1px {colors.hairline}`: dark mode replaces `float`, adding a hairline ring because shadows barely show on dark surfaces.
- `{elevation.bar-dark}`: `0 -1px 0 {colors.hairline}, 0 -6px 16px rgba(0, 0, 0, 0.4)`: dark mode replaces `bar` on the sticky `action-bar`, with a stronger shadow so the bar still separates from night-cobalt content.

### Motion
- `{motion.fast}` (120ms): hover and press feedback, chip removal, star fill.
- `{motion.base}` (200ms): disclosure expand (Read more), inline confirmations appearing, check items leaving Needs Your Check.
- `{motion.sheet}` (280ms): sheets sliding up, modals fading and scaling from 0.98.
- All use `{motion.easing}`. Under `prefers-reduced-motion: reduce`, transitions drop to instant or a plain fade, and nothing slides or scales.

---

## Components

**`button-primary`** — Cobalt fill (`{colors.primary}`) with `{colors.on-primary}` text in `{typography.button}`, `{rounded.md}` corners, at least `{sizing.touch-min}` tall with `{spacing.lg}` side padding. One per screen: Start baking, Import from a reel, Save recipe, Log a bake, Next step. The one exception: the same action may appear twice when one copy scrolls out of view, such as Save recipe in the page header and again at the end of the sticky left column on Review Import. Two different primary actions on one screen, never. In sticky bars it is full width. States: hover and active darken to `{colors.primary-active}` (active also nudges 1px down); focus adds a 3px `{colors.focus-ring}` outline at 3px offset; disabled turns to `{colors.surface-disabled}` with `{colors.disabled}` text and a hairline edge.

**`button-secondary`** — Glazed card fill with a 1.5px cobalt border and cobalt text; same size and radius as primary. For every other action: Mark as baked, Previous, Try another link, Import again, Keep reviewing. States: hover fills `{colors.primary-wash}`; active keeps the wash with a `{colors.primary-active}` border and 1px press; focus 3px ring at 3px offset; disabled goes grey glaze with a hairline border.

**`button-destructive`** — Terracotta fill (`{colors.error}`) with `{colors.on-primary}` text; used only as the confirming action inside a destructive confirmation (Discard, Delete, Leave, Revoke), never as the first button a user sees. States: hover underlines the label (the colour already sits at its darkest safe value); active presses 1px; focus 3px ring; disabled grey glaze.

**`button-text`** — No fill, cobalt `{typography.button}` label, `{sizing.touch-min}` hit height. For low-emphasis actions: Discard (the entry point), Read more, Show less, Show more, Show all, Clear filters, Skip, Undo, Close. States: hover underlines at 3px offset; active darkens to `{colors.primary-active}`; focus 3px ring with `{rounded.sm}`; disabled `{colors.disabled}`.

**`icon-button`** — A `{sizing.touch-min}` square with a `{sizing.icon}` icon in `{colors.ink}`; always has an accessible name. Used for Share, Edit, row menus, account, Exit, Pause, Clear timer. States: hover fills `{colors.surface-sunken}`; active fills `{colors.primary-wash}` and turns the icon cobalt; focus 3px ring; disabled `{colors.disabled}` icon.

**`text-link`** — Cobalt, underlined at 1px with a 3px offset, in the surrounding text's size. Used inside sentences and for navigation-like links: Watch reel, See all bakes, Add notes. Back links use `back-link` instead. States: hover thickens the underline to 2px; active `{colors.primary-active}`; focus 3px ring; disabled grey, no underline.

**`back-link`** — The "‹ Library" / "‹ Recipe title" link at the top of a page: bold cobalt `{typography.button}` with an `{sizing.icon-sm}` chevron, no underline at rest, because the chevron and position already make it unmistakably navigation (WCAG only requires the underline for links inside running text). Its hit area is the full `{sizing.touch-min}` height. States: hover underlines at 3px offset; active `{colors.primary-active}` and underlined; focus underlined plus the 3px ring; disabled grey.

**`nav-link`** — The shell's Library and Import links: `{colors.body}` `{typography.button}` with a 3px bottom bar. States: hover darkens to ink and shows a hairline bar; active (current page) turns cobalt with a cobalt bar, and also carries `aria-current="page"`; focus 3px ring; disabled grey.

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

**`star-rating`** — Five 22px stars, drawn small so the rating supports the title instead of competing with it, each its own 48px target and radio option ("Rate 4 out of 5"); filled stars in amarelo `{colors.crust}`, empty stars as `{colors.border}` outlines so an unrated recipe still shows its controls clearly. Pressing the current rating clears it. In a prompt where rating is the only task (the Rating prompt after Mark as baked or a new bake log entry), stars are drawn at `starSizePrompt` (40px), centered, with the Skip action directly below them. States: hover previews the fill up to the pointer at 55% strength; active pops the chosen star to 1.08 scale for `{motion.fast}`; focus 3px ring around the focused star; disabled grey.

**`star-display`** — The read-only rating in lists and shared pages: 16px stars in amarelo with outline empties, labeled "Rated 4 out of 5"; when unrated, the text "Not rated" in `{colors.muted}` `{typography.caption}` replaces the stars.

**`favorite-toggle`** — A heart icon button: outline heart in ink when off, filled cobalt heart when on; announces as a pressed toggle named "Favorite". States: hover grout well; active (on) filled cobalt; focus 3px ring; disabled grey. In recipe lists the same heart appears as a non-interactive mark.

**`marker-estimated`** — An uppercase `label` tag, "~ Estimated", `{colors.warning}` on `{colors.warning-wash}`, `{rounded.sm}`. Always text plus glyph, never colour alone.

**`marker-converted`** — "= Converted", cobalt on `{colors.info-wash}`. On the Recipe page it is a button that reveals the original amount ("was 1 cup"), with `aria-expanded`. States: hover underlines; active inverts to cobalt fill; focus 3px ring; disabled grey.

**`marker-missing`** — "! Missing", `{colors.error}` on `{colors.error-wash}`; appears in Needs Your Check and beside empty amount fields.

**`marker-suggested`** — "Suggested", a quiet outlined tag in `{colors.muted}` with a hairline border, next to a category the importer pre-selected.

**`category-label`** — The recipe's category as an uppercase cobalt `label` above titles. Plain text, not a link.

**`group-heading`** — Component group names (Crust, Filling, Assembly) in Fraunces italic `subheading`, cobalt, with a hairline rule under them and `{spacing.lg}` above, like a painted label on a tile panel.

**`time-mark`** — Times detected in step text ("15 min", "2 hours"): bold cobalt in the reading face with a 2px dotted underline at 4px offset, never breaking across lines. On the Recipe and Shared Recipe pages it is not interactive; in Bake Mode the same times become `button-secondary` timer buttons.

**`step-number`** — Step numbers in cobalt bold `{typography.amount}`, at least 2 characters wide so steps 1–9 and 10+ align.

**`card`** — The glazed tile: `{colors.surface-card}` with a 1px `{colors.hairline}` border, `{rounded.lg}`, `{spacing.base}` padding. For Latest Bake, bake log entries, Needs Your Check, the Source block, and the editor's group blocks. Not interactive.

**`recipe-item`** — A clickable card in the Library: title in `{typography.heading}`, category label above, a meta line (stars, heart, "Baked 12 Sep") in muted caption. The whole card is one link. States: hover cobalt border; active cobalt wash with cobalt border; focus 3px ring at 2px offset; disabled grey (not used today, defined for completeness).

**`draft-row`** — Like a recipe item but with a dashed `{colors.border}` edge, the visual idea of a tile not yet fired, plus a status caption ("Importing…", "Ready to review"). While importing it is non-interactive and shown in its disabled look (grout fill, muted text) with a live status. States: hover solid cobalt border; active cobalt wash; focus 3px ring; disabled as described.

**`ingredient-row`** — Name in ink `body-md` on the left, grams in ink `amount` on a shared right edge (the "g" unit in muted `body-md`, 3px after the number), a hairline below each row, and markers or the "was 1 cup" original in muted caption under the name. A "to taste" ingredient shows the words "to taste" in muted `body-md` where the amount would be, with no marker: markers are only for amounts that need attention.

**`timer-row`** — A card with the step label in muted caption and the time in `{typography.timer}`; Pause and Clear are `icon-button`s. When the timer finishes, `timer-row-done` fills it with `{colors.warning-wash}` and turns the time and border `{colors.warning}` until dismissed.

**`menu`** + **`menu-item`** — Anchored dropdowns (account menu, row menus on desktop): a glazed card with `{elevation.float}`; items are 48px rows of ink `body-md`. `menu-item-destructive` (Delete) uses `{colors.error}` text. Item states: hover grout fill; active cobalt wash and text; focus 3px inset ring; disabled grey. On mobile, row menus (editor rows, bake log entries) render their items inside a `sheet`; the account menu stays an anchored dropdown on every device, because three items don't justify a sheet.

**`notice-info`**, **`notice-warning`**, **`notice-error`** — One-line banners inside the page (has-estimates, timer alerts card, save failed, import failed): a wash background with a 4px left accent in the semantic colour, ink `body-sm` text, and an optional `button-text` action at the end. Warning is for estimates; info for timer alerts and "Everything checked"; error for failures and the save-blocked summary.

**`inline-confirmation`** — Short success lines that appear in place: "Marked as baked today · Undo", "Link copied". Olive wash with an olive check icon; announced politely to screen readers; disappears after 10 seconds or on the next action.

**`timer-alert`** — The finished-timer banner across the top of the viewport: cobalt fill, `{colors.on-primary}` `heading` text, a 4px amarelo bottom edge like a painted tile border, `{elevation.float}`, and a Dismiss `button-secondary` rendered on the dark fill with `{colors.on-primary}` text and border. It is the only cobalt-filled surface that isn't a button, because it is the loudest moment in the app.

**`progress-stage`** — Import stage lines: a small marker (empty circle when pending, spinning ring when current, olive check when done) and the stage name, muted when pending, ink when current, olive when done. The spinner stops under reduced motion and shows "In progress" text.

**`skeleton`** — Loading placeholders in `{colors.surface-sunken}` blocks with `{rounded.sm}`, sized to the final content; a slow shimmer toward `{colors.hairline}`, removed under reduced motion.

**`sheet`** — The mobile bottom sheet: glazed card with top corners at `{rounded.lg}`, a grab handle in `{colors.border}`, a thin `tile-band` along its top edge as the brand touch, over `{colors.scrim}`. Its height fits its content (never empty space below the last element), up to 90% of the viewport, after which the body scrolls; BONES-shell lists the few exceptions with pinned footers or full-screen forms. A header row holds the title and a close X (`icon-button`) at its end; there is no Close button at the bottom.

**`modal`** — The desktop dialog: glazed card, `{rounded.lg}`, `{spacing.xl}` padding, over the scrim, with `{elevation.float}`. Sized to its content up to 90% of the viewport. A header row holds the title in `heading` and a close X (`icon-button`) at its end; actions sit directly under the content, never pushed to a far corner.

**`action-bar`** — The sticky bottom bar on mobile (Start baking, Import from a reel, Save recipe, Log a bake, Bake Mode's step nav): canvas fill, `{elevation.bar}`, `{spacing.md}` padding plus the device's bottom safe area.

**`app-header`** — The shell header: canvas fill, 64px tall, wordmark on the left, with a `tile-band` as its bottom edge on every page of the App and Share variants. In Bake Mode (Focus variant) the band is dropped to keep attention on the step.

**`app-footer`** — The shell footer: canvas fill with a hairline top rule, `{spacing.2xl}` above it, and its links (Privacy) in muted `caption`, underlined as `text-link`s. Quiet on purpose: it only has to be findable.

**`wordmark`** — "Backery" in Fraunces italic `wordmark` style, cobalt. Links to the Library in the App variant; plain text in the Share variant.

**`tile-band`** — A 24px strip of the azulejo motif in cobalt on canvas, between two 1px cobalt rules, like the painted border (barra) that frames a tile panel. Used under `app-header` and along the top of `sheet`. Decorative and hidden from assistive technology.

**`tile-mark`** — A single 18px azulejo tile in cobalt placed before every H2 section title (Scale, Ingredients, Steps, Latest bake, Drafts, Timers), `{spacing.sm}` from the text and vertically centred on its first line, like a maker's stamp. Not used on H1s, group headings, or inside cards. Decorative and hidden from assistive technology.

**`tile-panel`** — A 3:2 panel of the motif at 32px repeat, cobalt on `{colors.primary-wash}`, with a cobalt 1px frame. Used as the illustration in empty states (Library empty, Bake log empty), during import processing, and on Link Unavailable. Text always sits outside the panel, never on it.

---

## Responsive Behavior

| Breakpoint | Width | Key Changes |
|---|---|---|
| Mobile | < 768px | 4 columns, `{spacing.base}` gutters. Page H1s use `display-md`. Primary actions move into the sticky `action-bar`. Filters live in a `sheet`. Row menus render as sheets; the account menu stays a dropdown. `step-text` at 24px |
| Tablet | 768–1279px | 8 columns, `{spacing.lg}` gutters. Two-column recipe layout (ingredients 3, steps 5). `step-text` at 28px. Sheets become `modal`s. Primary actions return to page headers except in Bake Mode |
| Desktop | ≥ 1280px | 12 columns, `{spacing.xl}` gutters. Page H1s use `display-lg`. Filters in one row. All menus as anchored `menu`s |
| Wide | > 1264px content | Content caps at `{sizing.content-max}` (1200px) and centers; the `tile-band` still runs the full window width |

### Touch Targets
- Every interactive element is at least `{sizing.touch-min}` (48×48px), above WCAG's 44px, because hands in a kitchen are wet, floury, or gloved.
- Bake Mode's Previous and Next step buttons are `{sizing.touch-bake}` (64px) tall, big enough to hit with a knuckle.
- Adjacent small targets (the five stars, chip remove buttons) keep full 48px hit areas even when the visible glyph is smaller.
- Form controls are `{sizing.control-height}` (48px) tall; text in fields is at least 17px, which also stops iOS Safari from zooming into focused fields (it zooms under 16px).

### Collapsing Strategy
- Navigation: two links and the account menu fit the mobile top bar; there is no tab bar (BONES-shell).
- Grids: the recipe page's ingredients/steps split collapses to one column under 768px; the Library's row list becomes stacked cards.
- Spacing: section gaps step down one token on mobile (`{spacing.xl}` → `{spacing.lg}`).
- Type: only `display-lg` → `display-md` and `step-text` 28 → 24px change size; body sizes never shrink on mobile.

### Dark Mode
- Follows the device setting (`prefers-color-scheme`) by default. Every colour token has a `colors-dark` value; components don't change.
- Cobalt flips from a deep fill to a light glaze-blue (`#9DB6FF`), and `on-primary` flips to the night canvas, so primary buttons stay the brightest thing on the page.
- `elevation.float` becomes `elevation.float-dark`, and `elevation.bar` becomes `elevation.bar-dark`.
- The azulejo motif keeps using `{colors.primary}`, so it glows light blue on night-cobalt, like tiles under a streetlight.

---

## Known Gaps

- **Logo mark and app icon**: only the wordmark is defined. The Home Screen icon (needed for timer alerts) should be one azulejo tile, cobalt on tin glaze; its final artwork needs a designer's pass.
- **Recipe photography**: no photo treatment is defined because photos are still an open question in SKELETON. If added, they need a frame style and a rule for text over images.
- **Manual theme switch**: dark mode follows the device only. An in-app Light/Dark/System control would need a place in the account menu.
- **Timer sound**: the finished-timer sound (a short, warm chime, not an alarm buzz) needs to be chosen or produced.

---

## Do / Don't

| Do | Don't |
|---|---|
| Keep `{colors.primary}` cobalt for primary actions, selected states, links, and the tile motif | Use cobalt for decorative fills, backgrounds of whole sections, or body text |
| Use amarelo `{colors.crust}` only for filled stars and the timer alert edge | Use amarelo for text, buttons, or a second accent anywhere else |
| Put grams, timers, and step numbers in `amount`, `amount-lg`, `timer`, or `step-number` | Set any weighed or timed number in a proportional face |
| Name things in Fraunces (titles, sections, groups); do things in Atkinson (steps, buttons, notes) | Set steps, buttons, or form text in Fraunces |
| Separate cards with 1px `{colors.hairline}` and flat glaze | Add drop shadows to cards or list items; shadows are for floating layers only |
| Edge controls with `{colors.border}` so they meet 3:1 | Use `{colors.hairline}` as the only edge of an input, checkbox, or empty star |
| Use `{spacing.*}` tokens for every gap and padding | Invent in-between values like 10px or 20px |
| Keep one primary action per screen (the same action may repeat when one copy scrolls away); everything else is secondary, text, or icon | Put two different cobalt-filled actions on one screen, or two copies side by side |
| Show markers as text plus glyph ("~ Estimated") | Signal Estimated, Converted, or Missing by colour alone |
| Use the azulejo motif as a frame (header band, sheet edge), a section stamp (`tile-mark` before H2s), or an empty-state panel | Put text on top of the pattern, use it as a page background, or stamp more than section titles |
| Set the "g" after an amount in the reading face, muted, 3px away | Let the monospaced face set the unit, leaving a wide gap |
| Soften corners with `{rounded.md}` (8px) on buttons, notices, fields, and the segmented control | Make buttons pill-shaped or leave them sharp-cornered |
| Keep 48px targets, 64px in Bake Mode | Shrink targets on mobile to fit more in a row; wrap instead |
| Show focus with the 3px `{colors.focus-ring}` outline and offset | Remove outlines or rely on a colour shift to show focus |

---

## Agent Checklist

1. Read this SKIN.md, then SKELETON.md and the route's BONES files, before writing any UI.
2. Generate the theme once from `colors` and `colors-dark` as CSS custom properties with identical names (`--color-primary`), switched by `prefers-color-scheme`; components never branch on the theme.
3. Self-host the three fonts as described in Font Import (woff2, Latin subset, `font-display: swap`); apply `font-variant-numeric: tabular-nums` wherever a mono token is used.
4. `{colors.primary}` appears on one `button-primary` per screen, selected states, links, the wordmark, and the tile motif, nowhere else. `{colors.crust}` appears only in stars and `timer-alert`.
5. Every number the user weighs or times uses `amount`, `amount-lg`, `timer`, or `step-number`, right-aligned in lists; its unit uses the reading face in `{colors.muted}`; times inside step text use `time-mark`.
6. Cards and rows are border-only; use `{elevation.float}` only for `menu`, `sheet`, `modal`, and `timer-alert`, and `{elevation.bar}` only for `action-bar`.
7. Every interactive element implements its `-hover`, `-active`, `-focus`, and `-disabled` variants, and form fields their `-error` variant, with the 3px `{colors.focus-ring}` outline.
8. Every tap target is at least `{sizing.touch-min}`; Bake Mode's step buttons use `{sizing.touch-bake}`.
9. Markers (Estimated, Converted, Missing, Suggested) always show their text and glyph.
10. Render the azulejo SVG exactly as given, `aria-hidden`, and never under text.
11. Honour `prefers-reduced-motion`: no slides, scales, spinners, or shimmer.
12. If you need a value this file doesn't define, check Known Gaps first; otherwise use the nearest token and report it. Never add a colour, font, radius, or shadow.
