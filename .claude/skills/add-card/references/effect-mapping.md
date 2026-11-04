# Effect mapping

This describes the engine as of when it was written. `src/domain/card.ts` and `src/domain/score.ts` are the source of truth: if something listed as missing now exists, use it.

## Wording the model supports

Helpers are in `src/infrastructure/driven/decks/card-definitions.ts`. `card("x")` is the local helper in `base.cards.ts`.

| Printed wording | Effect |
|---|---|
| `+N` or `-N`, unconditional | `points(N)` |
| "+N for each X" | `points(N, { per: suit("x") })` |
| "+N for each X and Y" | two effects: `points(N, { per: suit("x") })`, `points(N, { per: suit("y") })` |
| "+N with X", "+N with any one X" | `points(N, { when: present(suit("x")) })` (no `per`, since it applies once) |
| "+N with the named card" | `points(N, { when: present(card("x")) })` |
| "-N unless with X" | `points(-N, { when: absent(suit("x")) })` |
| "+N if no X" | `points(N, { when: absent(suit("x")) })` |
| "+A for each X. OR +B for each X if with Y" | `points(A, { per, when: absent(Y) })`, `points(B, { per, when: present(Y) })` |
| "+N with both X and Y" | `points(N, { when: allOf(present(...), present(...)) })` |
| "BLANKS all X and Y" | `blank(suit("x"), suit("y"))` |
| "BLANKS the named card" | `blank(card("x"))` |
| "Blanked unless with X" | `blankSelf({ when: absent(suit("x")) })` |
| "Blanked with any X" | `blankSelf({ when: present(suit("x")) })` |
| "Clears the penalty on all X" | `clearPenalty(suit("x"))` |

**"OR" needs care.** Effects don't exclude each other on their own: every effect whose condition holds is added. King and Queen work because `absent(Y)` and `present(Y)` can never both be true. An "OR" whose two conditions could both hold can't be modelled this way, so treat it as a gap.

**"with X" versus "for each X".** `when` applies once however many cards match. `per` scales with the count. Getting these confused produces plausible scores, so check it for every clause.

## Engine behaviour worth knowing

All of this comes from `src/domain/score.ts`:

- **A card never counts itself.** `per` and `when` only look at the other cards, so printed "other" ("each other Leader") needs no extra modelling. It also means a Leader's "with a Leader" needs a second Leader.
- **A blank never hits the card that owns it.** "All Beasts" on a Beast means the other Beasts.
- **A blanked card has no effect on other cards.** It has no name, suit, base strength, bonus or penalty. When points are added up, it gives none, satisfies no `present` condition, and counts as missing for `absent`, so blanking a card can trigger someone else's penalty. Clearing and blanking have already happened by then, as below. These rules are quoted at the top of `score.ts`, so don't weaken them.
- **Blanks that target other cards are simultaneous.** A card that still blanks at that point blanks everything it targets, even if another card blanks it. If A blanks B and B blanks C, both B and C are blanked. If two cards blank each other, both are blanked, whatever order they're in.
- **Self-blanks come after those.** Their conditions only see cards that other cards didn't blank, so a blanked Army can't save a card that needs one, and a blanked Weather can't blank a card that avoids it. They're all checked at once, so one self-blanked card can still satisfy another card's self-blank condition. A self-blanked card has already blanked its targets by then. This order is our interpretation of the rulebook, noted in `score.ts`.
- **Clears apply before anything else, from the full hand.** The rulebook says clearing comes before any penalties are applied. So a cleared penalty can't blank the card that cleared it, and a clearer that's later blanked has still cleared. A cleared card keeps its suit, name, base strength and bonus. Only bonus-slot `clearPenalty` effects count, because the rulebook calls clearing a kind of bonus.
- **Bonus and penalty score the same way, but only penalties can be cleared.** Keep each effect in the slot the card prints it in.
- **Unknown effect kinds silently score 0.** `effectPoints` returns 0 for anything that isn't `points`, and `isBlanked` only looks at `blank`. A new kind compiles and does nothing until the engine handles it, which is why the test comes first.

## Wording the model can't express yet

Each of these goes through the propose-and-confirm step in `SKILL.md`.

| Printed idea | What's missing |
|---|---|
| Clearing a word from penalties, rather than a whole penalty | `clearPenalty` removes the whole penalty slot |
| Exceptions: "all X except Y" | targets and matchers have no exclusion |
| "with X or Y" | `allOf` needs every condition to hold; nothing covers either-or |
| Whole-hand or threshold rules: all different suits, odd strengths, N of one suit, runs | conditions only ask whether a card matches, not about the hand as a whole |
| Values read from other cards: "add the base strength of..." | `points` is a fixed number |
| Changing identity: new suit or name, duplicating a card | `matches` reads a card's printed suit and ID |
| Player choices: "any one card of your choice", "you may" | scoring takes only card IDs, so there's nowhere for a choice to come from |
| Extra cards: an eighth card from the discard | `HAND_SIZE` in `selectors.ts` is only a display target, but picking from the discard isn't modelled |

Resolution order matters for several of these. An effect that changes what other cards are (identity changes) or what their penalties say (clearing a word) has to resolve before blanking, because blanking depends on the result. Say which order you're proposing, and ask if the printed text doesn't settle it.

## Extending the engine

For anything that doesn't need player input, the change stays in the domain:

1. Add the variant or field to `CardEffect` in `src/domain/card.ts`. Keep it plain, serialisable data.
2. Write failing tests in `src/domain/score.test.ts`, using its synthetic cards (`card("subject", "wizard", 1, [...])`) in a new `describe`. Cover the interactions with blanking, `per` and `when`, not just the simple case.
3. Implement it in `src/domain/score.ts`.
4. Add a helper to `card-definitions.ts`. It may only use `import type` from the domain, because infrastructure can't call domain functions.

`LoadCardsUseCase` replaces each ability with its text, so new effect data stays out of the UI automatically. A new top-level field on `Card` isn't filtered: `toCardView` spreads it into store state. Put new data inside `effects` where you can.

**Player choices are a bigger change.** The choice has to reach `ScoreHand`, so its input changes, and the choice needs state and UI, following UI -> thunk -> use case as `CLAUDE.md` describes. Say so plainly in the proposal instead of presenting it as a small engine tweak.
