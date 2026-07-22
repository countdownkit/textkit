# CLAUDE.md — textkit

Project instructions for Claude Code working in this repo. Inherits the ElevatedProgress
venture playbook from the parent folder's CLAUDE.md.

## What this is

A zero-dependency static-site generator for a **fancy text / font generator** — type plain
words, get them back in dozens of Unicode styles (bold, italic, cursive, bubble, upside-down,
strikethrough, small caps, case conversions…) with a per-style Copy button. `generate.js`
reads `data/text.json` + `assets/` and writes one page per style into `public/`. Target:
https://text.elevatedprogress.com/. This is the venture's first **interactive** tool (the rest
are printables): the differentiator vs the ad-choked "fancy text" mills is a clean, fast,
self-contained page that ranks on the many long-tail style queries (cursive-text, bubble-text,
upside-down-text, case-converter, …).

## The product rule

**The tool IS the page.** Each page server-renders the input (with a sample) and every style
row, so it works with no JS and is fully indexable. `assets/tool.js` only re-renders each row's
output as the user types, and wires the Copy buttons (async Clipboard API + execCommand
fallback). Keep it 100% client-side and self-contained — **no external requests, CDNs, fonts,
or assets** beyond the AdSense/GA snippets baked into the head.

All the character maps + transforms live in `assets/fonts.js`, a UMD module required by BOTH
`generate.js` (server render) and `tool.js` (browser) so their output matches exactly. When
adding/fixing a style, edit the map there once. Maps are built from Unicode code-point ranges
with explicit overrides for the reserved "holes" (italic h → ℎ; double-struck C/H/N/P/Q/R/Z;
etc.). "Cursive" is mathematical **bold** script (no reserved gaps). Filled-bubble and squared
only exist as capitals, so those rows reuse capitals for lowercase.

## Deploy — just push

`git push` to `main` is the deploy — GitHub Actions (`.github/workflows/deploy.yml`).

- **Never manually build and commit output.** `public/` is git-ignored build output.
- **Never hand-edit anything in `public/`.**
- Commit as the neutral identity:
  `git -c user.name="textkit" -c user.email="textkit@users.noreply.github.com" commit …`

## Local build / preview

```
node generate.js     # writes ./public   (prints "Generated N pages")
node server.js       # preview at http://localhost:5081
```

## Pages

One page per entry in `data/text.json` (`fancy-text-generator` = flagship / shows all, then
`cursive-text`, `bold-text`, `italic-text`, `bubble-text`, `small-text`, `wide-text`,
`strikethrough-text`, `underline-text`, `upside-down-text`, `mirror-text`, `case-converter`)
plus the homepage, which groups the links into Styles / Effects / Case. Each page emphasizes
one style (its `emph` id renders first with a highlight) but shows every style below it.

## Don't break these (generated, must keep serving)

- `ads.txt` + AdSense loader in `<head>` — publisher `ca-pub-5580575158570188`.
- GA4 `G-TJY4TRRKD6` (shared across all EP sites; hostname splits them).
- `sitemap.xml`, `robots.txt`, `.nojekyll`, `CNAME` (text.elevatedprogress.com).
- GSC verification file once the property is verified.

## Config knobs

`DOMAIN` and `BASE`, same semantics as the other tools. Production values in the workflow.
Output is deterministic (no randomness): a given `data/text.json` always yields the same pages.
