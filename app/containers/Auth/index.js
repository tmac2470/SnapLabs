import React, { Component } from "react";
import { View, Alert } from "react-native";
import { connect } from "react-redux";

import { Input, Button } from "nachos-ui";
import Colors from "../../Theme/colors";
import { setUser } from "./actions";

export class JoinComponent extends Component<{}> {
  static navigationOptions = {
    title: "Join"
  };

  state = {
    user: {
      email: "",
      username: ""
    }
  };

  validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email.toLowerCase());
  }

  showAlert() {
    Alert.alert("Please provide a valid email");
  }

  submit() {
    const { user } = this.state;
    const { onSaveUser } = this.props;
    if (!this.validateEmail(user.email)) {
      this.showAlert();
      return;
    }
    onSaveUser(user);
  }

  onUpdateUserCredentials(value) {
    const state = this.state;
    this.setState(prevState => ({
      user: {
        username: value.username ? value.username : prevState.user.username,
        email: value.email ? value.email : prevState.user.email
      }
    }));
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
            onChangeText={username =>
              this.onUpdateUserCredentials({ username })
            }
            value={this.state.user.username}
          />
          <Input
            style={[styles.input, styles.marginTop]}
            inputStyle={styles.inputText}
            autoCorrect={false}
            placeholder="Email"
            keyboardType="email-address"
            onChangeText={email => this.onUpdateUserCredentials({ email })}
            value={this.state.user.email}
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
    justifyContent: "center"
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

const mapStateToProps = state => {
  return {
    user: state
  };
};

const mapDispatchToProps = dispatch => {
  return {
    onSaveUser: user => {
      dispatch(setUser(user));
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(JoinComponent);
