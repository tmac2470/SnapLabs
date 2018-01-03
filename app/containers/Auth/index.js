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
    user: {}
  };

  constructor(props) {
    super(props);
    this.state.user = this.props.user;
  }

  validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email.toLowerCase());
  }

  showAlert() {
    Alert.alert("Please provide a valid email");
  }

  submit() {
    const { user } = this.state;
    const { onSaveUser, navigation } = this.props;
    if (!this.validateEmail(user.email)) {
      this.showAlert();
      return;
    }
    onSaveUser(user);
    navigation.navigate("Home");
  }

  onUpdateUserCredentials(field, value) {
    const { user } = this.state;
    user[field] = value;
    this.setState({ user });
  }

  render() {
    const { username, email } = this.state.user;
    return (
      <View style={styles.container}>
        <View style={styles.inputContainer}>
          <Input
            style={[styles.input, styles.marginTop]}
            inputStyle={styles.inputText}
            placeholder="Username"
            status={username ? "valid" : "normal"}
            autoCorrect={false}
            autoFocus={true}
            onChangeText={username =>
              this.onUpdateUserCredentials("username", username)
            }
            value={username}
          />
          <Input
            style={[styles.input, styles.marginTop]}
            inputStyle={styles.inputText}
            autoCorrect={false}
            placeholder="Email"
            status={
              email && this.validateEmail(email)
                ? "valid"
                : !email ? "normal" : "warn"
            }
            autoCapitalize="none"
            keyboardType="email-address"
            onChangeText={e =>
              this.onUpdateUserCredentials("email", e.toLowerCase())
            }
            value={email}
          />
        </View>
        <View style={styles.btnContainer}>
          <Button
            disabled={!this.validateEmail(email)}
            onPress={this.submit.bind(this)}
            style={styles.saveBtn}
          >
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
    // borderColor: Colors.primary
  },
  inputText: {
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
    user: state.currentUser
  };
};

const mapDispatchToProps = dispatch => {
  return {
    onSaveUser: user => dispatch(setUser(user))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(JoinComponent);
