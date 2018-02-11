import React, { Component } from 'react';
import { connect, connectAdvanced } from 'react-redux';
import { BleManager } from 'react-native-ble-plx';
import * as _ from 'lodash';
import * as SERVICES from '../Bluetooth/services';
import moment from 'moment';
import {
  Alert,
  Image,
  NativeEventEmitter,
  NativeModules,
  Platform,
  ScrollView,
  TouchableOpacity,
  View
} from 'react-native';
import { Button, H2, H4, H5, H6 } from 'nachos-ui';
import {
  VictoryLine,
  VictoryChart,
  VictoryAxis,
  VictoryTheme,
  VictoryLabel,
  VictoryLegend,
  VictoryZoomContainer
} from 'victory-native';
import FullScreenLoader from '../../components/FullScreenLoading';
import GlobalErrorAlert from '../../components/GlobalErrorAlert';
import base64 from 'base64-js';
import buffer from 'buffer';

import Colors from '../../Theme/colors';
import * as utils from './utils';
import { appError, appBusy } from '../../Metastores/actions';

export class InvestigationDetailsComponent extends Component<{}> {
  static navigationOptions = {
    title: 'Investigation Details'
  };

  constructor() {
    super();
    this.manager = new BleManager();
    this.deviceMonitors = [];
  }

  state = {
    connectedDevices: {},
    investigation: {},
    sensors: [],
    graphs: {
      started: false,
      startedAtLeastOnce: false
    },
    sampleIntervalTime: 1000,
    display: {
      graph: false,
      grid: false,
      maxGridWidth: 100
    },
    datasetsAvailable: [],
    isBusy: false,
    reconnected: false
  };

  componentWillMount() {
    const { navigation, connectedDevices } = this.props;
    const investigation = navigation.state.params.investigation;

    const _assignState = async tags => {
      const sampleIntervalTime = parseInt(investigation.sampleInterval);
      const sensors = await utils._getSensorTags(tags, connectedDevices);

      this.setState({
        investigation,
        sampleIntervalTime,
        sensors,
        connectedDevices
      });
      this.initialiseSensorTags(sensors);
    };
    _assignState(investigation.sensorTags);
    this.initialiseBluetooth();
  }

  componentWillUnmount() {
    this.deviceMonitors.map(monitor => {
      monitor.remove();
    });

    this.manager.destroy();
    delete this.manager;
  }

