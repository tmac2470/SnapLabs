import React, { Component } from "react";
import { StyleSheet, Text, View, Image } from "react-native";

export default class Join extends Component<{}> {
  static navigationOptions = {
    title: 'Join'
  };

  goToHome() {
    const { navigate } = this.props.navigation;
    navigate('Home');
  }

  render() {
    return (
      <View>
      </View>
    );
  }
}

const styles = {
};
