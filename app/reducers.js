// Import all the reducers in here
import { combineReducers } from "redux";

import { userReducer } from "./containers/Auth/reducers";
import { downloadInvestigationsReducer } from "./containers/Investigations/Download/reducers";
import navReducer from "./Router/reducer";

export default function getRootReducer() {
  return combineReducers({
    nav: navReducer,
    currentUser: userReducer,
    downloadInvestigations: downloadInvestigationsReducer
  });
}
