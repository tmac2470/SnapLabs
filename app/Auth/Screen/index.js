import React, { Component } from "react";
import { View, Alert } from "react-native";

import { Input, Button } from "nachos-ui";
import Colors from "../../Theme/colors";

export default class Join extends Component<{}> {
  static navigationOptions = {
    title: "Join"
  };

  state = {
    email: "",
    username: ""
  };

  validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email.toLowerCase());
  }

  showAlert() {
    Alert.alert("Please provide a valid email");
  }

  submit() {
    const { email, username } = this.state;
    if (!this.validateEmail(email)) {
      this.showAlert();
      return;
    }
    console.log(email, username);
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.inputContainer}>
          <Input
            style={[styles.input, styles.marginTop]}
            inputStyle={styles.inputText}
            placeholder="Username"
            autoCorrect={false}
            onChangeText={username => this.setState({ username })}
            value={this.state.username}
          />
          <Input
            style={[styles.input, styles.marginTop]}
            inputStyle={styles.inputText}
            autoCorrect={false}
            placeholder="Email"
            keyboardType="email-address"
            onChangeText={email => this.setState({ email })}
            value={this.state.email}
          />
        </View>
        <View style={styles.btnContainer}>
          <Button onPress={this.submit.bind(this)} style={styles.saveBtn}>
            Save
          </Button>
        </View>
      </View>
    );
  }
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: "white",
    paddingLeft: 15,
    paddingRight: 15
  },
  inputContainer: {
    flex: 8,
    justifyContent: 'center',
  },
  input: {
    borderColor: Colors.primary
  },
  inputText: {
    color: Colors.primary,
    fontSize: 18
  },
  marginTop: {
    marginTop: 15
  },
  saveBtn: {
    minWidth: "100%"
  },
  btnContainer: {
    flex: 2
  }
};
