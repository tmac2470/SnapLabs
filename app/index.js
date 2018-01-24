import React, { Component } from "react";
import { Provider } from "react-redux";
import { PersistGate } from 'redux-persist/lib/integration/react'

require("./Theme/index");

import getStore from "./store";
import AppWithNavigationState from "./Router";

const { store, persistor } = getStore();

export default class App extends Component<{}> {
  render() {
    return (
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <AppWithNavigationState />
        </PersistGate>
      </Provider>
    );
  }
}
