import { AddCardToHand } from "./add-card-to-hand.usecase";
import { LoadCards } from "./load-cards.usecase";

export interface UseCases {
  addCardToHand: AddCardToHand;
  loadCards: LoadCards;
}
