import { LoadCards } from "./load-cards.usecase";
import { SelectCard } from "./select-card.usecase";

export interface UseCases {
  loadCards: LoadCards;
  selectCard: SelectCard;
}
