import { asFunction, createContainer, InjectionMode } from "awilix";
import { LoadCards, LoadCardsUseCase } from "./application/load-cards.usecase";
import { SelectCard, SelectCardUseCase } from "./application/select-card.usecase";
import { UseCases } from "./application/use-cases";
import { InMemoryCardCatalog } from "./infrastructure/driven/in-memory-card-catalog";

type Cradle = {
  cardCatalog: InMemoryCardCatalog;
  loadCards: LoadCards;
  selectCard: SelectCard;
};

export function createUseCases(): UseCases {
  const container = createContainer<Cradle>({
    injectionMode: InjectionMode.PROXY,
    strict: true,
  });

  container.register({
    cardCatalog: asFunction(() => new InMemoryCardCatalog()).singleton(),
    loadCards: asFunction((deps: Cradle) => new LoadCardsUseCase(deps)).singleton(),
    selectCard: asFunction(() => new SelectCardUseCase()).singleton(),
  });

  const { loadCards, selectCard } = container.cradle;

  return { loadCards, selectCard };
}
