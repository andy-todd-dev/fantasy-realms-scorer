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

### Card picker order
- Suits are listed in alphabetical order (Army, Artifact, Beast, Flame, Flood, Land, Leader, Weapon, Weather, Wild, Wizard), and cards are alphabetical within each suit. Players find cards by suit colour first, then scan down a predictable list.
- Sort in code with `localeCompare` rather than relying on data order, so cards added later land in the right place. Wild sits in its alphabetical slot, not at the end.

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
| `card` | `#1E2430` | `30 36 48` | Score card, stat tiles |
| `card-foreground` | `#EDE9E0` | `237 233 224` | Text on cards |
| `popover` | `#1E2430` | `30 36 48` | Sheets / menus, if added |
| `popover-foreground` | `#EDE9E0` | `237 233 224` | Text on popovers |
| `primary` | `#E3B75B` | `227 183 91` | Gold accent: total score, primary buttons, selection borders |
| `primary-foreground` | `#1A1408` | `26 20 8` | Text and icons on gold buttons |
| `secondary` | `#2A3242` | `42 50 66` | "Show calculation" button |
| `secondary-foreground` | `#EDE9E0` | `237 233 224` | Text on secondary buttons |
| `muted` | `#1A1F2A` | `26 31 42` | List rows, grid tiles, hand tray |
| `muted-foreground` | `#A9B0BD` | `169 176 189` | Captions, suit names, counters |
| `accent` | `#2E2A1E` | `46 42 30` | Selected tile / selected radio background |
| `accent-foreground` | `#F3E4BE` | `243 228 190` | Text on a selected background |
| `destructive` | `#FF8A8A` | `255 138 138` | Penalties (always with a minus sign) |
| `border` | `#2C3343` | `44 51 67` | Tile and card borders, dividers |
| `input` | `#3A4252` | `58 66 82` | Outline buttons, chip borders, input borders |
| `ring` | `#E3B75B` | `227 183 91` | Focus ring |

**App-specific tokens** (add alongside the semantic ones, same format):

| Token | Hex | RGB | Used for |
|---|---|---|---|
| `primary-pressed` | `#F0CD82` | `240 205 130` | Pressed / hover state of primary |
| `subtle-foreground` | `#C9CED8` | `201 206 216` | Secondary text: explanations, sub-totals |
| `icon` | `#8D95A3` | `141 149 163` | Decorative icons only (too low-contrast for text) |
| `chip` | `#232A38` | `35 42 56` | Hand chip background |
| `border-strong` | `#4A5262` | `74 82 98` | Unselected radio rings |
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
| Big total score | `font-heading text-7xl` | 72 |
| Breakdown total | `font-heading text-4xl` | 36 |
| Screen titles | `font-heading text-2xl` | 24 |
| Camera title, stat-tile numbers | `text-xl` | 20 |
| Section headings, card points | `text-lg` | 18 |
| Body, buttons, list names | `text-base` | 16 |
| Secondary text, chips, tiles | `text-sm` | 14 |
| Captions, suit headings (uppercase, `tracking-widest`) | `text-xs` | 12 |

- **Fonts:** `heading` = Marcellus (regular only, so never bold a heading), `body` = Inter. In React Native each Inter weight is its own font family (`Inter_400Regular`, `Inter_500Medium`, `Inter_600SemiBold`, `Inter_700Bold` from `@expo-google-fonts/inter`), so `font-medium` alone won't switch weight. The `--font-*` entries in `@theme inline` above create `font-heading`, `font-body`, `font-body-medium`, `font-body-semibold` and `font-body-bold`; use those instead of `font-*` weight classes. The family names must match the ones `expo-font` registers (listed in `app.json`).
- **Spacing:** 4px grid. Screen side padding `px-4`, gaps between list rows `gap-1`, between tiles `gap-1.5`, between sections `gap-3.5` / `gap-4`.
- **Heights:** primary buttons and hand rows `h-14` (56), tiles and radio rows `min-h-12` (48), chips `h-9` (36), icon buttons `h-11 w-11` (44), shutter `h-20 w-20` (80).
- **Radii:** tiles `rounded-lg` (8), list rows and secondary buttons `rounded-xl` (12), cards, primary buttons and the viewfinder `rounded-2xl` (16), pills, chips and dots `rounded-full`.

### Component mapping

| Mockup element | gluestack-ui component |
|---|---|
| Screen layouts, rows | `Box`, `VStack`, `HStack` |
| Titles / body text | `Heading`, `Text` |
| "Scan hand", "Hand complete: see score", "Looks right: see score" | `Button`, primary / solid style, large size, + `ButtonIcon` + `ButtonText` |
| "Pick", "New hand", "Scan" (header) | `Button`, outline style |
| "Show calculation" | `Button`, secondary style |
| Back, close, flash, remove-card | `Button`, link / ghost style with `ButtonIcon` only, plus `accessibilityLabel` |
| Score card, stat tiles, breakdown rows, "not sure" panel | `Card` |
| Grid tiles | `Pressable` with `accessibilityRole="checkbox"` and `accessibilityState={{ checked }}` |
| Hand chips (tap to remove) | `Pressable` styled as a pill (gluestack `Badge` isn't pressable) |
| Scan candidates | `RadioGroup` → `Radio`, `RadioIndicator`, `RadioIcon`, `RadioLabel` |
| Dividers above bottom bars | `Divider` |
| Icons | `Icon` with `lucide-react-native` (see below) |
| Camera | `CameraView` from `expo-camera`, with detection boxes as absolutely positioned `Box`es |

Button styles are described rather than given as exact prop values: use the `variant` / `size` options defined in `src/infrastructure/driving/ui/gluestack/button`, since that file is the reference for its API.

Icons used, by lucide name: `ChevronLeft` (back), `ChevronRight` (show calculation), `RotateCcw` (new hand), `Camera` (scan), `LayoutGrid` (pick), `X` (close / remove), `ZapOff` (flash), `Image` (photos), `Check` (selected / matched), `CircleAlert` (not sure).

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
