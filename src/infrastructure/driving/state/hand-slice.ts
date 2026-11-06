import { createSlice } from "@reduxjs/toolkit";
import type { CardId } from "../../../domain/card";
import type { Hand } from "../../../domain/hand";
import { createAppAsyncThunk } from "./create-app-async-thunk";

type HandState = {
  cardIds: Hand;
};

const initialState: HandState = {
  cardIds: [],
};

export const addCardToHand = createAppAsyncThunk(
  "hand/addCard",
  (cardId: CardId, { extra, getState }) =>
    extra.addCardToHand.execute(getState().hand.cardIds, cardId),
);

export const removeCardFromHand = createAppAsyncThunk(
  "hand/removeCard",
  (cardId: CardId, { extra, getState }) =>
    extra.removeCardFromHand.execute(getState().hand.cardIds, cardId),
);

export const clearHand = createAppAsyncThunk("hand/clear", (_: void, { extra }) =>
  extra.clearHand.execute(),
);

const handSlice = createSlice({
  name: "hand",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(addCardToHand.fulfilled, (_, action) => ({
        cardIds: action.payload,
      }))
      .addCase(removeCardFromHand.fulfilled, (_, action) => ({
        cardIds: action.payload,
      }))
      .addCase(clearHand.fulfilled, (_, action) => ({
        cardIds: action.payload,
      }));
  },
});

export const handReducer = handSlice.reducer;
