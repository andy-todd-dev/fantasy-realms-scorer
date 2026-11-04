import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type Screen = "hand" | "pickCards";

type NavigationState = {
  screen: Screen;
};

const initialState: NavigationState = {
  screen: "hand",
};

const navigationSlice = createSlice({
  name: "navigation",
  initialState,
  reducers: {
    screenOpened(state, action: PayloadAction<Screen>) {
      state.screen = action.payload;
    },
  },
});

export const { screenOpened } = navigationSlice.actions;
export const navigationReducer = navigationSlice.reducer;
