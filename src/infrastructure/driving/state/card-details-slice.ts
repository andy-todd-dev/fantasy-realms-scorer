import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { CardId } from "../../../domain/card";

type CardDetailsState = {
  openCardId: CardId | null;
};

const initialState: CardDetailsState = {
  openCardId: null,
};

const cardDetailsSlice = createSlice({
  name: "cardDetails",
  initialState,
  reducers: {
    cardDetailsToggled(state, action: PayloadAction<CardId>) {
      state.openCardId =
        state.openCardId === action.payload ? null : action.payload;
    },
  },
});

export const { cardDetailsToggled } = cardDetailsSlice.actions;
export const cardDetailsReducer = cardDetailsSlice.reducer;
