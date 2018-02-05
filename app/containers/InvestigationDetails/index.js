import React, { Component } from 'react';
import { connect, connectAdvanced } from 'react-redux';
import BleManager from 'react-native-ble-manager';
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

import Colors from '../../Theme/colors';
import * as utils from './utils';
import { appError, appBusy } from '../../Metastores/actions';

const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

export class InvestigationDetailsComponent extends Component<{}> {
  static navigationOptions = {
    title: 'Investigation Details'
  };

  state = {
    connectedDevices: {},
    investigation: {},
    sensors: [],
    graphs: {
      started: true,
      startedAtLeastOnce: true
    },
    sampleIntervalTime: 1000,
    display: {
      graph: false,
      grid: false,
      maxGridWidth: 100
    },
    datasetsAvailable: []
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
  }

  componentDidMount() {
    BleManager.checkState();
    this._bleEmitterEvent = bleManagerEmitter.addListener(
      'BleManagerDidUpdateValueForCharacteristic',
      this._subscribeToBleData.bind(this)
    );
  }

  _subscribeToBleData(data) {
    const { peripheral, characteristic, value } = data;

    switch (characteristic.toLowerCase()) {
      case SERVICES.Luxometer.DATA.toLowerCase():
        this._readLuxometerNotifications(peripheral, value);
        break;
      case SERVICES.Temperature.DATA.toLowerCase():
        this._readTemperatureNotifications(peripheral, value);
        break;
      case SERVICES.Barometer.DATA.toLowerCase():
        this._readBarometerNotifications(peripheral, value);
        break;
      case SERVICES.Humidity.DATA.toLowerCase():
        this._readHumidityNotifications(peripheral, value);
        break;
      case SERVICES.Accelerometer.DATA.toLowerCase():
        this._readMovementNotifications(peripheral, value);
        break;
      case SERVICES.IOBUTTON.DATA.toLowerCase():
        this._readSensorBtnNotifications(peripheral, value);
        break;
      default:
        break;
    }
  }

  componentWillUnmount() {
    this._unpingAllConnectedDevices();
    this._bleEmitterEvent.remove();
  }

  _unpingAllConnectedDevices() {
    const { connectedDevices } = this.props;

    Object.keys(connectedDevices).map(key => {
      const device = connectedDevices[key];
      this._stopNotifications(device);
    });
  }

  _startNotificationForService(device, service) {
    return BleManager.startNotification(device.id, service.UUID, service.DATA);
  }

  _writePeriodToDevice(device, service, sampleIntervalTime) {
    const period = [sampleIntervalTime / 10];
    return BleManager.write(device.id, service.UUID, service.PERIOD, period);
  }

  _writeToDevice(device, service, data) {
    return BleManager.write(device.id, service.UUID, service.CONFIG, data);
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
            // case 'accelerometer':
            // case 'gyroscope':
            // case 'magnetometer':
            //   this._startMovementNotifications(device);
            //   break;
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
    // GXLSB:GXMSB:GYLSB:GYMSB:GZLSB:GZMSB,
    // AXLSB:AXMSB:AYLSB:AYMSB:AZLSB:AZMSB
    const accX = data[6];
    // ax_temp / accDivisors.x;
    const accY = data[7];
    // ay_temp / accDivisors.y;
    const accZ = data[8];
    // az_temp / accDivisors.z;
    const accScalar = Math.sqrt(accX * accX + accY * accY + accZ * accZ);

    // Gyrometer calculations
    var gyroVal = 500 / 65536.0;
    var gyroX = data[0];
    // new DataView(data).getInt16(0, true) * gyroVal;
    var gyroY = data[1];
    // new DataView(data).getInt16(2, true) * gyroVal;
    var gyroZ = data[2];
    // new DataView(data).getInt16(4, true) * gyroVal;

    // Magnetometer calculations
    var magX = data[0];
    // new DataView(data).getInt16(12, true);
    var magY = data[0];
    // new DataView(data).getInt16(14, true);
    var magZ = data[0];
    // new DataView(data).getInt16(16, true);
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
    this._asyncStartNotificationsForService(service, device, [1, 0]);
  }

