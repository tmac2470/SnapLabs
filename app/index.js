import React, { Component } from "react";
import Router from "./Router";

require('./Theme/index');

export default class App extends Component<{}> {
  render() {
    return (
      <Router />
    );
  }
}
