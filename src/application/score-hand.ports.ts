import { Card, CardId } from "../domain/card";

export interface CardCatalog {
  getByIds(cardIds: readonly CardId[]): Promise<Card[]>;
}

export interface ScoreHandPorts {
  cardCatalog: CardCatalog;
}
