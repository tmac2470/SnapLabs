import React, { Component } from "react";
import Router from "./router";

import { View } from "react-native";

export default class App extends Component<{}> {
  render() {
    return (
      <View style={styles.container}>
        <Router />
      </View>
    );
  }
}

const styles = {
  container: {
    flex: 1,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center"
  }
};
