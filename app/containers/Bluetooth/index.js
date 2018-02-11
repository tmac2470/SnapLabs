import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
  View,
  TouchableOpacity,
  FlatList,
  Platform,
  Text,
  NativeModules,
  NativeEventEmitter,
  PermissionsAndroid
} from 'react-native';
import { Button, H5, H4, H6, Badge } from 'nachos-ui';
import FullScreenLoader from '../../components/FullScreenLoading';
import { Map } from 'immutable';
import GlobalErrorAlert from '../../components/GlobalErrorAlert';
import { BleManager } from 'react-native-ble-plx';
import base64 from 'base64-js';

import Colors from '../../Theme/colors';

import {
  bluetoothStart,
  deviceConnect,
  deviceDisconnect,
  updateConnectedDevice
} from './actions.js';
import { appError } from '../../Metastores/actions';
import * as SERVICES from './services';

export class BluetoothConnectComponent extends Component<{}> {
  static navigationOptions = {
    title: 'Connect to devices'
  };

  constructor() {
    super();
    this.manager = new BleManager();
  }

  state = {
    isBusy: false,
    connectedDeviceKeyPressed: {},
    showHighlightInfo: false,
    peripheralMap: new Map()
  };

  // Bluetooth module
  // Check if bluetooth is on.
  // Scan for devices
  // On device connect get all services
  componentWillMount() {
    if (Platform.OS === 'ios') {
      this.manager.onStateChange(state => {
        if (state === 'PoweredOn') {
          this.startScan();
        }
      });
    } else {
      this.startScan();
    }
  }

  componentWillUnmount() {
    this.manager.destroy();
    delete this.manager;
  }

  _addDeviceToList(peripheral) {
    const { peripheralMap } = this.state;
    const map = peripheralMap.set(peripheral.id, peripheral);

    this.setState({
      peripheralMap: map
    });
  }

  _autoConnectIfPreviouslyConnected(device) {
    const { connectedDevices } = this.props;
    if (!connectedDevices) {
      return;
    }
    const wasConnectedPreviously = connectedDevices[device.id];
    if (!!wasConnectedPreviously) {
      this.connectToDevice(device);
    }
  }

  startScan() {
    const { onAppError, connectedDevices } = this.props;
    this.setState({ isBusy: true });

    this.manager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        this.setState({ isBusy: false });
        onAppError(error.message);
        return;
      }
      if (device && device.name && device.name.indexOf('Sensor') > -1) {
        this._addDeviceToList(device);
        this._autoConnectIfPreviouslyConnected(device);
      }
    });

    setTimeout(() => {
      this.setState({ isBusy: false });
      this.manager.stopDeviceScan();
    }, 1500);
  }

  connectToDevice(device) {
    const { onAppError } = this.props;
    this.setState({ isBusy: true });

    this.manager
      .connectToDevice(device.id)
      .then(device => {
        return device.discoverAllServicesAndCharacteristics();
      })
      .then(device => {
        this.setState({ isBusy: false });
        this._onDeviceConnect(device);
      })
      .catch(error => {
        this.setState({ isBusy: false });
        onAppError(error.message);
      });
  }

  _onDeviceConnect(device) {
    const { onAppError, onDeviceConnect } = this.props;
    onDeviceConnect(device);

    this._getDeviceBatteryLevel(device);
    this._getKeyPressed(device);
  }

  _getDeviceBatteryLevel(device) {
    const { onAppError, onUpdateConnectedDevice } = this.props;
    const { UUID, DATA } = SERVICES.BATTERY;

    this.manager
      .readCharacteristicForDevice(device.id, UUID, DATA)
      .then(data => {
        device.batteryLevel = this._getInt8Value(data.value);
        onUpdateConnectedDevice(device);
      })
      .catch(e => onAppError(e.message));
  }

  _getInt8Value(value) {
    const array = base64.toByteArray(value).buffer;
    return new DataView(array).getInt8(0, true);
  }

  _getKeyPressed(device) {
    const { onAppError } = this.props;
    const { UUID, DATA } = SERVICES.IOBUTTON;

    this.setState({
      showHighlightInfo: true
    });

    this.manager.monitorCharacteristicForDevice(
      device.id,
      UUID,
      DATA,
      (error, data) => {
        if (error) {
          onAppError(error.message);
          return;
        }
        this._highlightConnectedDevice(
          device.id,
          this._getInt8Value(data.value)
        );
      }
    );
  }

  disConnectDevice(device) {
    const { onAppError, onDeviceDisconnect } = this.props;
    this.setState({ isBusy: true });

    this.manager
      .cancelDeviceConnection(device.id)
      .then(e => {
        this.setState({ isBusy: false });
        onDeviceDisconnect(device);
      })
      .catch(e => {
        this.setState({ isBusy: false });
        onAppError(e.message);
      });
  }

  _highlightConnectedDevice(deviceId, value) {
    const { connectedDeviceKeyPressed } = this.state;
    if (!!value) {
      connectedDeviceKeyPressed[deviceId] = true;
    } else {
      connectedDeviceKeyPressed[deviceId] = false;
    }
    this.setState({
      ...connectedDeviceKeyPressed
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
                  {connectedDevice.name}
                </H4>
                <Text style={styles.deviceInfo}>{connectedDevice.id}</Text>
                {!connectedDevice.batteryLevel ? null : (
                  <Text style={styles.deviceInfo}>
                    Battery level : {connectedDevice.batteryLevel}%
                  </Text>
                )}

                <Badge
                  style={styles.badge}
                  value={'Disconnect'}
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
                  value={'Connect'}
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
        <GlobalErrorAlert />
        <FullScreenLoader visible={!!busy || !!isBusy} />

        {showHighlightInfo &&
        numOfConnectedDevices > 0 &&
        peripherals.length > 0 ? (
          <View style={styles.connectedInfoContainer}>
            <H6 style={styles.text}>
              Press any button on the device to highlight the device name
            </H6>
            <H6 style={styles.text}>
              If a device gets disconnected the app would try to re-connect on
              investigation page.
            </H6>
          </View>
        ) : null}
        <FlatList
          style={styles.list}
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
    flexDirection: 'column',
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
    fontWeight: '600'
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
    width: '100%'
  },
  deviceContainer: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 2,
    paddingBottom: 10,
    backgroundColor: 'white',
    borderColor: 'transparent',

    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',

    borderBottomColor: 'black',
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
