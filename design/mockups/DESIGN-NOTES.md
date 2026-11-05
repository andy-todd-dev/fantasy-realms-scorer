# Realms Scorer: design notes

These notes cover the intent behind the mockups in this folder: the things that can't be read from the screens themselves. Use the HTML files for exact colours, fonts and spacing; use this file for behaviour and reasoning.

## About the mockup files

- Each `*.dc.html` file is one phone screen at 390 × 844.
- They are written in a mockup format: `{{…}}` placeholders, `<sc-for>` / `<sc-if>` tags and a `class Component extends DCLogic` script that fills in sample data. Treat them as a visual and style reference. Rebuild the screens as React Native components; don't port the markup or the script.
- All card data in them (names, base strengths, bonus text, the example hand and its score) is sample data written from memory. The real card list and rules must come from the game itself, not from the mockups.

## Screens and flow

| File | Screen | Purpose |
|---|---|---|
| `Main.dc.html` | Home: pick your hand | The app opens here. Tap grid of every card, the hand so far, and a live score |
| `Scan.dc.html` | Scan your hand | Camera view; one photo captures the whole hand |
| `ScanReview.dc.html` | Check your cards | Confirm uncertain matches from the scan, then return home with the cards selected |
| `Breakdown.dc.html` | Hand & score breakdown | Every card in the hand and how the total was calculated; also where the hand is reviewed and cards removed |

Flows:
- **Manual:** Home (tap cards; score updates live) → "Show breakdown" → Breakdown.
- **Scan:** Home → Scan → Check → Home (cards already selected, score shown) → Breakdown if wanted.

There is no separate "hand" screen. An earlier version had one, but every visit led straight on to Scan or the picker, so it was a wasted step. On the home screen the hand is shown by the selected tiles and the progress pips; the full hand by name is on the breakdown, which lists every card anyway.

## Core principle: minimise taps to a score

Entering a hand card by card was too slow, so the design is built around the fact that the game has a small, fixed set of cards (53) and a hand is almost always 7.

1. **Open straight onto the cards.** The picker is the home screen, so the first tap can already be a card. Scan is a prominent gold button in the header for players who prefer the camera.
2. **Tap grid instead of search.** Every card is visible at once, grouped by suit. One tap adds, a second tap removes. No typing, no navigating back and forth.
3. **Live score.** The score updates with every tap (a partial hand is still scorable), so there is no "done" step. "Show breakdown" opens the breakdown whenever the player wants it.
4. **Edit, don't re-enter.** The hand persists, so trying a "what if" swap is a couple of taps. "Clear" empties the hand for the next game.

### Home screen layout
- **Compact header:** app name, "Clear" (text button) and "Scan" (gold pill). No screen title, to leave room for the grid.
- **The header hides on scroll:** it slides away as the grid scrolls down and comes back as soon as the player scrolls up (or reaches the top), giving the grid nearly the full screen height while picking. The mockup can't show this; implement it with an animated header driven by scroll direction (e.g. Reanimated's `useAnimatedScrollHandler`). The bottom bar never hides.
- **Grid** fills all the space between the header and the bottom bar and scrolls on its own.
- **Suit headings are just the suit dot and name.** A per-suit count of selected cards was tried and removed as noise: the gold selected tiles already show where the selections are.
- **Bottom bar is a single row with a fixed height** (about 56pt plus the safe-area inset), whatever the hand size. There is deliberately no list of card names here: an earlier version had a row of name chips, which looked cluttered and duplicated the gold selected tiles. The bar stays at the bottom rather than moving into the header, because that is where one-handed thumbs reach easily and it keeps the score large. Left to right it holds:
  - the **score** (gold, `text-3xl`) under a small "SCORE" label;
  - **Progress pips:** seven small circles (more if the hand legitimately grows to 8). Each selected card fills one pip in the gold accent; empty slots are dashed outlines. They are a count, nothing more, so they use **one colour only**: suit colours were tried and rejected, because coloured dots next to a suit-coloured grid read as if they meant something specific (which card, which suit) and could mislead. Beneath them, "N of 7 cards", which turns gold and reads "7 cards ✓" once the hand is full. Tapping the pips opens the breakdown, same as the button.
  - a compact **"Show breakdown"** button (48pt tall, 14pt text) on the right. With an empty hand the count reads "Tap cards or scan" and the button is disabled.

