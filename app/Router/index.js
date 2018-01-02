import React, { Component } from "react";
import { connect } from "react-redux";
import { addNavigationHelpers } from "react-navigation";

import AppNavigator from "./routes";

class AppWithNavigation extends Component {
  render() {
    return (
      <AppNavigator
        navigation={addNavigationHelpers({
          dispatch: this.props.dispatch,
          state: this.props.nav
        })}
      />
    );
  }
}

const mapStateToProps = state => ({
  nav: state.nav,
  user: state.user
});

export default (AppWithNavigationState = connect(mapStateToProps)(
  AppWithNavigation
));
