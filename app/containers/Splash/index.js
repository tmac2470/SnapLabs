import React, { Component } from "react";
import { connect } from "react-redux";
import { NavigationActions } from "react-navigation";

import { unsetUser } from "../Auth/actions";

import { View, Image, Platform } from "react-native";
import { Button, H2 } from "nachos-ui";
import Spinner from "react-native-spinkit";

import Colors from "../../Theme/colors";

export class SplashComponent extends Component<{}> {
  static navigationOptions = {
    header: null
  };

  componentDidMount() {
    const { isLoggedIn } = this.props;

    if (isLoggedIn) {
      this._navigateTo("Home");
    } else {
      this._navigateTo("Join");
    }
  }

  // To set the new page as the first page instead of leaving splashscreen as the first one.
  _navigateTo(routeName) {
    setTimeout(() => {
      const actionToDispatch = NavigationActions.reset({
        index: 0,
        actions: [NavigationActions.navigate({ routeName: routeName })]
      });
      this.props.navigation.dispatch(actionToDispatch);
    }, 500);
  }

  render() {
    const iOSpic = require("../../../data/images/ti-sensor-tag.jpeg");
    const androidPic = require("../../../data/images/ti-sensor.png");

    const pic = Platform.OS !== "ios" ? iOSpic : androidPic;

    return (
      <View style={styles.container}>
        <Image source={pic} style={styles.image} />
        <H2 style={styles.textStyle}>Create. Investigate. Share.</H2>
        <View style={styles.spinnerContainer}>
          <Spinner type="FadingCircleAlt" color={Colors.primary} />
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
    padding: 15
  },
  image: {
    width: "100%",
    height: "60%"
  },
  spinnerContainer: {
    padding: 10
  },
  textStyle: {
    color: Colors.secondary,
    fontWeight: "600"
  }
};

const mapStateToProps = state => {
  return {
    isLoggedIn: state.currentUser.isLoggedIn
  };
};

const mapDispatchToProps = dispatch => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(SplashComponent);
