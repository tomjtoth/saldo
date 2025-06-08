import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { AppDispatch } from "../store";

type State = {
  sidepanelOpened: boolean;
};

const slice = createSlice({
  name: "overlay",
  initialState: {
    sidepanelOpened: false,
  } as State,

  reducers: {
    setSidepanel: (rs, { payload }: PayloadAction<boolean>) => {
      rs.sidepanelOpened = payload;
    },
  },
});

const sa = slice.actions;

export const showSidepanel = () => hideSidepanel(true);
export const hideSidepanel = (setTo = false) => {
  return (dispatch: AppDispatch) => dispatch(sa.setSidepanel(setTo));
};

export default slice.reducer;
