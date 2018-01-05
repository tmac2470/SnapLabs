import React, { Component } from "react";
import { connect } from "react-redux";

import { View, Image, Platform } from "react-native";
import { Button, H2 } from "nachos-ui";

import Colors from "../../../Theme/colors";
import { fetchInvestigations } from "./actions";

export class DownloadInvestigationsComponent extends Component<{}> {
  static navigationOptions = {
    title: "Download Investigations"
  };

  componentWillMount() {
    const { onFetchInvestigations } = this.props;
    onFetchInvestigations();
  }

  render() {
    return (
      <View style={styles.container}>
        <H2 style={styles.textStyle}>Create. Investigate. Share.</H2>
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
  return {
    onFetchInvestigations: _ => dispatch(fetchInvestigations())
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(
  DownloadInvestigationsComponent
);