## Behaviour to implement

### Hand size
- The target is 7, but the picker must not block an 8th card: the Necromancer lets a player end with 8. Adjust the counter wording when a hand is legitimately larger.
- A card can be in the hand only once.

### Card picker order
- Suits are listed in alphabetical order (Army, Artifact, Beast, Flame, Flood, Land, Leader, Weapon, Weather, Wild, Wizard), and cards are alphabetical within each suit. Players find cards by suit colour first, then scan down a predictable list.
- Sort in code with `localeCompare` rather than relying on data order, so cards added later land in the right place. Wild sits in its alphabetical slot, not at the end.

### Scanning and matching
- Card recognition reads card names and matches them against the fixed card list. Use fuzzy matching (edit distance or similar), since OCR will misread letters.
- Each match has a confidence. Confident matches go straight into the "Matched" list; low-confidence ones go into "Not sure about this card" with the top 2–3 candidates, best first and preselected.
- "None of these" returns to the home grid to choose the right card by hand. Confirming ("Looks right: add to hand") also returns home, with the scanned cards selected and the score showing. Decide whether a scan replaces the current hand or adds to it; replacing is the likelier intent, but say so if cards were already selected.
- If the scan finds more or fewer than 7 cards, say so on the check screen rather than failing silently.
- "Photos" picks an existing image and follows the same path as a camera capture.
- The same name-matching logic can later support voice entry.

