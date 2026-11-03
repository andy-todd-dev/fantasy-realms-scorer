import { createAsyncThunk } from "@reduxjs/toolkit";
import { UseCases } from "../../../application/use-cases";
import type { AppDispatch, RootState } from "./store";

export const createAppAsyncThunk = createAsyncThunk.withTypes<{
  state: RootState;
  dispatch: AppDispatch;
  extra: UseCases;
}>();
