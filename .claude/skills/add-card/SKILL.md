---
name: add-card
description: Add a Fantasy Realms card to this app, or correct an existing one, by translating its printed bonus and penalty text into the scoring engine's effect model, extending the engine if needed, and testing the scores. Use this whenever the user wants to add, enter, implement or fix a card, deck entry, bonus, penalty, BLANKS or CLEARS effect, even if they only paste card text or a card photo without saying "add", or complain that a card scores wrongly.
---

# Add a card

Adding a card looks like a data edit, but the real work is translating printed rules into effects without changing what they mean. A wrong effect still compiles and still produces a plausible score, so the checks below exist to catch mistakes nothing else will.

## 1. Get the card details from the user

You need the name, suit, base strength, and the bonus and penalty text exactly as printed, and which section of the card each rule is printed in. Accept one card or a batch, and photos as well as text.

Only use what the user gives you. If anything is missing or unreadable, ask, and don't fill it in from what you recall of the game: a misremembered number gives a believable wrong score that nobody will notice.

## 2. Read the current code

Read these before relying on anything in this skill:

- `src/domain/card.ts`: the effect model
- `src/domain/score.ts`: how effects resolve
- `src/infrastructure/driven/decks/card-definitions.ts`: helpers for writing effects
- `src/infrastructure/driven/decks/base.cards.ts`: the deck, and examples to follow

The engine is still growing. If the code disagrees with this skill or its reference, the code is right, and mention the mismatch in your report so the skill can be updated.

## 3. Map each clause to effects

Read [references/effect-mapping.md](references/effect-mapping.md). Split the text into clauses and map them one at a time, then show the user the mapping before editing anything:

```
"+3 for each Flood and Land"  -> points(3, { per: suit("flood") }), points(3, { per: suit("land") })
"-6 unless with a Wizard"     -> points(-6, { when: absent(suit("wizard")) })
```

If you make any judgement call about what the wording means, say so here.

## 4. If a clause doesn't fit, propose before building

When the model can't express a clause, stop and make no edits yet, neither to the engine nor to the deck. A card added without its rule would score wrongly with no sign of it. Don't approximate the rule with the nearest effect that does fit, either.

Give the user:

- the clause that doesn't fit, and why
- the new effect shape you suggest
- where it goes in the resolution order, and how it interacts with blanking
- any interpretation of the rules you're assuming, as a question if the printed text doesn't settle it

Then end your turn and wait. Rule interpretations are the user's call. When the user quotes the rulebook, add the quote to the comment at the top of `src/domain/score.ts`, so the engine records why it behaves as it does. Once they confirm, extend the engine as the reference describes and carry on with step 5.

## 5. Add the card

Edit `src/infrastructure/driven/decks/base.cards.ts`:

- Add the ID to the `BaseCardId` union, and an entry to `BASE_DECK_CARDS`. The record key is the ID, in kebab-case, so there's no `id` field.
- Keep `text` verbatim, because it's what the player reads.
- Put each effect under `bonus` or `penalty` according to where the card prints it, not by whether its number is positive. Scoring sums both today, but CLEARS removes penalties only, so a misplaced effect will break later.
- Suits are lowercase. Note the spelling `artifact`.

Normal cards need no UI or Redux changes: `LoadCardsUseCase` passes only `text` on to the UI, and sections are built from the card's suit.

**A rule naming a card that isn't in the deck yet.** `card("x")` won't compile until `x` is defined. Ask the user which they want:

- **The real card:** get its printed details and add it as well.
- **A placeholder:** add an entry with a name, base strength and suit only, and no rules, so the rule can be built and tested now. The user may leave the values to you. Pick arbitrary ones that don't pretend to be the printed values, and use suit `wild` so the tile lists last and doesn't move others. Add a comment saying it's a placeholder and what to replace, and list it in your report, because it's selectable in the app until replaced.

Don't write a raw `{ cardId: "x" }` to get past the compiler: it type-checks but never matches, so an `absent` condition is always true and a `present` one never is.

**The card already exists as a placeholder.** Replace its entry with the printed details, remove the placeholder comment, and update any tests whose scores relied on the placeholder's values.

## 6. Check the existing cards

A new card changes how others score. Look through the deck for:

- cards whose rules name this card, or its suit
- cards that blank its suit, and whether this card blanks theirs
- `absent` conditions that this card now switches off, and `present` ones it now switches on

Add a test for each real interaction you find.

## 7. Test with hand-worked scores

Scoring tests for real cards go in `src/card-scoring.test.ts`, which you should create if it doesn't exist. It sits at the `src/` root because ESLint rules out the alternatives: the driven layer can't call domain functions, and the domain and application layers can't import infrastructure.

Build the use case directly, as below, rather than going through `createUseCases()`. Jest can't load `composition-root.ts`, because it resolves Awilix to an ES module build it doesn't transform. Don't change the Jest config to get around this unless the user asks. These tests still cover the real card data, catalog and use case.

```ts
import { ScoreHandUseCase } from "./application/score-hand.usecase";
import {
  CARDS,
  InMemoryCardCatalog,
} from "./infrastructure/driven/in-memory-card-catalog";

const score = (...cardIds: string[]) =>
  new ScoreHandUseCase({ cardCatalog: new InMemoryCardCatalog() }).execute(cardIds);

describe("knights", () => {
  it("takes the penalty without a Leader", async () => {
    await expect(score("knights")).resolves.toBe(12); // 20 - 8
  });

  it("avoids the penalty with a Leader", async () => {
    await expect(score("knights", "king")).resolves.toBe(33); // 20 + (8 + 5 per Army)
  });
});
```

**A rule about a suit with no cards in the deck yet.** Pass stand-in cards to the catalog inside the test, so they never reach the real deck, and name them so it's clear they should be replaced later:

```ts
const aWizard = { deckId: "base", id: "a-wizard", name: "A Wizard", suit: "wizard", baseStrength: 5 } as const;

const scoreWith = (extraCards: typeof CARDS, ...cardIds: string[]) =>
  new ScoreHandUseCase({
    cardCatalog: new InMemoryCardCatalog([...CARDS, ...extraCards]),
  }).execute(cardIds);
```

Stand-ins are only for suits. A rule naming a specific card needs that card in the deck, real or placeholder, as step 5 explains.

For each clause, test the case where it applies and the case where it doesn't. Also test the interactions from step 6.

Work out each expected score by hand from the printed text, and show the sum in a comment. Don't run the code and paste in the result, since that only proves the code does what it does.

## 8. Verify

Run all three:

```bash
npx tsc --noEmit
npm run lint
npm test
```

`tsc` is the one that's easy to forget, and it matters: Jest runs through Babel and doesn't type-check, so a misspelled suit or a card missing from `BaseCardId` can pass every test.

Don't install the app or run Maestro unless the user asks. Do check `.maestro/select-card.yaml` by eye: cards are listed by suit, so a new card can push a tile the flow taps off-screen, and flows asserting a score could change.

## 9. Report back

Keep it short, and include:

- the clause-to-effect mapping
- the worked scores you tested
- any part of the card that can't trigger in the app yet, because the deck has no cards of the suit it needs
- any assumption you made about the rules, and any behaviour from the reference's "engine behaviour" section that this card relies on
- whether the Maestro flow may need attention
- the results of `tsc`, lint and Jest

Don't commit unless the user asks.
