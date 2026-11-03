import { CardId } from "../domain/card";
import { addCardToHand, Hand } from "../domain/hand";

export interface AddCardToHand {
  execute(hand: Hand, cardId: CardId): Hand;
}

export class AddCardToHandUseCase implements AddCardToHand {
  execute(hand: Hand, cardId: CardId): Hand {
    return addCardToHand(hand, cardId);
  }
}
