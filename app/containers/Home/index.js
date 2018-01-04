import React, { Component } from "react";
import { connect } from "react-redux";
import { NavigationActions } from "react-navigation";

import { unsetUser } from "../Auth/actions";

import { View, Image, Platform } from "react-native";
import { Button, H2 } from "nachos-ui";

import Colors from "../../Theme/colors";

export class HomeComponent extends Component<{}> {
  static navigationOptions = {
    headerLeft: null,
    title: "Home"
  };

  logout(props) {
    const { onLogoutUser, user, navigation } = props;
    onLogoutUser(user);
    this._navigateTo("Join");
  }

  _navigateTo(routeName) {
    const actionToDispatch = NavigationActions.reset({
      index: 0,
      actions: [NavigationActions.navigate({ routeName: routeName })]
    });
    this.props.navigation.dispatch(actionToDispatch);
  }

  render() {
    const { navigation } = this.props;

    const iOSpic = require("../../../data/images/ti-sensor-tag.jpeg");
    const androidPic = require("../../../data/images/ti-sensor.png");

    const pic = Platform.OS === "ios" ? iOSpic : androidPic;

    return (
      <View style={styles.container}>
        <View style={styles.logoutBtnContainer}>
          <Button
            iconColor={Colors.danger}
            iconName="ios-power"
            onPress={() => this.logout(this.props)}
            style={styles.logoutButton}
          />
        </View>

        <Image source={pic} style={styles.image} />

        <H2 style={styles.textStyle}>Create. Investigate. Share.</H2>

        <View style={styles.btnContainer}>
          <Button
            type="success"
            uppercase={false}
            onPress={() => this._navigateTo("Join")}
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
    position: "relative"
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
    backgroundColor: "transparent"
  },
  logoutBtnContainer: {
    position: "absolute",
    right: 0,
    top: 0,
    zIndex: 1
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
    user: state.currentUser
  };
};

const mapDispatchToProps = dispatch => {
  return {
    onLogoutUser: user => dispatch(unsetUser(user))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(HomeComponent);
