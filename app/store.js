// Store has been setup
// Do not modify store unless adding extra middlewares
import { createStore, compose, applyMiddleware } from "redux";
import thunk from "redux-thunk";
import { persistStore, persistReducer } from 'redux-persist';
import getRootReducer from "./reducers";
import storage from 'redux-persist/lib/storage';
import autoMergeLevel2 from 'redux-persist/lib/stateReconciler/autoMergeLevel2';

const composeEnhancers =
  typeof window === 'object' &&
  window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ ?
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
      // Specify extension’s options like name, actionsBlacklist, actionsCreators, serialize...
    }) : compose;

const enhancer = composeEnhancers(
  applyMiddleware(thunk)
);

const persistConfig = {
  key: 'primary',
  storage,
  whitelist: ['localInvestigations', 'currentUser'],
  stateReconciler: autoMergeLevel2
 };

const persistedReducer = persistReducer(persistConfig, getRootReducer());

export default function getStore() {
  const store =  createStore(
    persistedReducer,
    {},
    enhancer
  );
  const persistor = persistStore(store);
  return { store, persistor };
}
