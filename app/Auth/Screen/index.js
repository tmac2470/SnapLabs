import React, { Component } from "react";
import { View } from "react-native";

import { Input } from "nachos-ui";
import Colors from "../../Theme/colors";

export default class Join extends Component<{}> {
  static navigationOptions = {
    title: "Join"
  };

  goToHome() {
    const { goBack } = this.props.navigation;
    goBack();
  }

  state = {
    email: "",
    username: ""
  };

  render() {
    return (
      <View style={styles.container}>
        <Input
          style={styles.inputStyle}
          placeholder="Username"
          onChangeText={username => this.setState({ username })}
          value={this.state.username}
        />
        <Input
          style={[styles.inputStyle, styles.marginTop]}
          placeholder="Email"
          keyboardType="email-address"
          onChangeText={email => this.setState({ email })}
          value={this.state.email}
        />
      </View>
    );
  }
}

const styles = {
  container: {
    flex: 1,
    alignItems: "center",
    flexDirection: "column",
    justifyContent: "center",
    backgroundColor: "white",
    padding: "5%",
    marginBottom: "10%"
  },
  inputStyle: {
    borderColor: Colors.primary
  },
  marginTop: {
    marginTop: "5%"
  }
};
