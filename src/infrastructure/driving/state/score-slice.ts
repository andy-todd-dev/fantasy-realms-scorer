import { createSlice } from "@reduxjs/toolkit";
import { createAppAsyncThunk } from "./create-app-async-thunk";

type ScoreState = {
  value: number | null;
  latestRequestId: string | null;
};

const initialState: ScoreState = {
  value: null,
  latestRequestId: null,
};

export const scoreHand = createAppAsyncThunk(
  "score/scoreHand",
  (_: void, { extra, getState }) =>
    extra.scoreHand.execute(getState().hand.cardIds),
);

const scoreSlice = createSlice({
  name: "score",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(scoreHand.pending, (state, action) => {
        state.latestRequestId = action.meta.requestId;
      })
      .addCase(scoreHand.fulfilled, (state, action) => {
        if (action.meta.requestId === state.latestRequestId) {
          state.value = action.payload;
        }
      })
      .addCase(scoreHand.rejected, (state, action) => {
        if (action.meta.requestId === state.latestRequestId) {
          state.value = null;
        }
      });
  },
});

export const scoreReducer = scoreSlice.reducer;
