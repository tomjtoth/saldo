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

export const showUserMenu = () => {
  return (dispatch: AppDispatch) => dispatch(sa.setUserMenu(true));
};

export const hideUserMenu = () => {
  return (dispatch: AppDispatch) => dispatch(sa.setUserMenu(false));
};

export const showSidepanel = () => {
  return (dispatch: AppDispatch) => dispatch(sa.setSidepanel(true));
};

export const hideSidepanel = () => (dispatch: AppDispatch) => {
  return dispatch(sa.setSidepanel(false));
};

export default slice.reducer;
