import { CardId } from "../domain/card";
import { Hand, removeCardFromHand } from "../domain/hand";

export interface RemoveCardFromHand {
  execute(hand: Hand, cardId: CardId): Hand;
}

export class RemoveCardFromHandUseCase implements RemoveCardFromHand {
  execute(hand: Hand, cardId: CardId): Hand {
    return removeCardFromHand(hand, cardId);
  }
}
