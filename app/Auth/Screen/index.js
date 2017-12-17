import React, { Component } from "react";
import { StyleSheet, Text, View, Button } from "react-native";

export default class Join extends Component<{}> {
  static navigationOptions = {
    title: "Join"
  };

  goToHome() {
    const { goBack } = this.props.navigation;
    goBack();
  }

  render() {
    return (
      <View>
        <Button onPress={this.goToHome.bind(this)} title="Home" />
      </View>
    );
  }
}

const styles = {};
