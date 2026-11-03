import { Card } from "../domain/card";
import { CardCatalog, LoadCardsPorts } from "./load-cards.ports";

export interface LoadCards {
  execute(): Promise<Card[]>;
}

export class LoadCardsUseCase implements LoadCards {
  private readonly cardCatalog: CardCatalog;

  constructor({ cardCatalog }: LoadCardsPorts) {
    this.cardCatalog = cardCatalog;
  }

  execute(): Promise<Card[]> {
    return this.cardCatalog.getAll();
  }
}
