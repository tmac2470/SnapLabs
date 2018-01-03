// Import all the reducers in here
import { combineReducers } from "redux";

import { userReducer } from "./containers/Auth/reducers";
import navReducer from "./Router/reducer";

export default function getRootReducer() {
  return combineReducers({
    nav: navReducer,
    currentUser: userReducer
  });
}
