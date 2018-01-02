import React, { Component } from "react";
import { Provider } from "react-redux";

require("./Theme/index");

import getStore from "./store";
import AppWithNavigationState from "./Router";

const store = getStore();

export default class App extends Component<{}> {
  render() {
    return (
      <Provider store={store}>
        <AppWithNavigationState />
      </Provider>
    );
  }
}
