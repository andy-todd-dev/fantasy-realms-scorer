import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { UseCases } from "../../../application/use-cases";
import { cardDetailsReducer } from "./card-details-slice";
import { cardsReducer } from "./cards-slice";
import { handReducer } from "./hand-slice";

const reducer = combineReducers({
  cardDetails: cardDetailsReducer,
  cards: cardsReducer,
  hand: handReducer,
});

export function createAppStore(useCases: UseCases) {
  return configureStore({
    reducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({ thunk: { extraArgument: useCases } }),
  });
}

export type AppStore = ReturnType<typeof createAppStore>;
export type RootState = ReturnType<typeof reducer>;
export type AppDispatch = AppStore["dispatch"];
