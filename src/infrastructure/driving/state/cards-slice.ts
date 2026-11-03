import { createSlice } from "@reduxjs/toolkit";
import type { Card } from "../../../domain/card";
import { createAppAsyncThunk } from "./create-app-async-thunk";

type CardsState = {
  items: Card[];
  status: "idle" | "loading" | "loaded" | "failed";
};

const initialState: CardsState = {
  items: [],
  status: "idle",
};

export const loadCards = createAppAsyncThunk(
  "cards/load",
  (_: void, { extra }) => extra.loadCards.execute(),
);

const cardsSlice = createSlice({
  name: "cards",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadCards.pending, (state) => {
        state.status = "loading";
      })
      .addCase(loadCards.fulfilled, (state, action) => {
        state.items = action.payload;
        state.status = "loaded";
      })
      .addCase(loadCards.rejected, (state) => {
        state.status = "failed";
      });
  },
});

export const cardsReducer = cardsSlice.reducer;
