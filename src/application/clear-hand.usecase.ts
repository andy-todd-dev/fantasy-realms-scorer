import { emptyHand, Hand } from "../domain/hand";

export interface ClearHand {
  execute(): Hand;
}

export class ClearHandUseCase implements ClearHand {
  execute(): Hand {
    return emptyHand();
  }
}
