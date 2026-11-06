import { AddCardToHand } from "./add-card-to-hand.usecase";
import { ClearHand } from "./clear-hand.usecase";
import { LoadCards } from "./load-cards.usecase";
import { RemoveCardFromHand } from "./remove-card-from-hand.usecase";
import { ScoreHand } from "./score-hand.usecase";

export interface UseCases {
  addCardToHand: AddCardToHand;
  clearHand: ClearHand;
  loadCards: LoadCards;
  removeCardFromHand: RemoveCardFromHand;
  scoreHand: ScoreHand;
}
