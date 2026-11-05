import { createSlice, PayloadAction } from "@reduxjs/toolkit";

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
});

export const { screenOpened } = navigationSlice.actions;
export const navigationReducer = navigationSlice.reducer;
