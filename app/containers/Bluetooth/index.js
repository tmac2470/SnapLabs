import React, { Component } from "react";
import { connect } from "react-redux";
import BleManager from "react-native-ble-manager";

import {
  View,
  TouchableOpacity,
  FlatList,
  Platform,
  PermissionsAndroid
} from "react-native";
import { Button, H5, H4, Badge } from "nachos-ui";
import Spinner from "react-native-spinkit";

import Colors from "../../Theme/colors";

import { bluetoothStart, deviceConnect, deviceDisconnect } from "./actions.js";
import { networkError } from "../../Metastores/actions";
import * as SERVICES from "./services";

export class BluetoothConnectComponent extends Component<{}> {
  static navigationOptions = {
    title: "Connect to devices"
  };

  state = {
    isBusy: false,
    peripherals: [],
    appState: ""
  };

  // Start with the Blemanager start method to initialise bluetooth
  componentDidMount() {
    const {
      connectedDevices,
      bluetoothStarted,
      onBluetoothStarted,
      onNetworkError
    } = this.props;
    BleManager.checkState();

    if (!bluetoothStarted) {
      // Call .start only once
      BleManager.start({ showAlert: false })
        .then(e => {
          // Start scan once initialisation complete
          this.startScan();
          onBluetoothStarted();
        })
        .catch(error => {
          onNetworkError(error.message);
        });
    } else {
      this.startScan();
    }

    if (Platform.OS === "android" && Platform.Version >= 23) {
      PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION
      ).then(result => {
        if (!result) {
          PermissionsAndroid.requestPermission(
            PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION
          ).then(result => {
            if (!result) {
              onNetworkError("User refused bluetooth");
            }
          });
        }
      });
    }
  }

  startScan() {
    const { onNetworkError } = this.props;
    if (!this.state.isBusy) {
      BleManager.scan([], 10, false)
        .then(_ => {
          this.setState({ isBusy: true });
        })
        .catch(error => {
          onNetworkError(error.message);
        });
    }

    setTimeout(() => {
      BleManager.stopScan()
        .then(e => {
          // Success code
          this.setState({ isBusy: false });

          // Once the scan is stopped get the discovered peripherals
          BleManager.getDiscoveredPeripherals([])
            .then(peripherals => {
              this.setState({
                peripherals
              });
            })
            .catch(error => {
              onNetworkError(error.message);
            });
        })
        .catch(error => {
          onNetworkError(error.message);
        });
    }, 5000);
  }

  _pingDevice(device) {
    const service = SERVICES.IOBUTTON;
    const { onNetworkError } = this.props;
    console.log("pinging device", device, service);

    BleManager.startNotification(device.id, service.UUID, service.DATA)
      .then(e => {
        console.log(device, e);
      })
      .catch(error => {
        console.log(error);
        onNetworkError(error.message);
      });
  }

  _getDeviceBatteryInfo(device) {
    const service = SERVICES.BATTERY;
    const { onNetworkError } = this.props;
    console.log("battery of device", device, service);

    BleManager.read(device.id, "AA80", service.DATA)
      .then(e => {
        console.log(device, e);
      })
      .catch(error => {
        console.log(error);
        onNetworkError(error.message);
      });
  }

  // When the device has been connected ping it and then get its battery status
  connectToDevice(device) {
    const { onDeviceConnect, onNetworkError } = this.props;
    this.setState({ isBusy: true });

    BleManager.connect(device.id)
      .then(_ => {
        this.setState({
          isBusy: false
        });

        onDeviceConnect(device);
        this._pingDevice(device);
        this._getDeviceBatteryInfo(device);
        // Hack to let the component know that devices have changed
        this.forceUpdate();
      })
      .catch(error => {
        this.setState({ isBusy: false });
        onNetworkError(error.message);
      });
  }

  disConnectDevice(device) {
    const { onDeviceDisconnect, onNetworkError } = this.props;
    this.setState({ isBusy: true });

    BleManager.disconnect(device.id)
      .then(e => {
        this.setState({
          isBusy: false
        });
        onDeviceDisconnect(device);
        // Hack to let the component know that devices have changed
        this.forceUpdate();
      })
      .catch(error => {
        this.setState({ isBusy: false });
        onNetworkError(error.message);
      });
  }

  _keyExtractor = (item, index) => item.id;

  _renderDeviceDetails = ({ item }) => {
    const { connectedDevices } = this.props;

    return (
      <View>
        {!item.name ? null : (
          <View>
            {connectedDevices[item.id] ? (
              <TouchableOpacity
                style={styles.deviceContainer}
                onPress={() => this.disConnectDevice(item)}
              >
                <H4 style={[styles.text, styles.connected]}>
                  {!!item.advertising && !!item.advertising.kCBAdvDataLocalName
                    ? item.advertising.kCBAdvDataLocalName
                    : item.name}
                </H4>
                <Badge
                  style={styles.badge}
                  value={"Disconnect"}
                  color={Colors.danger}
                />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.deviceContainer}
                onPress={() => this.connectToDevice(item)}
              >
                <H4 style={styles.text}>
                  {!!item.advertising && !!item.advertising.kCBAdvDataLocalName
                    ? item.advertising.kCBAdvDataLocalName
                    : item.name}
                </H4>
                <Badge
                  style={styles.badge}
                  value={"Connect"}
                  color={Colors.success}
                />
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    );
  };

  render() {
    const { isBusy, peripherals } = this.state;
    return (
      <View style={styles.container}>
        <FlatList
          style={styles.list}
          onRefresh={() => this.startScan}
          data={peripherals}
          refreshing={false}
          extraData={this.state}
          keyExtractor={this._keyExtractor}
          renderItem={this._renderDeviceDetails}
        />
        <View style={styles.spinnerContainer}>
          <Spinner
            type="FadingCircleAlt"
            isVisible={!!isBusy}
            color={Colors.primary}
          />
        </View>
        <View style={styles.footerButtonContainer}>
          <Button
            disabled={!!isBusy}
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
    flex: 1
  },
  list: {
    flex: 4
  },
  spinnerContainer: {
    padding: 10,
    justifyContent: "center",
    alignItems: "center"
  },
  text: {
    color: Colors.secondary,
    fontWeight: "600"
  },
  connected: {
    color: Colors.success
  },
  footerButtonContainer: {
    flex: 1,
    maxHeight: 60,
    padding: 10
  },
  footerButton: {
    width: "100%"
  },
  deviceContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10
  },
  badge: {
    maxHeight: 24
  }
};

const mapStateToProps = state => {
  return {
    bluetoothStarted: state.bluetooth.started,
    connectedDevices: state.bluetooth.connectedDevices
  };
};

const mapDispatchToProps = dispatch => {
  return {
    onBluetoothStarted: started => dispatch(bluetoothStart(true)),
    onDeviceConnect: device => dispatch(deviceConnect(device)),
    onDeviceDisconnect: device => dispatch(deviceDisconnect(device)),
    onNetworkError: error => dispatch(networkError(error))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(
  BluetoothConnectComponent
);
