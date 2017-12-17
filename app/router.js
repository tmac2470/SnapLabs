import { StackNavigator } from "react-navigation";

import HomeScreen from "./Home/Screen/index";
import JoinScreen from "./Auth/Screen/index";

const RootNavigator = StackNavigator({
  Home: {
    screen: HomeScreen,
    navigationOptions: {
      headerBackTitle: null
    }
  },
  Join: {
    screen: JoinScreen,
    navigationOptions: {
      headerBackTitle: null
    }
  }
});

export default RootNavigator;
