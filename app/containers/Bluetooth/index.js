import React, { Component } from "react";
import { connect } from "react-redux";
import BleManager from "react-native-ble-manager";

import { View, FlatList, Platform, PermissionsAndroid } from "react-native";
import { Button, H5, H4 } from "nachos-ui";
import Spinner from "react-native-spinkit";

import Colors from "../../Theme/colors";

export class BluetoothConnectComponent extends Component<{}> {
  static navigationOptions = {
    title: "Connect to devices"
  };

  state = {
    isScanning: false,
    peripherals: [],
    appState: ""
  };

  // Start with the Blemanager start method to initialise bluetooth
  componentDidMount() {
    BleManager.start({ showAlert: false })
      .then(e => {
        // Start scan once initialisation complete
        this.startScan();
      })
      .catch(e => {
        console.log(e);
      });

    if (Platform.OS === "android" && Platform.Version >= 23) {
      PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION
      ).then(result => {
        if (result) {
          console.log("Permission is OK");
        } else {
          PermissionsAndroid.requestPermission(
            PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION
          ).then(result => {
            if (result) {
              console.log("User accept");
            } else {
              console.log("User refuse");
            }
          });
        }
      });
    }
  }

  startScan() {
    if (!this.state.isScanning) {
      BleManager.scan([], 10, false)
        .then(_ => {
          this.setState({ isScanning: true });
        })
        .catch(e => {
          console.log("error getting peripherals", e);
        });
    }

    setTimeout(() => {
      BleManager.stopScan()
        .then(e => {
          // Success code
          this.setState({ isScanning: false });

          // Once the scan is stopped get the discovered peripherals
          BleManager.getDiscoveredPeripherals([])
            .then(peripherals => {
              // Create a set of unique peripherals
              peripherals = [...new Set(peripherals, this.state.peripherals)];
              this.setState({
                peripherals
              });
            })
            .catch(e => {
              console.log("error discovering", e);
            });
        })
        .catch(e => {
          console.log("error stopping", e);
        });
    }, 5000);
  }

  _keyExtractor = (item, index) => item.id;

  _renderDeviceDetails = ({ item }) => {
    return (
      <View>
        <H4 style={styles.text}>{item.name}</H4>
      </View>
    );
  };

  render() {
    const { isScanning, peripherals } = this.state;
    return (
      <View style={styles.container}>
        <H5 style={styles.text}>Status : Not connected</H5>
        <View style={styles.spinnerContainer}>
          <Spinner
            type="FadingCircleAlt"
            isVisible={!!isScanning}
            color={Colors.primary}
          />
        </View>
        <FlatList
          style={styles.list}
          onRefresh={() => this.startScan}
          data={peripherals}
          refreshing={false}
          extraData={this.state}
          keyExtractor={this._keyExtractor}
          renderItem={this._renderDeviceDetails}
        />
        <View style={styles.footerButtonContainer}>
          <Button
            disabled={!!isScanning}
            uppercase={false}
            onPress={() => this.startScan()}
            style={styles.footerButton}
          >
            Scan
          </Button>
        </View>
      </View>
    );
  }
}

const styles = {
  container: {
    flexDirection: "column",
    flex: 1,
    position: "relative"
  },
  list: {
    flex: 4
  },
  spinnerContainer: {
    padding: 10,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  },
  text: {
    color: Colors.secondary,
    fontWeight: "600",
    padding: 10
  },
  footerButtonContainer: {
    flex: 1,
    maxHeight: 60,
    padding: 10
  },
  footerButton: {
    width: "100%",
    borderRadius: 0,
    maxHeight: 40
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
