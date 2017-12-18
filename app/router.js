import { StackNavigator } from "react-navigation";

import HomeScreen from "./Home/Screen/index";
import JoinScreen from "./Auth/Screen/index";

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
        backgroundColor: "#1CA7FC",
        borderBottomColor: "#1CA7FC"
      }
    }
  }
);

export default RootNavigator;
