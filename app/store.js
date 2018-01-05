// Store has been setup
// Do not modify store unless adding extra middlewares
import { createStore, compose, applyMiddleware } from "redux";
import thunk from "redux-thunk";
import getRootReducer from "./reducers";

const composeEnhancers =
  typeof window === 'object' &&
  window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ ?
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
      // Specify extension’s options like name, actionsBlacklist, actionsCreators, serialize...
    }) : compose;

const enhancer = composeEnhancers(
  applyMiddleware(thunk)
);

export default function getStore() {
  return createStore(
    getRootReducer(),
    {},
    enhancer
  );
}
