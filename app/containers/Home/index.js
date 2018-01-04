import React, { Component } from "react";
import { connect } from "react-redux";

import { unsetUser } from "../Auth/actions";

import { View, Image, Platform } from "react-native";
import { Button, H2 } from "nachos-ui";

import Colors from "../../Theme/colors";

export class HomeComponent extends Component<{}> {
  static navigationOptions = ({ navigation }) => {
    const { params = {} } = navigation.state;

    return {
      title: "SnapLabs",
      headerLeft: null,
      ...navigation.state.params
    };
  };

  componentWillMount() {
    const { navigation } = this.props;

    const params = {
      headerRight: (
        <View style={styles.logoutBtnContainer}>
          <Button
            uppercase={false}
            type="danger"
            onPress={() => this.logout(this.props)}
            style={styles.logoutButton}
          >
            Logout
          </Button>
        </View>
      )
    };
    navigation.setParams(params);
  }

  logout(props) {
    const { onLogoutUser, user, navigation } = props;
    onLogoutUser(user);
    navigation.navigate("Join");
  }

  render() {
    const { navigation, isLoggedIn } = this.props;

    const iOSpic = require("../../../data/images/ti-sensor-tag.jpeg");
    const androidPic = require("../../../data/images/ti-sensor.png");

    const pic = Platform.OS === "ios" ? iOSpic : androidPic;

    return (
      <View style={styles.container}>
        <Image source={pic} style={styles.image} />
        <H2 style={styles.textStyle}>Create. Investigate. Share.</H2>
        <View style={styles.btnContainer}>
          {!isLoggedIn ? (
            <Button
              type="success"
              uppercase={false}
              onPress={() => navigation.navigate("Join")}
              style={styles.button}
            >
              Join
            </Button>
          ) : (
            <View>
              <Button
                type="success"
                uppercase={false}
                onPress={() => navigation.navigate("Join")}
                style={styles.button}
              >
                Select a local investigation
              </Button>

              <Button
                type="success"
                uppercase={false}
                onPress={() => navigation.navigate("Join")}
                style={styles.button}
              >
                Download a new investigation
              </Button>

              <Button
                type="success"
                onPress={() => navigation.navigate("Join")}
                uppercase={false}
                style={styles.button}
              >
                File handling
              </Button>
            </View>
          )}
        </View>
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
    backgroundColor: "white"
  },
  image: {
    width: "100%",
    height: "60%"
  },
  button: {
    minWidth: "100%",
    maxHeight: 35
  },
  logoutButton: {
    maxHeight: 25
  },
  logoutBtnContainer: {
    margin: 5,
    marginTop: 10
  },
  btnContainer: {
    margin: 20,
    marginTop: 20,
    flex: 1
  },
  textStyle: {
    color: Colors.secondary,
    fontWeight: "600"
  }
};

const mapStateToProps = state => {
  return {
    user: state.currentUser,
    isLoggedIn: state.currentUser.isLoggedIn
  };
};

const mapDispatchToProps = dispatch => {
  return {
    onLogoutUser: user => dispatch(unsetUser(user))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(HomeComponent);
