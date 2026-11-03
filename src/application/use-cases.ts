import { AddCardToHand } from "./add-card-to-hand.usecase";
import { LoadCards } from "./load-cards.usecase";
import { ScoreHand } from "./score-hand.usecase";

export interface UseCases {
  addCardToHand: AddCardToHand;
  loadCards: LoadCards;
  scoreHand: ScoreHand;
}
