# Design

## Intent

Asakei Blog should feel like a quiet blueprint room: white desk, graphite marks, cobalt annotation, and a small brass desk lamp. The design is restrained but not anonymous.

## Color

Use OKLCH tokens only. The strategy is restrained with a committed cobalt brand anchor.

- `--bg`: `oklch(1 0 0)`
- `--surface`: `oklch(0.965 0.004 250)`
- `--ink`: `oklch(0.145 0.018 250)`
- `--muted`: `oklch(0.43 0.025 250)`
- `--primary`: `oklch(0.42 0.135 250)`
- `--primary-strong`: `oklch(0.33 0.13 250)`
- `--accent`: `oklch(0.59 0.13 74)`
- `--line`: `oklch(0.88 0.01 250)`

## Typography

Use a deliberately simple sans-serif stack to keep the blog fast and deployable. Large headings should be tight but never cramped. Body copy should stay between 65ch and 75ch.

## Components

- Header: minimal sticky navigation with text links and one GitHub icon action.
- Hero: strong name lockup, short positioning statement, and a code-map visual asset.
- Article list: editorial rows with date, title, summary, tags, and reading time.
- Sidebar notes: compact profile facts and topic links.
- Footer: concise publishing and GitHub Pages signal.

## Motion

Use subtle load-in motion for hero and article rows. The visual asset can animate slowly. Disable animation for reduced motion.

## Layout

Use asymmetric desktop composition: writing column first, profile/visual column second. Avoid nested cards and heavy shadows. On mobile, collapse to a single column with stable spacing and readable controls.
