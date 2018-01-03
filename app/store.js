// Store has been setup
// Do not modify store unless adding extra middlewares
import { createStore, applyMiddleware, compose } from "redux";

import getRootReducer from "./reducers";

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
export default function getStore() {
  return createStore(
    getRootReducer(),
    {},
    composeEnhancers()
  );
}
