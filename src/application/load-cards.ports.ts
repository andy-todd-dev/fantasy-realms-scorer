import { Card } from "../domain/card";

export interface CardCatalog {
  getAll(): Promise<Card[]>;
}

export interface LoadCardsPorts {
  cardCatalog: CardCatalog;
}
