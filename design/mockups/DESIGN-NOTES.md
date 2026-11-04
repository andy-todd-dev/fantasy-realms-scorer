# Fantasy Realms Scorer: design notes

These notes cover the intent behind the mockups in this folder: the things that can't be read from the screens themselves. Use the HTML files for exact colours, fonts and spacing; use this file for behaviour and reasoning.

## About the mockup files

- Each `*.dc.html` file is one phone screen at 390 × 844.
- They are written in a mockup format: `{{…}}` placeholders, `<sc-for>` / `<sc-if>` tags and a `class Component extends DCLogic` script that fills in sample data. Treat them as a visual and style reference. Rebuild the screens as React Native components; don't port the markup or the script.
- All card data in them (names, base strengths, bonus text, the example hand and its score) is sample data written from memory. The real card list and rules must come from the game itself, not from the mockups.

## Screens and flow

| File | Screen | Purpose |
|---|---|---|
| `Main.dc.html` | Hand & score | Home screen: total score, the current hand, entry points to change it |
| `Scan.dc.html` | Scan your hand | Camera view; one photo captures the whole hand |
| `ScanReview.dc.html` | Check your cards | Confirm uncertain matches from the scan before scoring |
| `AddCard.dc.html` | Pick your cards | Tap grid of every card, for manual entry and corrections |
| `Breakdown.dc.html` | Score breakdown | How the total was calculated, card by card |

Main flow: **Main → Scan → Check → Breakdown**. The grid picker is the fallback, reachable from Main ("Pick"), from the camera ("Pick") and from the check screen ("None of these").

## Core principle: minimise taps to a score

Entering a hand card by card was too slow, so the design is built around the fact that the game has a small, fixed set of cards (53) and a hand is almost always 7.

1. **Camera first.** Scanning is the primary action everywhere: the large "Scan hand" button on Main, and "New hand" also opens the camera. Ideal path: one photo, fix at most one or two cards, see the score.
2. **Tap grid instead of search.** Every card is visible at once, grouped by suit. One tap adds, a second tap removes. No typing, no navigating back and forth.
3. **Stay on the picker until the hand is full.** Adding a card never leaves the screen. The tray shows "N of 7" and how many are left; at 7 the button becomes "Hand complete: see score" and goes straight to the breakdown.
4. **Edit, don't re-enter.** The hand persists after scoring, so trying a "what if" swap is a couple of taps.

## Behaviour to implement

### Hand size
- The target is 7, but the picker must not block an 8th card: the Necromancer lets a player end with 8. Show the "see score" button from 7 onwards and adjust the counter wording when a hand is legitimately larger.
- A card can be in the hand only once.

### Scanning and matching
- Card recognition reads card names and matches them against the fixed card list. Use fuzzy matching (edit distance or similar), since OCR will misread letters.
- Each match has a confidence. Confident matches go straight into the "Matched" list; low-confidence ones go into "Not sure about this card" with the top 2–3 candidates, best first and preselected.
- "None of these" opens the grid picker to choose the right card by hand.
- If the scan finds more or fewer than 7 cards, say so on the check screen rather than failing silently.
- "Photos" picks an existing image and follows the same path as a camera capture.
- The same name-matching logic can later support voice entry.

### Scoring and the breakdown
- The score on Main splits into **Base**, **Bonuses** and **Penalties**, and the breakdown screen must add up to exactly the same figures.
- The breakdown lists each card with its base strength, then each bonus or penalty that applied **and the reason in plain words, naming the other cards involved** (e.g. "+10 × 2 Lands (Bell Tower, Mountain)"). The aim is that a player can check the maths against the physical cards.
- If a card has a bonus that didn't trigger, show a short note saying what was missing (e.g. "Bonus needs Smoke and Wildfire, not in hand"). This helps players learn the cards.
- **Blanked cards** must be shown clearly (a blanked card scores nothing and its text doesn't apply), and the footer lists them.
- Order cards by contribution, highest first.
- The scoring engine should produce this breakdown as structured data (per card: base, a list of modifiers with amount and reason, blanked flag), not just a total, so the UI can render it directly.

## Visual decisions

- **Dark tabletop theme**, chosen to suit evening play at a table and to feel like a fantasy game rather than a utility app. Gold (`#E3B75B`) is the single accent, used for the total score and primary actions.
- **Typography:** Marcellus (serif) for titles and the big score only; Inter for everything else.
- **Suit colours:** each of the 11 suits has its own colour dot. Colour is never the only signal: the suit name always appears as text too, for colour-blind players. Keep the suit-to-colour mapping in one place (a theme file) so it is identical on every screen.
- **Uncertain scan results use orange** (`#F08A5D`), deliberately distinct from the gold accent and from the green used for bonuses, so "needs attention" can't be mistaken for "good".
- **Positive modifiers are green**; penalties should use a contrasting colour that also differs in lightness, plus a minus sign.

## Accessibility

- Touch targets are at least 44 × 44 pt; the main action buttons are 52–56 pt tall.
- Icon-only buttons (remove card, close camera, flash) need accessibility labels, e.g. "Remove Unicorn".
- Grid tiles are toggles: expose their selected state to screen readers (`accessibilityState={{ selected }}`).
- Text colours were chosen for at least 4.5:1 contrast on the dark background; keep that when adjusting greys.

## Open questions

- Should the app keep a history of scored hands, or only the current one?
- Multiplayer scoring (several players' hands at the end of a game) isn't designed yet.
- Which recognition approach to use: on-device text recognition (offline, free, needs a development build) or a cloud service (simpler, better on angled cards, small cost per scan).
