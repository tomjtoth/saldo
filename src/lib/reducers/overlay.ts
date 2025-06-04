import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { AppDispatch } from "../store";

type State = {
  userOptsOpened: boolean;
  sidepanelOpened: boolean;
};

const slice = createSlice({
  name: "overlay",
  initialState: {
    userOptsOpened: false,
    sidepanelOpened: false,
  } as State,

  reducers: {
    setUserMenu: (rs, { payload }: PayloadAction<boolean>) => {
      rs.userOptsOpened = payload;
    },

    setSidepanel: (rs, { payload }: PayloadAction<boolean>) => {
      rs.sidepanelOpened = payload;
    },
  },
});

const sa = slice.actions;

export const showUserMenu = () => hideUserMenu(true);
export const hideUserMenu = (setTo = false) => {
  return (dispatch: AppDispatch) => dispatch(sa.setUserMenu(setTo));
};

export const showSidepanel = () => hideSidepanel(true);
export const hideSidepanel = (setTo = false) => {
  return (dispatch: AppDispatch) => dispatch(sa.setSidepanel(setTo));
};

export default slice.reducer;
