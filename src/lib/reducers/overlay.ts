import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { AppDispatch } from "../store";

type Session = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

type State = {
  sess: Session;
  userMenuOpened: boolean;
  sidepanelOpened: boolean;
};

const slice = createSlice({
  name: "overlay",
  initialState: {
    sess: {},
    userMenuOpened: false,
    sidepanelOpened: false,
  } as State,

  reducers: {
    setUserMenu: (rs, { payload }: PayloadAction<boolean>) => {
      rs.userMenuOpened = payload;
    },

    updateSession: (rs, { payload }) => {
      rs.sess = payload;
    },

    setSidepanel: (rs, { payload }: PayloadAction<boolean>) => {
      rs.sidepanelOpened = payload;
    },
  },
});

const sa = slice.actions;

/**
 * calling useSession() from multiple components results in multiple roundtrips...
 */
export const updateUserSession = (sess: Session) => {
  return (dispatch: AppDispatch) => dispatch(sa.updateSession(sess));
};

export const showUserMenu = () => hideUserMenu(true);
export const hideUserMenu = (setTo = false) => {
  return (dispatch: AppDispatch) => dispatch(sa.setUserMenu(setTo));
};

export const showSidepanel = () => hideSidepanel(true);
export const hideSidepanel = (setTo = false) => {
  return (dispatch: AppDispatch) => dispatch(sa.setSidepanel(setTo));
};

export default slice.reducer;
