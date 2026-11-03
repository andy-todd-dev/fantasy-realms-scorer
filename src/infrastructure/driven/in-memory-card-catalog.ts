import { Card } from "../../domain/card";

const cards: Card[] = [
  { id: "king", name: "King" },
  { id: "queen", name: "Queen" },
];

export class InMemoryCardCatalog {
  async getAll(): Promise<Card[]> {
    return [...cards];
  }
}