  initialiseBluetooth() {
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

  startScan() {
    const { onAppError, connectedDevices } = this.props;
    this.setState({ isBusy: true });

    this.manager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        this.setState({ isBusy: false });
        onAppError(error.message);
        return;
      }
      if (device && device.name) {
        this._autoConnectIfPreviouslyConnected(device);
      }
    });

    setTimeout(() => {
      this.setState({ isBusy: false });
      this.manager.stopDeviceScan();
    }, 1500);
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

  connectToDevice(device) {
    const { onAppError } = this.props;
    this.setState({ isBusy: true });

    this.manager
      .connectToDevice(device.id)
      .then(device => {
        return device.discoverAllServicesAndCharacteristics();
      })
      .then(device => {
        this.setState({ isBusy: false, reconnected: true });
        // Start notifications once connected
        this.startNotifications(device);
      })
      .catch(error => {
        this.setState({ isBusy: false });
        onAppError(error.message);
      });
  }

  _subscribeToBleData(data) {
    const { peripheral, UUID, value } = data;

    switch (UUID.toLowerCase()) {
      case SERVICES.Luxometer.UUID.toLowerCase():
        this._readLuxometerNotifications(
          peripheral,
          base64.toByteArray(value).buffer
        );
        break;
      case SERVICES.Temperature.UUID.toLowerCase():
        this._readTemperatureNotifications(
          peripheral,
          base64.toByteArray(value).buffer
        );
        break;
      case SERVICES.Barometer.UUID.toLowerCase():
        this._readBarometerNotifications(
          peripheral,
          base64.toByteArray(value).buffer
        );
        break;
      case SERVICES.Humidity.UUID.toLowerCase():
        this._readHumidityNotifications(
          peripheral,
          base64.toByteArray(value).buffer
        );
        break;
      case SERVICES.Movement.UUID.toLowerCase():
        this._readMovementNotifications(
          peripheral,
          base64.toByteArray(value).buffer
        );
        break;
      case SERVICES.IOBUTTON.UUID.toLowerCase():
        this._readSensorBtnNotifications(peripheral, this._getInt8Value(value));
        break;
      default:
        break;
    }
  }

  _getInt8Value(value) {
    const array = base64.toByteArray(value).buffer;
    return new DataView(array).getInt8(0, true);
  }

  _startNotificationForService(device, service) {
    const { onAppError } = this.props;

    const monitor = this.manager.monitorCharacteristicForDevice(
      device.id,
      service.UUID,
      service.DATA,
      (error, data) => {
        if (error) {
          onAppError(error.message);
          return;
        }
        const payload = {
          UUID: service.UUID,
          peripheral: device.id,
          value: data.value
        };

        this._subscribeToBleData(payload);
      }
    );

    this.deviceMonitors.push(monitor);
    return monitor;
  }

  _writePeriodToDevice(device, service, sampleIntervalTime) {
    const period = [sampleIntervalTime * 10];
    return this.manager.writeCharacteristicWithResponseForDevice(
      device.id,
      service.UUID,
      service.PERIOD,
      period
    );
  }

  _writeToDevice(device, service, data) {
    return this.manager.writeCharacteristicWithResponseForDevice(
      device.id,
      service.UUID,
      service.CONFIG,
      data
    );
  }

  _stopNotifications(device) {
    const { sensors } = this.state;
    const { onAppError } = this.props;

    sensors.map(async sensorTag => {
      const config = sensorTag.config;
      let service = {};

      // if the displays are off, do not start notifications
      if (
        !!config.graph.display ||
        !!config.graph.graphdisplay ||
        !!config.grid.display ||
        !!config.grid.griddisplay
      ) {
        switch (sensorTag.name.toLowerCase()) {
          case 'temperature':
            service = SERVICES.Temperature;
            break;
          case 'barometer':
            service = SERVICES.Barometer;
            break;
          case 'accelerometer':
          case 'gyroscope':
          case 'magnetometer':
            service = SERVICES.Accelerometer;
            break;
          case 'humidity':
            service = SERVICES.Humidity;
            break;
          case 'luxometer':
            service = SERVICES.Luxometer;
            break;

          default:
            service = SERVICES.IOBUTTON;
            break;
        }
        if (!service.UUID) {
          return;
        }
        try {
          await BleManager.stopNotification(
            device.id,
            service.UUID,
            service.DATA
          );
        } catch (error) {
          onAppError(error.message);
        }
      }
    });
  }

  startNotifications(device) {
    const { sensors } = this.state;

    const asyncActivation = async () => {
      // captureOnClick enabled
      await this._startSensorBtnNotifications(device);

      sensors.map(async sensorTag => {
        const config = sensorTag.config;

        // if the displays are off, do not start notifications
        if (
          !!config.graph.display ||
          !!config.graph.graphdisplay ||
          !!config.grid.display ||
          !!config.grid.griddisplay
        ) {
          switch (sensorTag.name.toLowerCase()) {
            case 'temperature':
              await this._startTemperatureNotifications(device);
              break;
            case 'barometer':
              await this._startBarometerNotifications(device);
              break;
            case 'accelerometer':
            case 'gyroscope':
            case 'magnetometer':
              this._startMovementNotifications(device);
              break;
            case 'humidity':
              await this._startHumidityNotifications(device);
              break;
            case 'luxometer':
              await this._startLuxometerNotifications(device);
              break;

            default:
              break;
          }
        }
      });
    };

    asyncActivation();
  }

  _readMovementNotifications(deviceId, data) {
    // Movement DATA
    //0 gyro x
    //1 gyro y
    //2 gyro z
    //3 accel x
    //4 accel y
    //5 accel z
    //6 mag x
    //7 mag y
    //8 mag z

    // val depends on range: 2G = (32768/2), 4G = (32768/4), 8G = (32768/8) = 4096, 16G (32768/16)
    // To correspond with bit set in snaplabs.devices.enableMovementSensor
    // NOTE - MUST BE SIGNED INT (Not getUint16)
    const accVal = 32768 / 2;
    const accDivisors = { x: -1 * accVal, y: accVal, z: -1 * accVal };
    const ax_temp = new DataView(data).getInt16(6, true);
    const ay_temp = new DataView(data).getInt16(8, true);
    const az_temp = new DataView(data).getInt16(10, true);

    // Calculate accelerometer values.
    // Leave as 6,8,10  http://processors.wiki.ti.com/index.php/CC2650_SensorTag_User's_Guide#Movement_Sensor
    const accX = ax_temp / accDivisors.x;
    const accY = ay_temp / accDivisors.y;
    const accZ = az_temp / accDivisors.z;
    const accScalar = Math.sqrt(accX * accX + accY * accY + accZ * accZ);

    // Gyrometer calculations
    var gyroVal = 500 / 65536.0;
    var gyroX = new DataView(data).getInt16(0, true) * gyroVal;
    var gyroY = new DataView(data).getInt16(2, true) * gyroVal;
    var gyroZ = new DataView(data).getInt16(4, true) * gyroVal;

    // Magnetometer calculations
    var magX = new DataView(data).getInt16(12, true);
    var magY = new DataView(data).getInt16(14, true);
    var magZ = new DataView(data).getInt16(16, true);
    var magScalar = Math.sqrt(magX * magX + magY * magY + magZ * magZ);

    const gyroscopeValues = {
      X: gyroX,
      Y: gyroY,
      Z: gyroZ
    };

    const accelerometerValues = {
      X: accX,
      Y: accY,
      Z: accZ,
      'Scalar Value': accScalar
    };

    const magnetometerValues = {
      X: magX,
      Y: magY,
      Z: magZ,
      'Scalar Value': magScalar
    };

    // console.log(gyroscopeValues);
    // console.log(accelerometerValues);
    // console.log(magnetometerValues);

    const displayValGyro = `X ${gyroscopeValues.X}, Y ${gyroscopeValues.Y}, Z ${
      gyroscopeValues.Z
    }`;
    this._updateSensorValue(
      'Gyroscope',
      deviceId,
      displayValGyro,
      gyroscopeValues
    );

    const displayValAcc = `X ${accelerometerValues.X}, Y ${
      accelerometerValues.Y
    }, Z ${accelerometerValues.Z}`;
    this._updateSensorValue(
      'Accelerometer',
      deviceId,
      displayValAcc,
      accelerometerValues
    );

    const displayValMag = `X ${magnetometerValues.X}, Y ${
      magnetometerValues.Y
    }, Z ${magnetometerValues.Z}`;
    this._updateSensorValue(
      'Magnetometer',
      deviceId,
      displayValMag,
      magnetometerValues
    );
  }

  // file:///Users/shailendrapal/Downloads/attr_cc2650%20sensortag.html
  _startMovementNotifications(device) {
    const service = SERVICES.Accelerometer;
    this._asyncStartNotificationsForService(service, device, 'AH8=');
  }

  _readHumidityNotifications(deviceId, data) {
    const sensorName = 'Humidity';
    // Humidity DATA

    const state = new DataView(data).getUint16(0, true);
    const roomTemp = -46.85 + 175.72 / 65536.0 * state;

    // Calculate the relative humidity.
    const temp = new DataView(data).getUint16(0, true);
    const hData = temp & ~0x03;
    const RHValue = -6.0 + 125.0 / 65536.0 * hData;

    const values = {
      rh: RHValue,
      temp: roomTemp
    };

    const displayVal = `${values.rh.toFixed(3)}% RH at ${values.temp.toFixed(
      3
    )} °C`;

    const dataValueMap = {
      '°C': values.temp,
      '% RH': values.rh
    };
    this._updateSensorValue(sensorName, deviceId, displayVal, dataValueMap);
  }

  _startHumidityNotifications(device) {
    const service = SERVICES.Humidity;
    this._asyncStartNotificationsForService(service, device, 'AQ==');
  }

  _readBarometerNotifications(deviceId, data) {
    const sensorName = 'Barometer';
    // Barometer DATA

    const flTempData = new DataView(data).getUint32(0, true);
    const flPressureData = new DataView(data).getUint32(2, true);

    const tempValue = (flTempData & 0x00ffffff) / 100.0;
    const pressureValue = ((flPressureData >> 8) & 0x00ffffff) / 100.0;

    const values = {
      hPa: pressureValue,
      c: tempValue
    };

    const displayVal = `${values.hPa} hPa at ${values.c} °C`;

    const dataValueMap = {
      hPa: values.hPa,
      '°C': values.c
    };
    this._updateSensorValue(sensorName, deviceId, displayVal, dataValueMap);
  }

  _startBarometerNotifications(device) {
    const service = SERVICES.Barometer;
    this._asyncStartNotificationsForService(service, device, 'AQ==');
  }

  _readTemperatureNotifications(deviceId, data) {
    const sensorName = 'Temperature';

    const temp = new DataView(data).getUint16(0, true);
    const targetTemp = (temp >> 2) * 0.03125;
    // Calculate ambient temp
    const ambientTemp = new DataView(data).getUint16(2, true) / 128.0;

    // Temperature DATA
    const values = {
      amb: ambientTemp,
      ir: targetTemp
    };

    const displayVal = `${values.amb}°C [Amb], ${values.ir}°C [IR]`;

    const dataValueMap = {
      'Ambient Temperature (°C)': values.amb,
      'Target (IR) Temperature (°C)': values.ir
    };
    this._updateSensorValue(sensorName, deviceId, displayVal, dataValueMap);
  }

  _startTemperatureNotifications(device) {
    const service = SERVICES.Temperature;
    this._asyncStartNotificationsForService(service, device, 'AQ==');
  }

  _readLuxometerNotifications(deviceId, data) {
    const sensorName = 'Luxometer';

    // Get 16 bit value from data buffer in little endian format.
    const value = new DataView(data).getUint16(0, true);

    // Extraction of luxometer value, based on sfloatExp2ToDouble
    // from BLEUtility.m in Texas Instruments TI BLE SensorTag
    // iOS app source code.
    const mantissa = value & 0x0fff;
    const exponent = value >> 12;
    const magnitude = Math.pow(2, exponent);
    const output = mantissa * magnitude;

    const luxValue = output / 100.0;

    // Luxometer DATA
    const values = {
      lux: luxValue
    };
    const displayVal = `${values.lux} lux`;
    const dataValueMap = {
      lux: values.lux
    };
    this._updateSensorValue(sensorName, deviceId, displayVal, dataValueMap);
  }

  _startLuxometerNotifications(device) {
    const service = SERVICES.Luxometer;
    this._asyncStartNotificationsForService(service, device, 'AQ==');
  }

  _asyncStartNotificationsForService = async (
    service,
    device,
    activationBits
  ) => {
    const { sampleIntervalTime } = this.state;

    const { onAppError } = this.props;

    try {
      // Write the delay time
      // await this._writePeriodToDevice(device, service, sampleIntervalTime);
      // Start notification
      await this._startNotificationForService(device, service);

      if (activationBits) {
        // Switch on the sensor
        /* AQ=== 0x01 in hex */
        await this._writeToDevice(device, service, activationBits);
      }
    } catch (e) {
      onAppError('Unable to write to device! Please reconnect device', e);
    }
  };

  _readSensorBtnNotifications(deviceId, pressed) {
    if (pressed) {
      this.captureDeviceDataForGrid();
    }
  }

  _startSensorBtnNotifications(device) {
    const service = SERVICES.IOBUTTON;
    this._startNotificationForService(device, service);
  }

  resetGrids() {
    const { sensors } = this.state;
    sensors.map(sensor => {
      return sensor.config.grids.map(grid => {
        grid.value = {};
        grid.rawValue = {};
        return grid;
      });
    });

    this.setState({
      sensors
    });
  }

  // Capture data for grid
  _captureData(grid, deviceId, sensor) {
    const { sensors } = this.state;
    if (!sensor.value || !sensor.value[deviceId]) {
      return grid;
    }

    if (!grid.value) {
      grid.value = {};
    }
    if (!grid.value[deviceId]) {
      grid.value[deviceId] = {};
    }

    if (!grid.rawValue) {
      grid.rawValue = {};
    }
    if (!grid.rawValue[deviceId]) {
      grid.rawValue[deviceId] = {};
    }

    const sensorValue = sensor.value[deviceId];
    const sensorRawValue = sensor.rawValue[deviceId];
    grid.rawValue[deviceId] = sensorRawValue;

    grid.value[deviceId] = {
      value: sensorValue
    };

    sensors.map(sensor => {
      return sensor.config.grids.map(g => {
        if (g.id === grid.id) {
          g = grid;
        }
        return grid;
      });
    });

    this.setState({
      sensors
    });
  }

  captureDeviceDataForGrid(currentGrid = {}, currentSensor = {}) {
    const { connectedDevices, sensors } = this.state;

    Object.keys(connectedDevices).map(key => {
      const device = connectedDevices[key];
      if (currentGrid && currentGrid.id && currentSensor && currentSensor) {
        this._captureData(currentGrid, device.id, currentSensor);
      } else {
        sensors.map(sensor => {
          if (sensor.value) {
            let grids = [];
            grids = sensor.config.grids;
            if (!grids) {
              return;
            }
            // Filter out the grids who've had values from all the devices
            grids = grids.filter(grid => {
              const keys = _.keys(grid.value);
              if (
                keys &&
                keys.length &&
                keys.length >= Object.keys(connectedDevices).length
              ) {
                return false;
              } else {
                return true;
              }
              // return !grid.value;
            });

            if (grids.length > 0) {
              this._captureData(grids[0], device.id, sensor);
            }
          }
        });
      }
    });
  }

  initialiseSensorTags(sensors) {
    const { connectedDevices, onAppError } = this.props;

    sensors.map(sensorTag => {
      sensorTag = this.initialiseChart(sensorTag, connectedDevices);
      sensorTag = this.initialiseGrid(sensorTag, connectedDevices);
      this._getDatasets(sensorTag);
      return sensorTag;
    });

    this.setState({
      sensors
    });
  }

  _getDatasets(sensor) {
    const { datasetsAvailable } = this.state;
    // Need datasets to decide if the grids can work
    const datasets = this._getSensorDatasets(sensor);
    const allDatasets = datasetsAvailable.concat(datasets);

    this.setState({
      datasetsAvailable: allDatasets
    });
  }

  startGraphs() {
    this.initialiseBluetooth();

    const { graphs } = this.state;
    graphs.started = true;
    graphs.startedAtLeastOnce = true;
    this.setState({
      graphs
    });
  }

  stopGraphs() {
    const { graphs } = this.state;
    graphs.started = false;
    this.setState({
      graphs
    });
  }

  resetGraphs() {
    const { investigation } = this.state;

    Alert.alert(
      'Confirm reset',
      `This will reset all the graphs for the investigation "${
        investigation.labTitle
      }"`,
      [
        {
          text: 'Cancel',
          onPress: () => {},
          style: 'cancel'
        },
        {
          text: 'Continue',
          onPress: () => this._resetGraphs()
        }
      ],
      {
        cancelable: true
      }
    );
  }

  _resetGraphs() {
    const { sensors, connectedDevices } = this.state;
    this.stopGraphs();
    // Also reset the graph data
    Object.keys(connectedDevices).map(deviceId => {
      sensors.map(sensor => {
        Object.keys(sensor.graph[deviceId].type).map(graphKey => {
          sensor.graph[deviceId].type[graphKey].data = [];
        });
      });
    });

    this.setState({
      sensors
    });
  }

  _getSensorDatasets(sensor) {
    const sensorParams = sensor.config.parameters;
    const mapDataSetConfig = this.mapDataSetConfig;

    switch (sensor.name.toLowerCase()) {
      case 'temperature':
        let tempDataSets = [];

        if (sensorParams.ambient) {
          tempDataSets.push({ type: 'amb' });
        }

        if (sensorParams.IR) {
          tempDataSets.push({ type: 'ir' });
        }

        return tempDataSets;

      case 'barometer':
        return [{ type: 'hPa' }];

      case 'luxometer':
        return [{ type: 'lux' }];

      // Accelerometer and magnetometer share similar data set config
      case 'accelerometer':
        let accXyzScalarDataSet = [];

        if (sensorParams.xyz) {
          accXyzScalarDataSet.push({
            type: 'accxyz'
          });
        }

        if (sensorParams.scalar) {
          accXyzScalarDataSet.push({
            type: 'accscalar'
          });
        }

        return accXyzScalarDataSet;
      case 'magnetometer':
        let mgXyzScalarDataSet = [];

        if (sensorParams.xyz) {
          mgXyzScalarDataSet.push({
            type: 'mgxyz'
          });
        }

        if (sensorParams.scalar) {
          mgXyzScalarDataSet.push({
            type: 'mgscalar'
          });
        }

        return mgXyzScalarDataSet;

      // Gyroscope shares the same xyzDataSet
      case 'gyroscope':
        return [{ type: 'gyroscope' }];

      case 'humidity':
        return [{ type: 'humidity' }];
    }
  }

  // Initialise a chart only once.
  // The datasets need to be configured per device though.
  initialiseChart(sensor, devices) {
    const { display } = this.state;
    if (!!sensor.config.graph.display || !!sensor.config.graph.graphdisplay) {
      display.graph = true;
      this.setState({
        display
      });
      return sensor;
    } else {
      return sensor;
    }
  }

  _getInnerGridStyle(grid) {
    const style = {};
    if (grid && grid.value && Object.keys(grid.value).length > 0) {
      style['backgroundColor'] = Colors.danger;
    }
    return style;
  }

  _getGridStyle(grid) {
    const { display } = this.state;

    const style = {
      width: `${display.maxGridWidth}%`,
      height: `${display.maxGridWidth}%`
    };

    return style;
  }

  _addTimeStampValues(dataValueMap) {
    const timestamp = new Date();
    dataValueMap['Unix Timestamp'] = moment(timestamp).valueOf();
    dataValueMap['Timestamp'] = moment(timestamp).format(
      'd/MM/YYYY, hh:mm:ss:SSS'
    );
    return dataValueMap;
  }

  _updateSensorValue(sensorName, deviceId, value, dataValueMap) {
    const { sensors, graphs } = this.state;
    sensors.map(sensor => {
      if (sensor.name === sensorName) {
        if (!sensor.value) {
          sensor.value = {};
        }
        if (!sensor.rawValue) {
          sensor.rawValue = {};
        }
        dataValueMap = this._addTimeStampValues(dataValueMap);
        sensor.value[deviceId] = value;
        sensor.rawValue[deviceId] = dataValueMap;

        if (graphs.started) {
          Object.keys(sensor.graph[deviceId].type).map(graphKey => {
            const graph = sensor.graph[deviceId].type[graphKey];
            graph.data.push({
              [graphKey]: dataValueMap[graph.label]
            });
          });

          sensor.graph[deviceId].rawValues.push(dataValueMap);
        }
        return sensor;
      }
    });
    this.setState({
      sensors
    });
  }

  initialiseGrid(sensor, devices) {
    const { display } = this.state;
    if (!!sensor.config.grid.display || !!sensor.config.grid.griddisplay) {
      display.grid = true;
      display.maxGridWidth = `${90 / parseInt(sensor.config.grid.columns)}`;
      const gridId = `${sensor.name}-grid`;
      const countX = sensor.config.grid.columns || 1;
      const countY = sensor.config.grid.rows || 1;

      const numOfGrids = parseInt(countX) * parseInt(countY);

      let grids = [];

      _.times(numOfGrids, count => {
        grids.push({
          id: `${gridId}-${count + 1}`,
          number: count + 1
        });
      });

      sensor.config.grids = grids;
      this.setState({
        display
      });
      return sensor;
    } else {
      return sensor;
    }
  }

  saveGraphData() {
    const {
      connectedDevices,
      sensors,
      sampleIntervalTime,
      investigation
    } = this.state;
    const { user, onAppBusy, onAppError } = this.props;
    onAppBusy(true);
    const asyncSave = async () => {
      try {
        await utils._saveGraphData(
          connectedDevices,
          sensors,
          sampleIntervalTime,
          investigation,
          user
        );
      } catch (error) {
        onAppBusy(false);
        onAppError(error);
      }
      onAppBusy(false);
    };
    asyncSave();
  }

  saveGridData() {
    const {
      connectedDevices,
      sensors,
      sampleIntervalTime,
      investigation
    } = this.state;
    const { user, onAppBusy, onAppError } = this.props;

    onAppBusy(true);
    const asyncSave = async () => {
      try {
        await utils._saveGridData(
          connectedDevices,
          sensors,
          sampleIntervalTime,
          investigation,
          user
        );
      } catch (error) {
        onAppBusy(false);
        onAppError(error);
      }
      onAppBusy(false);
    };
    asyncSave();
  }

  render() {
    const { navigation, busy } = this.props;
    const {
      connectedDevices,
      datasetsAvailable,
      display,
      graphs,
      investigation,
      sampleIntervalTime,
      sensors,
      isBusy,
      reconnected
    } = this.state;
    const isConnectedToDevices = Object.keys(connectedDevices);
    const connectedText =
      Object.keys(connectedDevices).length > 0
        ? reconnected ? 'Connected!' : 'Connecting...'
        : 'Not connected!';

    return (
      <View style={styles.container}>
        <GlobalErrorAlert />
        <FullScreenLoader visible={!!busy || !!isBusy} />

        <ScrollView style={styles.scrollContainer}>
          <H2 style={[styles.header, styles.text, styles.textBold]}>
            {investigation.labTitle}
          </H2>
          <View style={styles.contentBox}>
            <H5 style={[styles.text, styles.textBold]}>
              Sample Interval: {sampleIntervalTime}ms
            </H5>
            <H5 style={[styles.text, styles.textBold]}>
              Status: {connectedText}
            </H5>
            {!isConnectedToDevices
              ? null
              : Object.keys(connectedDevices).map(deviceId => (
                  <H6 style={styles.text} key={`sensor-tag-${deviceId}`}>
                    Sensor tag: {deviceId}
                  </H6>
                ))}
          </View>
          {datasetsAvailable.length > 0 ? null : (
            <View style={styles.contentBox}>
              <H5 style={[styles.text, styles.textBold]}>
                No sensors enabled/sensor tags available to run the
                investigation!
              </H5>
              <H5 style={styles.text}>
                Please recheck if at least one parameter(eg IR) has been enabled
                for the chosen sensor(eg Temperature) and at least one sensor
                tag is connected.
              </H5>
            </View>
          )}
          {sensors.length <= 0 ? null : (
            <View>
              {sensors.map((sensor, i) => {
                return (
                  <View style={styles.contentBox} key={i}>
                    <H4 style={[styles.text, styles.textBold]}>
                      {sensor.name}
                    </H4>
                    {sensor.parameters.length <= 0 ? null : (
                      <View>
                        <H6 style={styles.text}> Sensor parameters: </H6>
                        {sensor.parameters.map((param, j) => {
                          return (
                            <View key={i + j} style={styles.twoColBox}>
                              <H5 style={[styles.text, styles.textBold]}>
                                {param.key}
                              </H5>
                              <H5 style={[styles.text, styles.textBold]}>
                                {param.value ? 'ON' : 'OFF'}
                              </H5>
                            </View>
                          );
                        })}
                      </View>
                    )}
                    {!isConnectedToDevices
                      ? null
                      : Object.keys(connectedDevices).map(deviceId => (
                          <View
                            key={`sensor-tag-value-${deviceId}`}
                            style={styles.twoColBox}
                          >
                            <H6 style={styles.text}>Sensor {deviceId}</H6>
                            <H6 style={[styles.text, styles.textBold]}>
                              {sensor.value[deviceId]}
                            </H6>
                          </View>
                        ))}
                    {display.graph && sensor.graph ? (
                      <VictoryChart
                        theme={VictoryTheme.material}
                        containerComponent={
                          <VictoryZoomContainer
                            minimumZoom={{ x: 10, y: 10 }}
                          />
                        }
                      >
                        <VictoryLegend
                          x={125}
                          y={50}
                          orientation="vertical"
                          gutter={20}
                          standalone
                          data={sensor.graph.legends}
                        />
                        <VictoryLabel
                          x="50%"
                          y="20"
                          labelPlacement="vertical"
                          text={sensor.config.graph.graphTitle}
                          textAnchor="middle"
                        />

                        {Object.keys(connectedDevices).map(deviceId => {
                          return !!sensor.graph[deviceId].type
                            ? Object.keys(sensor.graph[deviceId].type).map(
                                graphKey => (
                                  <VictoryLine
                                    key={graphKey}
                                    style={
                                      sensor.graph[deviceId].type[graphKey]
                                        .style
                                    }
                                    data={
                                      sensor.graph[deviceId].type[graphKey].data
                                    }
                                    y={graphKey}
                                  />
                                )
                              )
                            : null;
                        })}
                      </VictoryChart>
                    ) : null}
                    {!display.grid ? null : (
                      <View>
                        <View>
                          <H6 style={styles.text}>
                            Press any button on sensor tag or tap on grid to
                            record a value
                          </H6>
                          <H6 style={styles.text}>
                            Please note: Tapping on a grid will rewrite any
                            existing value
                          </H6>
                        </View>
                        <View style={styles.gridContainer}>
                          {sensor.config && sensor.config.grids
                            ? sensor.config.grids.map(grid => (
                                <TouchableOpacity
                                  key={grid.id}
                                  id={grid.id}
                                  style={this._getGridStyle(grid)}
                                  onPressIn={() =>
                                    this.captureDeviceDataForGrid(grid, sensor)
                                  }
                                >
                                  <View
                                    style={[
                                      styles.gridData,
                                      this._getInnerGridStyle(grid)
                                    ]}
                                  >
                                    <H6 style={styles.gridText}>
                                      {' '}
                                      {grid.number}{' '}
                                    </H6>
                                  </View>
                                </TouchableOpacity>
                              ))
                            : null}
                        </View>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          )}
        </ScrollView>
        <ScrollView style={styles.footerButtonContainer} scrollEnabled={false}>
          {display.graph && datasetsAvailable.length > 0 ? (
            <View style={styles.footerInnerContainer}>
              {!graphs.startedAtLeastOnce ? null : (
                <Button
                  uppercase={false}
                  onPressIn={() => this.saveGraphData()}
                  style={styles.footerButton}
                >
                  Save graph data
                </Button>
              )}
              {graphs.started ? (
                <Button
                  type="success"
                  uppercase={false}
                  onPressIn={() => this.stopGraphs()}
                  style={styles.footerButton}
                >
                  Stop graphs
                </Button>
              ) : (
                <Button
                  type="success"
                  uppercase={false}
                  onPressIn={() => this.startGraphs()}
                  style={styles.footerButton}
                >
                  Start graphs
                </Button>
              )}
              {graphs.startedAtLeastOnce ? (
                <Button
                  type="danger"
                  uppercase={false}
                  onPressIn={() => this.resetGraphs()}
                  style={styles.footerButton}
                >
                  Reset graphs
                </Button>
              ) : null}
            </View>
          ) : null}
          {display.grid ? (
            <View>
              <Button
                uppercase={false}
                onPressIn={() => this.saveGridData()}
                style={styles.footerButton}
              >
                Save grid data
              </Button>
              <Button
                type="danger"
                uppercase={false}
                onPressIn={() => this.resetGrids()}
                style={styles.footerButton}
              >
                Reset grids
              </Button>
            </View>
          ) : null}
        </ScrollView>
      </View>
    );
  }
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: Colors.light
  },
  header: {
    paddingRight: 10,
    paddingLeft: 10
  },
  contentBox: {
    backgroundColor: Colors.white,
    margin: 10,
    marginTop: 5,
    marginBottom: 5,
    paddingRight: 5,
    paddingLeft: 5
  },
  twoColBox: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    // alignItems: 'stretch',
    justifyContent: 'space-between',
    width: '80%',
    paddingLeft: 5,
    paddingRight: 5
  },
  text: {
    color: Colors.secondary
  },
  textBold: {
    fontWeight: '600'
  },
  gridContainer: {
    flexWrap: 'wrap',
    flexDirection: 'row',
    justifyContent: 'center'
  },
  gridData: {
    width: '95%',
    minWidth: 55,
    minHeight: 80,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
    backgroundColor: Colors.valid,

    marginTop: 5,
    marginBottom: 5,
    marginRight: 10
  },
  gridText: {
    color: Colors.light,
    fontWeight: '600'
  },
  scrollContainer: {},
  footerButtonContainer: {
    padding: 10,
    height: 205
  },
  footerButton: {
    width: '100%',
    marginTop: 5
  }
};

const mapStateToProps = state => {
  return {
    connectedDevices: state.bluetooth.connectedDevices,
    user: state.currentUser,
    busy: state.meta.busy
  };
};

const mapDispatchToProps = dispatch => {
  return {
    onAppBusy: busy => dispatch(appBusy(busy)),
    onAppError: error => dispatch(appError(error))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(
  InvestigationDetailsComponent
);
