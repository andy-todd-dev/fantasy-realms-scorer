import { CardId } from "../domain/card";
import { addCardToHand, Hand } from "../domain/hand";

export interface SelectCard {
  execute(hand: Hand, cardId: CardId): Hand;
}

export class SelectCardUseCase implements SelectCard {
  execute(hand: Hand, cardId: CardId): Hand {
    return addCardToHand(hand, cardId);
  }
}
