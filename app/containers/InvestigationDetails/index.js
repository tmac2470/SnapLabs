import React, { Component } from "react";
import { connect } from "react-redux";

import { View, Image, Platform } from "react-native";
import { Button, H2, H5 } from "nachos-ui";

import Colors from "../../Theme/colors";

export class InvestigationDetailsComponent extends Component<{}> {
  static navigationOptions = {
    title: "Investigation Details"
  };

  render() {
    const { navigation } = this.props;
    const investigation = navigation.state.params.investigation;
    return (
      <View style={styles.container}>
        <H2 style={[styles.text, styles.textBold]}>{investigation.labTitle}</H2>

        <View style={styles.infoBox}>
          <H5 style={[styles.text, styles.textBold]}>
            Sample Interval: {investigation.sampleInterval}ms
          </H5>
          <H5 style={[styles.text, styles.textBold]}>Status: Not connected!</H5>

          <H5 style={[styles.text, styles.textBold]}>
            No sensors enabled to run the investigation!
          </H5>
          <H5 style={styles.text}>
            Please recheck if at least one parameter (eg IR) has been enabled
            for the chosen sensor (eg Temperature).
          </H5>
        </View>
      </View>
    );
  }
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: "white",
    paddingRight: 10,
    paddingLeft: 10
  },
  infoBox: {
    padding: 0
  },
  text: {
    color: Colors.secondary
  },
  textBold: {
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
