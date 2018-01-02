// Store has been setup
// Do not modify store unless adding extra middlewares
import { createStore, applyMiddleware } from "redux";

import getRootReducer from "./reducers";

export default function getStore() {
  return createStore(getRootReducer());
}
