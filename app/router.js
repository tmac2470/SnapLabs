import { StackNavigator } from "react-navigation";

import HomeScreen from "./Home/Screen/index";
import JoinScreen from "./Auth/Screen/index";

import Colors from './Theme/colors';

require('./Theme/index');

const RootNavigator = StackNavigator(
  {
    Home: {
      screen: HomeScreen
    },
    Join: {
      screen: JoinScreen
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

export default RootNavigator;
