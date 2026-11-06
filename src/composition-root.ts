import { asFunction, createContainer, InjectionMode } from "awilix";
import {
  AddCardToHand,
  AddCardToHandUseCase,
} from "./application/add-card-to-hand.usecase";
import { ClearHand, ClearHandUseCase } from "./application/clear-hand.usecase";
import { LoadCards, LoadCardsUseCase } from "./application/load-cards.usecase";
import {
  RemoveCardFromHand,
  RemoveCardFromHandUseCase,
} from "./application/remove-card-from-hand.usecase";
import { ScoreHand, ScoreHandUseCase } from "./application/score-hand.usecase";
import { UseCases } from "./application/use-cases";
import { InMemoryCardCatalog } from "./infrastructure/driven/in-memory-card-catalog";

type Cradle = {
  addCardToHand: AddCardToHand;
  cardCatalog: InMemoryCardCatalog;
  clearHand: ClearHand;
  loadCards: LoadCards;
  removeCardFromHand: RemoveCardFromHand;
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
    clearHand: asFunction(() => new ClearHandUseCase()).singleton(),
    loadCards: asFunction(
      (deps: Cradle) => new LoadCardsUseCase(deps),
    ).singleton(),
    removeCardFromHand: asFunction(
      () => new RemoveCardFromHandUseCase(),
    ).singleton(),
    scoreHand: asFunction(
      (deps: Cradle) => new ScoreHandUseCase(deps),
    ).singleton(),
  });

  const { addCardToHand, clearHand, loadCards, removeCardFromHand, scoreHand } =
    container.cradle;

  return { addCardToHand, clearHand, loadCards, removeCardFromHand, scoreHand };
}
