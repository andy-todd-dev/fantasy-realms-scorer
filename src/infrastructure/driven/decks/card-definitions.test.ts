import { except, suit } from "./card-definitions";

describe("except", () => {
  it("adds the named cards to a suit matcher", () => {
    expect(
      except(suit("land"), { cardId: "mountain" }, { cardId: "forest" }),
    ).toEqual({ suit: "land", except: ["mountain", "forest"] });
  });

  it("keeps earlier exceptions when applied again", () => {
    expect(
      except(except(suit("land"), { cardId: "mountain" }), {
        cardId: "forest",
      }),
    ).toEqual({ suit: "land", except: ["mountain", "forest"] });
  });
});
