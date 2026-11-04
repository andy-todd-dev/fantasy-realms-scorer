import { Card, CardAbility } from "../domain/card";
import { CardCatalog, LoadCardsPorts } from "./load-cards.ports";

type CardAbilityView = Pick<CardAbility, "text">;

export type CardView = Omit<Card, "bonus" | "penalty"> & {
  readonly bonus?: CardAbilityView;
  readonly penalty?: CardAbilityView;
};

function toCardView({ bonus, penalty, ...card }: Card): CardView {
  return {
    ...card,
    ...(bonus && { bonus: { text: bonus.text } }),
    ...(penalty && { penalty: { text: penalty.text } }),
  };
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
