import React, { Component } from "react";
import { StyleSheet, Text, View, Image } from "react-native";
import { Button } from "nachos-ui";

export default class Home extends Component<{}> {
  static navigationOptions = {
    title: "SnapLabs"
  };

  render() {
    const { navigate } = this.props.navigation;
    return (
      <View style={styles.container}>
        <Button onPress={() => navigate("Join")}>Join</Button>
      </View>
    );
  }
}

const styles = {
  container: {
    flex: 1,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    backgroundColor: "white"
  },
  title: {
    flex: 1,
    fontSize: 19,
    fontWeight: "bold"
  }
};
