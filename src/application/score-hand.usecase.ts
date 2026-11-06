import { CardId } from "../domain/card";
import { HandScore, scoreHand } from "../domain/score";
import { CardCatalog, ScoreHandPorts } from "./score-hand.ports";

export interface ScoreHand {
  execute(cardIds: readonly CardId[]): Promise<HandScore>;
}

export class ScoreHandUseCase implements ScoreHand {
  private readonly cardCatalog: CardCatalog;

  constructor({ cardCatalog }: ScoreHandPorts) {
    this.cardCatalog = cardCatalog;
  }

  async execute(cardIds: readonly CardId[]): Promise<HandScore> {
    return scoreHand(await this.cardCatalog.getByIds(cardIds));
  }
}
