import { combineReducers } from "redux";

import { SET_USER } from "./constants";

const initialState = {};

function userReducer(user = initialState, action) {
  switch (action.type) {
    case SET_USER:
      user = action.user;
      return user;

    default:
      return user;
  }
}

export default combineReducers({
  user: userReducer
});
