import { Card } from "../domain/card";
import { CardCatalog, LoadCardsPorts } from "./load-cards.ports";

export type CardView = Pick<Card, "id" | "name" | "suit">;

function toCardView({ id, name, suit }: Card): CardView {
  return { id, name, suit };
}

export interface LoadCards {
  execute(): Promise<CardView[]>;
}

export class LoadCardsUseCase implements LoadCards {
  private readonly cardCatalog: CardCatalog;

  constructor({ cardCatalog }: LoadCardsPorts) {
    this.cardCatalog = cardCatalog;
  }

  async execute(): Promise<CardView[]> {
    const cards = await this.cardCatalog.getAll();

    return cards.map(toCardView);
  }
}
