import { createSlice } from "@reduxjs/toolkit";
import { CardId } from "../../../domain/card";
import { Hand } from "../../../domain/hand";
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

const handSlice = createSlice({
  name: "hand",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(addCardToHand.fulfilled, (_, action) => ({
      cardIds: action.payload,
    }));
  },
});

export const handReducer = handSlice.reducer;