  _readHumidityNotifications(deviceId, data) {
    const sensorName = 'Humidity';
    // Humidity DATA
    // TempLSB:TempMSB:HumidityLSB:HumidityMSB
    const values = {
      rh: data[3],
      temp: data[1]
    };

    const displayVal = `${values.rh}% RH at ${values.temp.toFixed(3)} °C`;

    const dataValueMap = {
      '°C': values.temp,
      '% RH': values.rh
    };
    this._updateSensorValue(sensorName, deviceId, displayVal, dataValueMap);
  }

  _startHumidityNotifications(device) {
    const service = SERVICES.Humidity;
    this._asyncStartNotificationsForService(service, device, [1]);
  }

  _readBarometerNotifications(deviceId, data) {
    const sensorName = 'Barometer';
    // Barometer DATA
    // TempLSB:TempMSB(:TempEXt):PressureLSB:PressureMSB(:PressureExt)

    const values = {
      hPa: data[3],
      c: data[0]
    };

    const displayVal = `${values.hPa} hPa at ${values.c} °C`;

    const dataValueMap = {
      'Pressure (hPa)': values.hPa,
      '°C': values.c
    };
    this._updateSensorValue(sensorName, deviceId, displayVal, dataValueMap);
  }

  _startBarometerNotifications(device) {
    const service = SERVICES.Barometer;
    this._asyncStartNotificationsForService(service, device, [1]);
  }

  _readTemperatureNotifications(deviceId, data) {
    const sensorName = 'Temperature';
    // Temperature DATA
    // ObjectLSB:ObjectMSB:AmbientLSB:AmbientMSB
    const values = {
      amb: data[1],
      ir: data[2]
    };

    const displayVal = `${values.amb}°C [Amb], ${values.ir}°C [IR]`;

    const dataValueMap = {
      'Ambient Temperature (C)': values.amb,
      'Target (IR) Temperature (C)': values.ir / 10
    };
    this._updateSensorValue(sensorName, deviceId, displayVal, dataValueMap);
  }

  _startTemperatureNotifications(device) {
    const service = SERVICES.Temperature;
    this._asyncStartNotificationsForService(service, device, [1]);
  }

  _readLuxometerNotifications(deviceId, data) {
    const sensorName = 'Luxometer';
    // Luxometer DATA
    const values = {
      lux: data[0]
    };
    const displayVal = `${values.lux} lux`;
    const dataValueMap = {
      lux: values.lux
    };
    this._updateSensorValue(sensorName, deviceId, displayVal, dataValueMap);
  }

  _startLuxometerNotifications(device) {
    const service = SERVICES.Luxometer;
    this._asyncStartNotificationsForService(service, device, [1]);
  }

  _asyncStartNotificationsForService = async (
    service,
    device,
    activationBits
  ) => {
    const { sampleIntervalTime } = this.state;

    const { onAppError } = this.props;

    try {
      await this._startNotificationForService(device, service);
      // Write the delay time
      await this._writePeriodToDevice(device, service, sampleIntervalTime);
      if (activationBits) {
        // Switch on the sensor
        await this._writeToDevice(device, service, activationBits);
      }
    } catch (e) {
      onAppError('Unable to write to device! Please reconnect device', e);
    }
  };

  _readSensorBtnNotifications(deviceId, data) {
    const state = new Uint8Array(data);
    if (state.length > 0 && !!state[0]) {
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
    const connectedDeviceIds = Object.keys(connectedDevices);

    // Need recursive pings coz running a loop doesnt work
    const _pingRecursive = deviceIds => {
      const Id = deviceIds.pop();
      if (!Id) {
        return;
      }
      BleManager.retrieveServices(Id)
        .then(_ => {
          this.startNotifications(connectedDevices[Id]);
          _pingRecursive(deviceIds);
        })
        .catch(error => {
          onAppError(error);
        });
    };
    _pingRecursive(connectedDeviceIds);

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
    const { sensors } = this.state;
    this.stopGraphs();
    // Also reset the graph data
    sensors.map(sensor => {
      Object.keys(sensor.graph.type).map(graphKey => {
        sensor.graph.type[graphKey].data = [];
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

            sensor.graph[deviceId].rawValues.push(dataValueMap);
          });
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
      sensors
    } = this.state;
    const isConnectedToDevices = Object.keys(connectedDevices);
    const connectedText =
      Object.keys(connectedDevices).length > 0
        ? 'Connected!'
        : 'Not connected!';

    return (
      <View style={styles.container}>
        <FullScreenLoader visible={!!busy} />

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
