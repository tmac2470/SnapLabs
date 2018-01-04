import React, { Component } from "react";
import { StackNavigator } from "react-navigation";

import HomeScreen from "../containers/Home";
import JoinScreen from "../containers/Auth";
import SplashScreen from "../containers/Splash";

import Colors from "../Theme/colors";

const AppNavigator = StackNavigator(
  {
    SplashScreen: { screen: SplashScreen },
    Join: {
      screen: JoinScreen
    },
    Home: {
      screen: HomeScreen
    }
  },
  {
    headerMode: "screen",
    navigationOptions: {
      headerBackTitle: null,
      headerTintColor: "white",
      headerStyle: {
        backgroundColor: Colors.primary,
        borderBottomColor: Colors.primary
      }
    }
  }
);

export default AppNavigator;
