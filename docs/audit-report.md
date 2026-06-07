# Accessibility & Performance Audit — Before / After

A comparison of the application before the overhaul (legacy CRA app) and after
(modernized Vite app).

> Methodology note: the **legacy app did not build** (a broken Aptos SDK import
> and a half-finished web3→Aptos migration), so live runtime metrics could not
> be captured for "before". That row is therefore assessed qualitatively from
> the source; "after" figures are from the production build in this repo.

## Accessibility (a11y)

| Area            | Before                                                            | After                                                                      |
| --------------- | ----------------------------------------------------------------- | -------------------------------------------------------------------------- |
| Landmarks       | Generic `Box` app bar, no `<nav>`                                 | Semantic `<nav aria-label="Primary">`, `<main>`                            |
| Icon buttons    | Decorative search / mail / notification icons with no real action | Removed dead controls; remaining icon buttons have `aria-label` + tooltips |
| Theming         | Light only                                                        | Light/dark toggle, honors `prefers-color-scheme`, persisted                |
| Forms           | Inputs present                                                    | MUI labelled fields, `required`, disabled-state feedback                   |
| Status/progress | Raw numbers                                                       | `LinearProgress` with descriptive `aria-label`; alerts for state           |
| Decorative text | Glow duplicate read by SR                                         | Marked `aria-hidden`                                                       |
| Focus           | Default                                                           | MUI focus-visible styling retained; keyboard-navigable nav/menus           |

Net: removed misleading non-functional controls, added landmarks and labels,
and introduced a color-contrast-friendly dark mode.

## Performance

| Metric               | Before                             | After                                                                 |
| -------------------- | ---------------------------------- | --------------------------------------------------------------------- |
| Builds at all        | ❌ No (broken import)              | ✅ Yes                                                                |
| Bundler              | CRA / react-scripts (webpack, EOL) | Vite 6 (esbuild/rollup)                                               |
| Code splitting       | Single bundle                      | `vendor-aptos`, `vendor-mui`, `vendor-react` + app chunks             |
| App (non-vendor) JS  | n/a                                | ~149 kB + ~487 kB chunks (gzip ~46 kB / ~161 kB)                      |
| Largest vendor chunk | n/a                                | `vendor-aptos` ~1.2 MB (gzip ~611 kB) — the Aptos SDK                 |
| Caching              | One hash churns on any change      | Vendors cached independently; immutable `Cache-Control` on `/assets/` |
| Transport            | Host-dependent                     | gzip enabled in nginx; long-cache fingerprinted assets                |

### Known performance follow-ups

- The Aptos SDK dominates bundle size. Options: route-level lazy-loading so the
  SDK loads only on Create/Vote/Results, and evaluating a lighter client
  surface. Tracked in the roadmap.
- Add a Lighthouse CI job to capture real Core Web Vitals once a public preview
  URL exists.

## Security headers (new)

CSP, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`,
`Permissions-Policy`, and HSTS are shipped via `public/_headers` (static hosts)
and mirrored in the nginx config (Docker). See [SECURITY.md](../SECURITY.md).
