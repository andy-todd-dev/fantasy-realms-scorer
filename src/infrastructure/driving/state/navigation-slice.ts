import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { removeCardFromHand } from "./hand-slice";

export type Screen = "home" | "breakdown";

type NavigationState = {
  screen: Screen;
};

const initialState: NavigationState = {
  screen: "home",
};

const navigationSlice = createSlice({
  name: "navigation",
  initialState,
  reducers: {
    screenOpened(state, action: PayloadAction<Screen>) {
      state.screen = action.payload;
    },
  },
  extraReducers: (builder) => {
    // The breakdown can't be opened with an empty hand, so removing the last card leaves it.
    builder.addCase(removeCardFromHand.fulfilled, (state, action) => {
      if (action.payload.length === 0) {
        state.screen = "home";
      }
    });
  },
});

export const { screenOpened } = navigationSlice.actions;
export const navigationReducer = navigationSlice.reducer;
