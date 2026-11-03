import { CardId } from "../domain/card";
import { calculateScore } from "../domain/score";
import { CardCatalog, ScoreHandPorts } from "./score-hand.ports";

export interface ScoreHand {
  execute(cardIds: readonly CardId[]): Promise<number>;
}

export class ScoreHandUseCase implements ScoreHand {
  private readonly cardCatalog: CardCatalog;

  constructor({ cardCatalog }: ScoreHandPorts) {
    this.cardCatalog = cardCatalog;
  }

  async execute(cardIds: readonly CardId[]): Promise<number> {
    return calculateScore(await this.cardCatalog.getByIds(cardIds));
  }
}
