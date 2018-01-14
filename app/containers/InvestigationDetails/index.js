import React, { Component } from 'react';
import { connect, connectAdvanced } from 'react-redux';
import BleManager from 'react-native-ble-manager';

import * as _ from 'lodash';
import * as SERVICES from '../Bluetooth/services';

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

import Colors from '../../Theme/colors';
import * as utils from './utils';
import { networkError } from '../../Metastores/actions';

const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

export class InvestigationDetailsComponent extends Component<{}> {
  static navigationOptions = {
    title: 'Investigation Details'
  };

  static mapDataSetConfig = {
    drawTicks: false,
    fill: false,
    lineTension: 0.1,
    data: [],
    pointBorderWidth: 0.01,
    backgroundColor: Colors.white
  };

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
    charts: {}
  };

  componentWillMount() {
    const { navigation, connectedDevices } = this.props;
    const investigation = navigation.state.params.investigation;

    const _assignState = async tags => {
      const sampleIntervalTime = parseInt(investigation.sampleInterval);
      const sensors = await utils._getSensorTags(tags);

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
      case SERVICES.Luxometer.DATA:
        this._readLuxometerNotifications(peripheral, value);
        break;
      case SERVICES.Temperature.DATA:
        this._readTemperatureNotifications(peripheral, value);
        break;
      case SERVICES.Barometer.DATA:
        this._readBarometerNotifications(peripheral, value);
        break;
      case SERVICES.Humidity.DATA:
        this._readHumidityNotifications(peripheral, value);
        break;
      case SERVICES.Accelerometer.DATA:
        this._readMovementNotifications(peripheral, value);
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
    const { onNetworkError } = this.props;

    BleManager.startNotification(device.id, service.UUID, service.DATA)
      .then(e => {
        // Once the notifications have been started, listen to the handlerUpdate event
      })
      .catch(error => {
        onNetworkError(error.message);
      });
  }

  _writeToDevice(device, service, data) {
    const { onNetworkError } = this.props;

    BleManager.write(device.id, service.UUID, service.CONFIG, data)
      .then(e => {
        console.log('success', e);
        // Success
      })
      .catch(e => {
        console.log('failure', e);
        // onNetworkError('Unable to write to device! Please reconnect device');
      });
  }

  _stopNotifications(device) {
    const { sensors } = this.state;
    const { onNetworkError } = this.props;

    sensors.map(sensorTag => {
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
            break;
        }
        if (!service.UUID) {
          return;
        }
        BleManager.stopNotification(device.id, service.UUID, service.DATA)
          .then(e => {
            // Success
          })
          .catch(error => {
            onNetworkError(error.message);
          });
      }
    });
  }

  startNotifications(device) {
    const { sensors } = this.state;
    sensors.map(sensorTag => {
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
            // this._startTemperatureNotifications(device, 'Temperature');
            break;
          case 'barometer':
            // this._startBarometerNotifications(device, 'Barometer');
            break;
          case 'accelerometer':
          case 'gyroscope':
          case 'magnetometer':
            this._startMovementNotifications(
              device,
              'Accelerometer',
              'Gyroscope',
              'Magnetometer'
            );
            break;
          case 'humidity':
            // this._startHumidityNotifications(device, 'Humidity');
            break;
          case 'luxometer':
            // this._startLuxometerNotifications(device, 'Luxometer');
            break;

          default:
            break;
        }
      }
    });
  }

  _readMovementNotifications(device, data) {
    // Movement DATA
    // GXLSB:GXMSB:GYLSB:GYMSB:GZLSB:GZMSB,
    // AXLSB:AXMSB:AYLSB:AYMSB:AZLSB:AZMSB
    console.log('Movement', data);
  }

  _startMovementNotifications(
    device,
    accelerometerChartId,
    gyroscopeChartId,
    magnetometerChartId
  ) {
    const service = SERVICES.Accelerometer;
    const { sampleIntervalTime } = this.state;

    this._startNotificationForService(device, service);
    // Axis enable bits:gyro-z=0,gyro-y,gyro-x,acc-z=3,acc-y,acc-x,mag=6 Range: bit 8,9
    // Write the delay time
    // this._writeToDevice(device, service, [sampleIntervalTime * 10]);
    // Switch on the sensor
    this._writeToDevice(device, service, '0x3A');
  }

  _readHumidityNotifications(device, data) {
    // Humidity DATA
    // TempLSB:TempMSB:HumidityLSB:HumidityMSB
    const humidityValues = {
      RH: data[3],
      TEMP: data[1]
    };
    console.log('Humidity', humidityValues);
  }

  _startHumidityNotifications(device, humidityChartId) {
    const service = SERVICES.Humidity;
    const { sampleIntervalTime } = this.state;

    this._startNotificationForService(device, service);

    // Write the delay time
    this._writeToDevice(device, service, [sampleIntervalTime * 10]);
    // Switch on the sensor
    this._writeToDevice(device, service, [1]);
  }

  _readBarometerNotifications(device, data) {
    // Barometer DATA
    // TempLSB:TempMSB(:TempEXt):PressureLSB:PressureMSB(:PressureExt)
    console.log('barometer', data);
  }

  _startBarometerNotifications(device, barometerChartId) {
    const service = SERVICES.Barometer;
    const { sampleIntervalTime } = this.state;
    console.log(barometerChartId);
    this._startNotificationForService(device, service);

    // Write the delay time
    // this._writeToDevice(device, service, [sampleIntervalTime * 10]);
    // Switch on the sensor
    this._writeToDevice(device, service, '01:00');
  }

  _readTemperatureNotifications(device, data) {
    // Temperature DATA
    // ObjectLSB:ObjectMSB:AmbientLSB:AmbientMSB
    const temperatureValues = {
      'Ambient Temperature (C)': data[2],
      'Target (IR) Temperature (C)': data[3]
    };
    console.log('temperature', temperatureValues);
  }

  _startTemperatureNotifications(device, temperatureChartId) {
    const service = SERVICES.Temperature;
    const { sampleIntervalTime } = this.state;

    this._startNotificationForService(device, service);

    // Write the delay time
    this._writeToDevice(device, service, [sampleIntervalTime * 10]);
    // Switch on the sensor
    this._writeToDevice(device, service, [1]);
  }

  _readLuxometerNotifications(device, data) {
    // Luxometer DATA
    const luxValue = data[0];
    console.log('luxValue', luxValue, 'lux');
  }

  _startLuxometerNotifications(device, luxometerChartId) {
    const service = SERVICES.Luxometer;
    const { sampleIntervalTime } = this.state;

    this._startNotificationForService(device, service);

    // Write the delay time
    this._writeToDevice(device, service, [sampleIntervalTime * 10]);
    // Switch on the sensor
    this._writeToDevice(device, service, [1]);
  }

  initialiseSensorTags(sensors) {
    const { connectedDevices, onNetworkError } = this.props;

    Object.keys(connectedDevices).map(Id => {
      BleManager.retrieveServices(Id)
        .then(_ => {
          this.startNotifications(connectedDevices[Id]);
          // this.captureOnClick(device);
        })
        .catch(error => {
          onNetworkError(error.message);
        });
    });

    sensors.map(sensorTag => {
      sensorTag = this.initialiseChart(sensorTag, connectedDevices);
      sensorTag = this.initialiseGrid(sensorTag, connectedDevices);
      return sensorTag;
    });
    this.setState({
      sensors
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
      { cancelable: true }
    );
  }

  _resetGraphs() {
    this.stopGraphs();
    // Also reset the graph data
  }

  _getChartDatasets(chart, sensor, deviceId) {
    const sensorParams = sensor.config.parameters;
    const mapDataSetConfig = this.mapDataSetConfig;

    const xyzDataSet = [
      {
        mapDataSetConfig,
        borderColor: 'red',
        label: `X-${deviceId}`,
        name: 'X',
        deviceId
      },
      {
        mapDataSetConfig,
        borderColor: 'red',
        label: `Y-${deviceId}`,
        name: 'Y',
        deviceId
      },
      {
        mapDataSetConfig,
        borderColor: 'red',
        label: `Z-${deviceId}`,
        name: 'Z',
        deviceId
      }
    ];

    const scalarDataSet = [
      {
        mapDataSetConfig,
        borderColor: 'red',
        label: `Scalar Value-${deviceId}`,
        name: 'Scalar Value',
        deviceId
      }
    ];

    switch (chart.toLowerCase()) {
      case 'temperature':
        let tempDataSets = [];

        let ambientDataSet = {
          mapDataSetConfig,
          borderColor: 'red',
          label: `Ambient Temperature (C)-${deviceId}`,
          name: 'Ambient Temperature (C)',
          deviceId
        };

        let irDataSet = {
          mapDataSetConfig,
          borderColor: 'red',
          label: `Target (IR) Temperature (C)-${deviceId}`,
          name: 'Target (IR) Temperature (C)',
          deviceId
        };

        if (sensorParams.ambient) {
          tempDataSets.push(ambientDataSet);
        }

        if (sensorParams.IR) {
          tempDataSets.push(irDataSet);
        }

        return tempDataSets;

      case 'barometer':
        return [
          {
            mapDataSetConfig,
            borderColor: 'red',
            label: `Pressure (hPa)-${deviceId}`,
            name: 'Pressure (hPa)',
            deviceId
          }
        ];

      case 'luxometer':
        return [
          {
            mapDataSetConfig,
            borderColor: 'red',
            label: `lux-${deviceId}`,
            name: 'lux',
            deviceId
          }
        ];

      // Accelerometer and magnetometer share similar data set config
      case 'accelerometer':
      case 'magnetometer':
        let xyzScalarDataSet = [];

        if (sensorParams.xyz) {
          xyzScalarDataSet = xyzScalarDataSet.concat(xyzDataSet);
        }

        if (sensorParams.scalar) {
          xyzScalarDataSet = xyzScalarDataSet.concat(scalarDataSet);
        }

        return xyzScalarDataSet;

      // Gyroscope shares the same xyzDataSet
      case 'gyroscope':
        return xyzDataSet;

      case 'humidity':
        return [
          {
            mapDataSetConfig,
            borderColor: 'red',
            label: `RH-${deviceId}`,
            name: 'RH',
            deviceId
          }
        ];
    }
  }

  _getChartType(chart, ctx, sensor, devices) {
    if (!ctx || !chart) {
      return;
    }
    // this.mapOptions.title.text = sensor.config.graph.graphTitle;
    switch (chart.toLowerCase()) {
      case 'accelerometer':
      case 'barometer':
      case 'gyroscope':
      case 'humidity':
      case 'luxometer':
      case 'magnetometer':
      case 'temperature':
        const { datasetsAvailable } = this.state;
        let datasets = [];
        const getDatasets = async () => {
          await Object.keys(devices).map(deviceId => {
            datasets = datasets.concat(
              this._getChartDatasets(chart, sensor, deviceId)
            );
          });
        };

        getDatasets();
        datasetsAvailable = datasetsAvailable.concat(datasets);

        this.setState({
          datasetsAvailable
        });

        return chart;
      // // These all above use the same graph
      // return new Chart(ctx, {
      //   type: 'line',
      //   data: {
      //     datasets
      //   },
      //   options: this.mapOptions
      // });
    }
  }

  // Initialise a chart only once.
  // The datasets need to be configured per device though.
  initialiseChart(sensor, devices) {
    const { display, charts } = this.state;
    if (!!sensor.config.graph.display || !!sensor.config.graph.graphdisplay) {
      const chartId = `${sensor.name}`;
      const ctx = chartId || document.getElementById(chartId);
      charts[chartId] = this._getChartType(chartId, ctx, sensor, devices);

      display.graph = true;
      this.setState({
        display,
        charts
      });
      return sensor;
    } else {
      return sensor;
    }
  }

  _getGridStyle() {
    const { display } = this.state;
    return {
      width: `${display.maxGridWidth}%`,
      height: `${display.maxGridWidth}%`
    };
  }

  initialiseGrid(sensor, devices) {
    const { display } = this.state;
    if (!!sensor.config.grid.display || !!sensor.config.grid.griddisplay) {
      display.grid = true;
      display.maxGridWidth = `${90 / parseInt(sensor.config.grid.columns)}`;
      const chartId = `${sensor.name}-grid`;
      const countX = sensor.config.grid.columns || 1;
      const countY = sensor.config.grid.rows || 1;

      const numOfGrids = parseInt(countX) * parseInt(countY);

      let grids = [];

      _.times(numOfGrids, count => {
        grids.push({
          id: `${chartId}-${count + 1}`,
          number: count + 1
        });
      });

      sensor.config.grids = grids;

      const { datasetsAvailable } = this.state;
      // Need datasets to decide if the grids can work
      let datasets = [];
      const chart = `${sensor.name}`;
      const getDatasets = async () => {
        await Object.keys(devices).map(deviceId => {
          datasets = datasets.concat(
            this._getChartDatasets(chart, sensor, deviceId)
          );
        });
      };

      getDatasets();
      datasetsAvailable = datasetsAvailable.concat(datasets);
      this.setState({
        display,
        datasetsAvailable
      });
      return sensor;
    } else {
      return sensor;
    }
  }

  render() {
    const { navigation } = this.props;
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
                No sensors enabled to run the investigation!
              </H5>
              <H5 style={styles.text}>
                Please recheck if at least one parameter (eg IR) has been
                enabled for the chosen sensor (eg Temperature).
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
                        <H6 style={styles.text}>Sensor parameters:</H6>
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
                            <H6 style={styles.text}>Device {deviceId}</H6>
                            <H6 style={[styles.text, styles.textBold]}>
                              {connectedDevices[deviceId].value}
                            </H6>
                          </View>
                        ))}

                    {!display.graph ? null : (
                      <View>
                        <H6>{sensor.name} graph</H6>
                      </View>
                    )}

                    {!display.grid ? null : (
                      <View>
                        <View>
                          <H6 style={styles.text}>
                            Press any button on sensor tag or tap on grid to
                            record a value
                          </H6>
                          <H6 style={styles.text}>
                            Please note : Tapping on a grid will rewrite any
                            existing value
                          </H6>
                        </View>
                        <View style={styles.gridContainer}>
                          {sensor.config && sensor.config.grids
                            ? sensor.config.grids.map(grid => (
                                <TouchableOpacity
                                  key={grid.id}
                                  id={grid.id}
                                  style={this._getGridStyle()}
                                  onPress={() => {}}
                                >
                                  <View style={styles.gridData}>
                                    <H6 style={styles.gridText}>
                                      {grid.number}
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
              {!graphs.startedAtLeastOnce ? (
                <Button
                  uppercase={false}
                  onPress={() => navigation.navigate('BluetoothConnect')}
                  style={styles.footerButton}
                >
                  Sensor Tags
                </Button>
              ) : (
                <Button
                  uppercase={false}
                  onPress={() => {}}
                  style={styles.footerButton}
                >
                  Save graph data
                </Button>
              )}

              {graphs.started ? (
                <View>
                  <Button
                    type="success"
                    uppercase={false}
                    onPress={() => this.stopGraphs()}
                    style={styles.footerButton}
                  >
                    Stop graphs
                  </Button>
                  <Button
                    type="danger"
                    uppercase={false}
                    onPress={() => this.resetGraphs()}
                    style={styles.footerButton}
                  >
                    Reset graphs
                  </Button>
                </View>
              ) : (
                <Button
                  type="success"
                  uppercase={false}
                  onPress={() => this.startGraphs()}
                  style={styles.footerButton}
                >
                  Start graphs
                </Button>
              )}
            </View>
          ) : null}

          {display.grid && datasetsAvailable.length > 0 ? (
            <View>
              <Button
                uppercase={false}
                onPress={() => {}}
                style={styles.footerButton}
              >
                Save grid data
              </Button>
              <Button
                type="danger"
                uppercase={false}
                onPress={() => {}}
                style={styles.footerButton}
              >
                Reset grids
              </Button>
              <Button
                uppercase={false}
                onPress={() => navigation.navigate('BluetoothConnect')}
                style={styles.footerButton}
              >
                Sensor Tags
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
    paddingRight: 10,
    paddingLeft: 10
  },
  twoColBox: {
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'space-between',
    maxWidth: '80%'
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
    connectedDevices: state.bluetooth.connectedDevices
  };
};

const mapDispatchToProps = dispatch => {
  return {
    onNetworkError: error => dispatch(networkError(error))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(
  InvestigationDetailsComponent
);
