import React, { Component } from "react";
import { connect } from "react-redux";
// import BleManager from "react-native-ble-manager";

import { View, Image, Platform } from "react-native";
import { Button, H5 } from "nachos-ui";

import Colors from "../../Theme/colors";

export class BluetoothConnectComponent extends Component<{}> {
  static navigationOptions = {
    title: "Connect to devices"
  };

  state = {
    scanning: false,
    peripherals: new Map(),
    appState: ""
  };

  componentDidMount() {
    // BleManager.start({ showAlert: false })
    //   .then(e => {
    //     // Success code
    //     console.log("Module initialized", e);
    //   })
    //   .catch(e => {
    //     console.log(e);
    //   });
  }

  render() {
    return (
      <View style={styles.container}>
        <H5 style={styles.textStyle}>Status : Not connected</H5>
      </View>
    );
  }
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: "white",
    padding: 10
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
  return {};
};

const mapDispatchToProps = dispatch => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(
  BluetoothConnectComponent
);
