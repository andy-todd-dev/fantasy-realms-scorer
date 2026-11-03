import { asFunction, createContainer, InjectionMode } from "awilix";
import {
  AddCardToHand,
  AddCardToHandUseCase,
} from "./application/add-card-to-hand.usecase";
import { LoadCards, LoadCardsUseCase } from "./application/load-cards.usecase";
import { ScoreHand, ScoreHandUseCase } from "./application/score-hand.usecase";
import { UseCases } from "./application/use-cases";
import { InMemoryCardCatalog } from "./infrastructure/driven/in-memory-card-catalog";

type Cradle = {
  addCardToHand: AddCardToHand;
  cardCatalog: InMemoryCardCatalog;
  loadCards: LoadCards;
  scoreHand: ScoreHand;
};

export function createUseCases(): UseCases {
  const container = createContainer<Cradle>({
    injectionMode: InjectionMode.PROXY,
    strict: true,
  });

  container.register({
    addCardToHand: asFunction(() => new AddCardToHandUseCase()).singleton(),
    cardCatalog: asFunction(() => new InMemoryCardCatalog()).singleton(),
    loadCards: asFunction((deps: Cradle) => new LoadCardsUseCase(deps)).singleton(),
    scoreHand: asFunction((deps: Cradle) => new ScoreHandUseCase(deps)).singleton(),
  });

  const { addCardToHand, loadCards, scoreHand } = container.cradle;

  return { addCardToHand, loadCards, scoreHand };
}