### Scoring and the breakdown
- The live score on the home screen and the breakdown must always agree: the breakdown splits the same total into **Base**, **Bonuses** and **Penalties**. Recalculate on every change to the hand.
- The breakdown lists each card with its base strength, then each bonus or penalty that applied **and the reason in plain words, naming the other cards involved** (e.g. "+10 × 2 Lands (Bell Tower, Mountain)"). The aim is that a player can check the maths against the physical cards.
- If a card has a bonus that didn't trigger, show a short note saying what was missing (e.g. "Bonus needs Smoke and Wildfire, not in hand"). This helps players learn the cards.
- **The breakdown is also the hand review.** It is the only place the whole hand is listed by name, so:
  - the header shows the total and the card count ("5 of 7 cards", or "7 cards · complete" in gold), so an incomplete hand never looks like a final score;
  - each row has a remove button (accessibility label "Remove Unicorn from hand"); removing re-runs the scoring and updates the screen in place. Swapping a card for another is done back on the home grid;
  - every card in the hand appears, including **blanked cards**, which must be shown clearly as scoring 0 (a blanked card scores nothing and its text doesn't apply). The footer also lists them.
- Order cards by contribution, highest first. If checking the hand by suit proves awkward, add a "Points / Suit" sort switch later.
- The scoring engine should produce this breakdown as structured data (per card: base, a list of modifiers with amount and reason, blanked flag), not just a total, so the UI can render it directly.

## Visual decisions

- **Dark tabletop theme**, chosen to suit evening play at a table and to feel like a fantasy game rather than a utility app. Gold (`#E3B75B`) is the single accent, used for the total score and primary actions.
- **Typography:** Marcellus (serif) for titles and the big score only; Inter for everything else.
- **Suit colours:** each of the 11 suits has its own colour dot, matching the colour printed on the physical cards so players recognise them instantly. Colour is never the only signal: the suit name always appears as text too, for colour-blind players. Keep the suit-to-colour mapping in one place (a theme file) so it is identical on every screen.
- **Uncertain scan results use orange** (`#F08A5D`), deliberately distinct from the gold accent and from the green used for bonuses, so "needs attention" can't be mistaken for "good".
- **Positive modifiers are green**; penalties should use a contrasting colour that also differs in lightness, plus a minus sign.

## Target stack: gluestack-ui v5 + NativeWind v5

The app is being built with gluestack-ui components styled through NativeWind v5, which runs on **Tailwind CSS v4**. (gluestack-ui v4 pairs with NativeWind v4 and Tailwind 3; v5 is the gluestack release built for NativeWind v5.) What that means for this design:

- **CSS-first theming.** There is no `tailwind.config.js`. All tokens (colours, fonts, any extra spacing) live in `global.css`, using `@theme` / `@theme inline`.
- **Semantic colour tokens.** gluestack v5 uses purpose-named tokens (`background`, `foreground`, `primary`, `primary-foreground`, `muted`, `border`…) instead of numbered scales like `primary-500` or `typography-700`. The tokens below follow that.
- **Same Tailwind scales.** Font sizes, spacing and the radii used here (`rounded-lg`, `-xl`, `-2xl`, `-full`) are unchanged in Tailwind v4, so every size in the mockups still maps to a class (e.g. 14px → `text-sm`, 16px radius → `rounded-2xl`, 56px → `h-14`).
- Never hard-code a hex in a component; use the token class (`bg-muted`, `text-muted-foreground`, `bg-suit-army`).

gluestack v5 is stable; NativeWind v5 is still a release candidate. The exact versions and how to add components are in the Styling section of `CLAUDE.md`.

### Colour tokens

Values are space-separated RGB channels, set per scheme and exposed as utilities with `@theme inline` in `global.css` (the gluestack CLI generates this structure; add to it rather than replacing it). The app is dark-only: give the variables a single set of dark values and render `<GluestackUIProvider mode="dark">`, so it never follows the phone's light mode.

**gluestack's semantic tokens:**

| Token | Hex | RGB | Used for |
|---|---|---|---|
| `background` | `#141821` | `20 24 33` | Screen background |
| `foreground` | `#EDE9E0` | `237 233 224` | Primary text |
| `card` | `#1E2430` | `30 36 48` | Stat tiles on the breakdown |
| `card-foreground` | `#EDE9E0` | `237 233 224` | Text on cards |
| `popover` | `#1E2430` | `30 36 48` | Sheets / menus, if added |
| `popover-foreground` | `#EDE9E0` | `237 233 224` | Text on popovers |
| `primary` | `#E3B75B` | `227 183 91` | Gold accent: total score, primary buttons, selection borders |
| `primary-foreground` | `#1A1408` | `26 20 8` | Text and icons on gold buttons |
| `secondary` | `#2A3242` | `42 50 66` | Secondary buttons, if needed |
| `secondary-foreground` | `#EDE9E0` | `237 233 224` | Text on secondary buttons |
| `muted` | `#1A1F2A` | `26 31 42` | List rows, grid tiles, home bottom bar |
| `muted-foreground` | `#A9B0BD` | `169 176 189` | Captions, suit names, counters |
| `accent` | `#2E2A1E` | `46 42 30` | Selected tile / selected radio background |
| `accent-foreground` | `#F3E4BE` | `243 228 190` | Text on a selected background |
| `destructive` | `#FF8A8A` | `255 138 138` | Penalties (always with a minus sign) |
| `border` | `#2C3343` | `44 51 67` | Tile and card borders, dividers |
| `input` | `#3A4252` | `58 66 82` | Outline buttons, input borders |
| `ring` | `#E3B75B` | `227 183 91` | Focus ring |

**App-specific tokens** (add alongside the semantic ones, same format):

| Token | Hex | RGB | Used for |
|---|---|---|---|
| `primary-pressed` | `#F0CD82` | `240 205 130` | Pressed / hover state of primary |
| `subtle-foreground` | `#C9CED8` | `201 206 216` | Secondary text: explanations, sub-totals |
| `icon` | `#8D95A3` | `141 149 163` | Decorative icons only (too low-contrast for text) |
| `border-strong` | `#4A5262` | `74 82 98` | Unselected radio rings, empty progress pips (dashed) |
| `warning` | `#F08A5D` | `240 138 93` | Warning border, uncertain scan outlines |
| `warning-muted` | `#2A1F1A` | `42 31 26` | "Not sure about this card" panel background |
| `warning-foreground` | `#F8B596` | `248 181 150` | Warning text |
| `success` | `#9DD49A` | `157 212 154` | Bonuses, matched-card ticks |
| `camera` | `#0B0D12` | `11 13 18` | Camera screen background |
| `suit-army` | `#000000` | `0 0 0` | Black |
| `suit-artifact` | `#E67E22` | `230 126 34` | Orange |
| `suit-beast` | `#1E7B3A` | `30 123 58` | Green |
| `suit-flame` | `#D93636` | `217 54 54` | Red |
| `suit-flood` | `#1F4FA8` | `31 79 168` | Dark blue |
| `suit-land` | `#8B5A2B` | `139 90 43` | Brown |
| `suit-leader` | `#8E44C9` | `142 68 201` | Purple |
| `suit-weapon` | `#B4B8BE` | `180 184 190` | Grey |
| `suit-weather` | `#7CC4EE` | `124 196 238` | Light blue |
| `suit-wild` | `#E6E8EA` | `230 232 234` | White |
| `suit-wizard` | `#EE7FB8` | `238 127 184` | Pink |
| `suit-dot-ring` | `#8D95A3` | `141 149 163` | 1px ring round every suit dot |

Sketch of the additions in `global.css` (match the exact variable naming the CLI generated for the semantic tokens):

```css
@layer theme {
  :root {
    --success: 157 212 154;
    --suit-army: 0 0 0;
    /* …the rest of the app-specific tokens… */
  }
}

@theme inline {
  --color-success: rgb(var(--success));
  --color-suit-army: rgb(var(--suit-army));
  /* … */

  --font-heading: "Marcellus_400Regular";
  --font-body: "Inter_400Regular";
  --font-body-medium: "Inter_500Medium";
  --font-body-semibold: "Inter_600SemiBold";
  --font-body-bold: "Inter_700Bold";
}
```

The suit colours match the printed cards and live in `global.css` with the other tokens, which is the only source of colour. Several are dark (Army is black, Flood and Land are dark), so every suit dot has a 1px `suit-dot-ring` border to stay visible on the dark background, as `SuitDot.tsx` already does.

`SUITS` in `src/infrastructure/driving/ui/theme.ts` holds each suit's class (`army: { label: 'Army', colorClass: 'bg-suit-army' }`) rather than building class names from strings: Tailwind v4 still only generates classes it finds written out in full.

### Type, spacing and radius scales

| Role | Class | Size |
|---|---|---|
| Breakdown total | `font-heading text-4xl` | 36 |
| Live score (home bottom bar) | `font-heading text-3xl` | 30 |
| Screen titles | `font-heading text-2xl` | 24 |
| Camera title, stat-tile numbers | `text-xl` | 20 |
| Section headings, card points | `text-lg` | 18 |
| Body, buttons, list names | `text-base` | 16 |
| Secondary text, tiles | `text-sm` | 14 |
| Captions, suit headings (uppercase, `tracking-widest`) | `text-xs` | 12 |

- **Fonts:** `heading` = Marcellus (regular only, so never bold a heading), `body` = Inter. In React Native each Inter weight is its own font family (`Inter_400Regular`, `Inter_500Medium`, `Inter_600SemiBold`, `Inter_700Bold` from `@expo-google-fonts/inter`), so `font-medium` alone won't switch weight. The `--font-*` entries in `@theme inline` above create `font-heading`, `font-body`, `font-body-medium`, `font-body-semibold` and `font-body-bold`; use those instead of `font-*` weight classes. The family names must match the ones `expo-font` registers (listed in `app.json`).
- **Spacing:** 4px grid. Screen side padding `px-4`, gaps between list rows `gap-1`, between tiles `gap-1.5`, between sections `gap-3.5` / `gap-4`.
- **Heights:** full-width primary buttons and hand rows `h-14` (56), the home "Show breakdown" button, tiles and radio rows `min-h-12` (48), icon buttons `h-11 w-11` (44), progress pips `h-3 w-3` (12, filled `bg-primary`) with `gap-1`, shutter `h-20 w-20` (80).
- **Radii:** tiles `rounded-lg` (8), list rows and secondary buttons `rounded-xl` (12), cards, primary buttons and the viewfinder `rounded-2xl` (16), pills, pips and dots `rounded-full`.

### Component mapping

| Mockup element | gluestack-ui component |
|---|---|
| Screen layouts, rows | `Box`, `VStack`, `HStack` |
| Titles / body text | `Heading`, `Text` |
| "Show breakdown", "Looks right: add to hand" | `Button`, primary / solid style, large size, + `ButtonText` (+ `ButtonIcon`) |
| "Scan" (home header) | `Button`, primary / solid style, small size, fully rounded |
| "Clear" (home header) | `Button`, link / ghost style |
| Progress pips | `Pressable` (opens the breakdown) wrapping an `HStack` of `Box` circles; give the `Pressable` an `accessibilityLabel` such as "5 of 7 cards. Show breakdown" |
| Breakdown row remove | `Button`, link / ghost style, icon only, `accessibilityLabel="Remove <card> from hand"` |
| Back, close, flash, remove-card | `Button`, link / ghost style with `ButtonIcon` only, plus `accessibilityLabel` |
| Stat tiles, breakdown rows, "not sure" panel | `Card` |
| Grid tiles | `Pressable` with `accessibilityRole="checkbox"` and `accessibilityState={{ checked }}` |
| Scan candidates | `RadioGroup` → `Radio`, `RadioIndicator`, `RadioIcon`, `RadioLabel` |
| Dividers above bottom bars | `Divider` |
| Icons | `Icon` with `lucide-react-native` (see below) |
| Camera | `CameraView` from `expo-camera`, with detection boxes as absolutely positioned `Box`es |

Button styles are described rather than given as exact prop values: use the `variant` / `size` options defined in `src/infrastructure/driving/ui/gluestack/button`, since that file is the reference for its API.

Icons used, by lucide name: `ChevronLeft` (back), `ChevronRight` (show breakdown), `RotateCcw` (clear hand), `Camera` (scan), `X` (close / remove card), `ZapOff` (flash), `Image` (photos), `Check` (selected / matched), `CircleAlert` (not sure).

### Translating the mockup CSS

- **CSS grid doesn't exist in React Native,** even with NativeWind v5. The tile grid and stat tiles use `display: grid` in the HTML; build them as `flex-row flex-wrap`, with each tile `w-1/3` and half the gap as padding, and a matching negative margin on the row, so that three tiles fill each row exactly. gluestack's `Grid`/`GridItem` is another option but was still marked alpha.
- **Scrolling:** the tile list and breakdown list are `ScrollView`s (or `FlatList` / `SectionList` for the suit-grouped tiles). The suit filter strip, if it comes back, would be a horizontal `ScrollView`.
- **Tabular numbers:** points columns use tabular figures. NativeWind v5 drops the `tabular-nums` class on native, so set `fontVariant` in `style`.
- **Safe areas:** the mockups use fixed top and bottom padding. In the app, use `SafeAreaView` (or `useSafeAreaInsets`) instead, so bars clear the notch and home indicator.
- **Selected states:** drive selected styling from props (`className={checked ? 'border-primary bg-accent' : 'border-border bg-muted'}`), keeping both strings written out in full.

## Accessibility

- Touch targets are at least 44 × 44 pt; the main action buttons are 52–56 pt tall.
- Icon-only buttons (remove card, close camera, flash) need accessibility labels, e.g. "Remove Unicorn".
- Grid tiles are toggles: expose their state to screen readers (`accessibilityRole="checkbox"`, `accessibilityState={{ checked }}`).
- Text colours were chosen for at least 4.5:1 contrast on the dark background; keep that when adjusting greys. `icon` is for icons only.

## Open questions

- Should the app keep a history of scored hands, or only the current one?
- Multiplayer scoring (several players' hands at the end of a game) isn't designed yet.
- Which recognition approach to use: on-device text recognition (offline, free, needs a development build) or a cloud service (simpler, better on angled cards, small cost per scan).
