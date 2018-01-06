import React, { Component } from "react";
import { connect } from "react-redux";

import { View, Image, Platform } from "react-native";
import { Button, H2 } from "nachos-ui";

import Colors from "../../Theme/colors";

export class InvestigationDetailsComponent extends Component<{}> {
  static navigationOptions = {
    title: "Investigation"
  };

  componentWillMount() {
    const { navigation } = this.props;
    console.log(navigation.state.params.investigation);
  }

  render() {
    return (
      <View style={styles.container}>
        <H2 style={styles.textStyle}>Details</H2>
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
  textStyle: {
    color: Colors.secondary,
    fontWeight: "600"
  }
};

const mapStateToProps = state => {
  return {};
};

const mapDispatchToProps = dispatch => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(
  InvestigationDetailsComponent
);
