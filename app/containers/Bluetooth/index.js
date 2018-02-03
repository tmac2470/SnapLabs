import React, { Component } from "react";
import { connect } from "react-redux";
import BleManager from "react-native-ble-manager";
import {
  View,
  TouchableOpacity,
  FlatList,
  Platform,
  Text,
  NativeModules,
  NativeEventEmitter,
  PermissionsAndroid
} from "react-native";
import { Button, H5, H4, H6, Badge } from "nachos-ui";
import FullScreenLoader from "../../components/FullScreenLoading";
import { Map } from 'immutable';

import Colors from "../../Theme/colors";

import {
  bluetoothStart,
  deviceConnect,
  deviceDisconnect,
  updateConnectedDevice
} from "./actions.js";
import { appError } from "../../Metastores/actions";
import * as SERVICES from "./services";

const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

export class BluetoothConnectComponent extends Component<{}> {
  static navigationOptions = {
    title: "Connect to devices"
  };

  state = {
    isBusy: false,
    peripherals: [],
    connectedDeviceKeyPressed: {},
    showHighlightInfo: false,
    peripheralMap: new Map()
  };

  // Start with the Blemanager start method to initialise bluetooth
  componentDidMount() {
    const {
      connectedDevices,
      bluetoothStarted,
      onBluetoothStarted,
      onAppError
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
          onAppError(error);
        });
    } else {
      this.startScan();
    }

    this._bleUpdateEmitterEvent = bleManagerEmitter.addListener(
      "BleManagerDidUpdateValueForCharacteristic",
      this._subscribeToBleData.bind(this)
    );

    this._bleDiscoverEmitterEvent = bleManagerEmitter.addListener(
      'BleManagerDiscoverPeripheral',
      this._subscribeToDiscoveredPeripherals.bind(this)
    );

    if (Platform.OS === "android") {
      BleManager.enableBluetooth()
        .then(() => {
          // Success code
          this.startScan();
        })
        .catch(error => {
          // Failure code
          onAppError("User refused bluetooth");
        });

      PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION
      ).then(result => {
        if (!result) {
          PermissionsAndroid.requestPermission(
            PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION
          ).then(result => {
            if (!result) {
              onAppError("User refused bluetooth");
            }
          });
        }
      });
    }
  }

  componentWillUnmount() {
    this._unpingAllConnectedDevices();
    this._bleUpdateEmitterEvent.remove();
    this._bleDiscoverEmitterEvent.remove();
  }

  _highlightConnectedDevice(deviceId, value) {
    const { connectedDeviceKeyPressed } = this.state;
    if (value.length > 0 && !!value[0]) {
      if (value[0] > 0) {
        connectedDeviceKeyPressed[deviceId] = true;
      } else {
        connectedDeviceKeyPressed[deviceId] = false;
      }
    } else {
      connectedDeviceKeyPressed[deviceId] = false;
    }
    this.setState({
      ...connectedDeviceKeyPressed
    });
  }

  // Subscribes to the data emitted by ble module
  // Will work only when notifications have been started
  // Parameter: data => contains the peripheral(deviceID), characteristicUUID  and its value
  // Need tp segregate the data based on peripheral(deviceID) and characteristicUUID
  _subscribeToBleData(data) {
    const { peripheral, characteristic, value } = data;
    const state = new Uint8Array(value);
    this._highlightConnectedDevice(peripheral, state);
  }

  _pingAllConnectedDevices() {
    const { connectedDevices, onAppError } = this.props;
    const connectedDeviceIds = Object.keys(connectedDevices);

    // Need recursive pings coz running a loop doesnt work
    const _pingRecursive = deviceIds => {
      const Id = deviceIds.pop();
      if (!Id) {
        return;
      }
      BleManager.retrieveServices(Id)
        .then(_ => {
          this._pingDevice(connectedDevices[Id]);
          _pingRecursive(deviceIds);
        })
        .catch(error => {
          onAppError(error);
        });
    };
    _pingRecursive(connectedDeviceIds);
  }

  _subscribeToDiscoveredPeripherals(peripheral) {
    if (!peripheral.name) {
      return;
    }
    const { peripheralMap } = this.state;
    const map = peripheralMap.set(peripheral.id, peripheral);

    this.setState({
      peripheralMap: map
    });
  }

  _unpingAllConnectedDevices() {
    const service = SERVICES.IOBUTTON;
    const { onAppError, connectedDevices } = this.props;

    Object.keys(connectedDevices).map(key => {
      const device = connectedDevices[key];
      BleManager.stopNotification(device.id, service.UUID, service.DATA)
        .then(e => {
          // Success
        })
        .catch(error => {
          onAppError(error);
        });
    });
  }

  startScan() {
    const { onAppError } = this.props;
    if (!this.state.isBusy) {
      BleManager.scan([], 5, false)
        .then(_ => {
          this.setState({ isBusy: true });
          this._pingAllConnectedDevices();
        })
        .catch(error => {
          onAppError(error);
        });
    }

    setTimeout(() => {
      BleManager.stopScan()
        .then(e => {
          // Success code
          this.setState({ isBusy: false });
        })
        .catch(error => {
          onAppError(error);
        });
    }, 5000);
  }

  _pingDevice(device) {
    const service = SERVICES.IOBUTTON;
    const { onAppError } = this.props;
    BleManager.startNotification(device.id, service.UUID, service.DATA)
      .then(e => {
        // Once the notifications have been started, listen to the handlerUpdate event
        this.setState({
          showHighlightInfo: true
        });
      })
      .catch(error => {
        onAppError(error);
        return error;
      });

    this._getDeviceBatteryInfo(device);
  }

  _getDeviceBatteryInfo(device) {
    const service = SERVICES.BATTERY;
    const { onAppError, onUpdateConnectedDevice } = this.props;

    BleManager.read(device.id, service.UUID, service.DATA)
      .then(data => {
        const state = new Uint8Array(data);
        device.batteryLevel = state[0];
        onUpdateConnectedDevice(device);
      })
      .catch(error => {
        onAppError(error);
      });
  }

  // When the device has been connected ping it and then get its battery status
  connectToDevice(device) {
    const { onDeviceConnect, onAppError } = this.props;
    this.setState({ isBusy: true });

    BleManager.connect(device.id)
      .then(_ => {
        this.setState({
          isBusy: false
        });

        onDeviceConnect(device);
        BleManager.retrieveServices(device.id)
          .then(device => {
            this._pingDevice(device);
          })
          .catch(error => {
            onAppError(error);
          });
      })
      .catch(error => {
        this.setState({ isBusy: false });
        onAppError(error);
      });
  }

  disConnectDevice(device) {
    const { onDeviceDisconnect, onAppError } = this.props;
    this.setState({ isBusy: true });

    BleManager.disconnect(device.id)
      .then(e => {
        this.setState({
          isBusy: false
        });
        onDeviceDisconnect(device);
      })
      .catch(error => {
        this.setState({ isBusy: false });
        onAppError(error);
      });
  }

  _keyExtractor = (item, index) => item.id;

  _renderDeviceDetails = ({ item }) => {
    const { connectedDevices } = this.props;
    const { connectedDeviceKeyPressed } = this.state;
    const connectedDevice = connectedDevices[item.id];

    const getHighlightedDeviceContainerStyle = deviceId => {
      if (connectedDeviceKeyPressed[deviceId]) {
        return styles.highlightDeviceContainer;
      } else {
        return {};
      }
    };

    return (
      <View>
        {!item.name ? null : (
          <View>
            {connectedDevice ? (
              <TouchableOpacity
                style={[
                  styles.deviceContainer,
                  getHighlightedDeviceContainerStyle(item.id)
                ]}
                onPressIn={() => this.disConnectDevice(item)}
              >
                <H4 style={[styles.text, styles.connected]}>
                  {!!connectedDevice.advertising &&
                  !!connectedDevice.advertising.kCBAdvDataLocalName
                    ? connectedDevice.advertising.kCBAdvDataLocalName
                    : connectedDevice.name}
                </H4>
                <Text style={styles.deviceInfo}>{connectedDevice.id}</Text>
                {!connectedDevice.batteryLevel ? null : (
                  <Text style={styles.deviceInfo}>
                    Battery level : {connectedDevice.batteryLevel}%
                  </Text>
                )}

                <Badge
                  style={styles.badge}
                  value={"Disconnect"}
                  color={Colors.danger}
                />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.deviceContainer}
                onPressIn={() => this.connectToDevice(item)}
              >
                <H4 style={styles.text}>
                  {!!item.advertising && !!item.advertising.kCBAdvDataLocalName
                    ? item.advertising.kCBAdvDataLocalName
                    : item.name}
                </H4>
                <Text style={styles.deviceInfo}>{item.id}</Text>
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
    const { isBusy, showHighlightInfo, peripheralMap } = this.state;
    const { connectedDevices, busy } = this.props;
    const numOfConnectedDevices = Object.keys(connectedDevices).length;

    const peripherals = peripheralMap.toArray();

    return (
      <View style={styles.container}>
        <FullScreenLoader visible={!!busy || !!isBusy} />

        {showHighlightInfo &&
        numOfConnectedDevices > 0 &&
        peripherals.length > 0 ? (
          <View style={styles.connectedInfoContainer}>
            <H6 style={styles.text}>
              Press any button on the device to highlight the device name
            </H6>
          </View>
        ) : null}
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
            disabled={!!isBusy}
            uppercase={false}
            onPressIn={() => this.startScan()}
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
  connectedInfoContainer: {
    padding: 10
  },
  text: {
    color: Colors.secondary,
    fontWeight: "600"
  },
  deviceInfo: {
    color: Colors.secondary
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
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: 2,
    paddingBottom: 10,
    backgroundColor: "white",
    borderColor: "transparent",

    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",

    borderBottomColor: "black",
    borderBottomWidth: 0.5
  },
  highlightDeviceContainer: {
    borderLeftColor: Colors.primary,
    borderRightColor: Colors.primary
  },
  badge: {
    maxHeight: 24,
    marginTop: 5
  }
};

const mapStateToProps = state => {
  return {
    bluetoothStarted: state.bluetooth.started,
    connectedDevices: state.bluetooth.connectedDevices,
    busy: state.meta.busy
  };
};

const mapDispatchToProps = dispatch => {
  return {
    onBluetoothStarted: started => dispatch(bluetoothStart(true)),
    onDeviceConnect: device => dispatch(deviceConnect(device)),
    onDeviceDisconnect: device => dispatch(deviceDisconnect(device)),
    onAppError: error => dispatch(appError(error)),
    onUpdateConnectedDevice: device => dispatch(updateConnectedDevice(device))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(
  BluetoothConnectComponent
);
