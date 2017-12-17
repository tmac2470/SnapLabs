import { StackNavigator } from "react-navigation";

import HomeScreen from './Home/Screen/index';
import JoinScreen from './Auth/Screen/index'

const RootNavigator = StackNavigator({
  Home: {
    screen: HomeScreen
  },
  Join: {
    screen: HomeScreen
  }
});

export default RootNavigator;
