// Angular
import { Component, ChangeDetectorRef } from "@angular/core";
import { Subscription } from "rxjs/Subscription";
import "rxjs/add/operator/debounceTime";
// Ionic
import { NavParams, NavController, LoadingController } from "ionic-angular";
// Others
import * as _ from "lodash";
import { Chart } from "chart.js";
// SnapApp
import { ConnectService } from "../connect";
import { ToastService, FileService } from "../core/service";
import {
  Investigation,
  ISensor,
  ISensorTag,
  ColorCode
} from "./investigation-details.model";
import * as SERVICES from "../connect/connect.config";

@Component({
  selector: "investigation-details-page-component",
  templateUrl: "investigation-details.view.html",
  styles: ["./investigation-details.styles.scss"]
})
export class InvestigationDetailsPageComponent {
  investigation: Investigation;
  sensors: any[] = [];
  connectedDevices: any[] = [];
  graphsStarted: boolean = false;
  graphsStartedAtLeastOnce: boolean = false;
  subscriptions: Subscription[] = [];
  sampleIntervalTime: number = 1000;
  maxGridWidth: string = "20vw";
  display: any = {
    graph: false,
    grid: false
  };

  mapDataSetConfig = {
    drawTicks: false,
    fill: false,
    lineTension: 0.2,
    data: [],
    pointBorderWidth: 0.1,
    backgroundColor: ColorCode.WHITE
  };

  mapOptions = {
    title: {
      display: true,
      text: "Graph"
    },
    scales: {
      yAxes: [
        {
          ticks: {
            beginAtZero: false
          },
          scaleLabel: {
            display: true
          }
        }
      ],
      xAxes: [
        {
          display: false
        }
      ]
    },
    legend: {
      display: true,
      position: "bottom"
    },
    elements: {
      line: {
        tension: 0 // disables bezier curves for high performance
      }
    }
  };

  charts: any = {};

  constructor(
    private _connectService: ConnectService,
    private _loadingCtrl: LoadingController,
    private cdRef: ChangeDetectorRef,
    private _navCtrl: NavController,
    private _navParams: NavParams,
    private _toastService: ToastService,
    private _fileService: FileService
  ) {
    this.investigation = this._navParams.get("investigation");
  }

  ionViewWillLeave() {
    this.connectedDevices.map(device => {
      this.stopNotifications(device);
    });

    this.subscriptions.map(subs => {
      if (subs) {
        subs.unsubscribe();
      }
    });

    this.cdRef.detach();
  }

  // LifeCycle methods
  ionViewWillEnter() {
    this.sampleIntervalTime = parseInt(this.investigation.sampleInterval);
    const sensorTags = this.investigation.sensorTags;
    const getSensorTags = async () => {
      await this.getSensorTags(sensorTags);
    };
    getSensorTags();
    // If bluetooth is enabled, start notifications
    this.checkIfBluetoothEnabled();
  }

  ionViewDidEnter() {
    this.sensors.forEach(sensorTag => {
      this.initialiseChart(sensorTag);
      this.initialiseGrid(sensorTag);
    });
  }

  // Other methods
  private initialiseChart(sensor) {
    if (!!sensor.config.graph.display || !!sensor.config.graph.graphdisplay) {
      this.display.graph = true;
      const chartId = `${sensor.name}`;
      const ctx = document.getElementById(chartId);
      this.charts[chartId] = this.getChartType(chartId, ctx, sensor);
    }
  }

  private initialiseGrid(sensor) {
    if (!!sensor.config.grid.display || !!sensor.config.grid.griddisplay) {
      this.display.grid = true;
      const chartId = `${sensor.name}-grid`;

      this.maxGridWidth = `${78 / parseInt(sensor.config.grid.columns)}vw`;

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
      return;
    }
  }

  // Capture data for grid
  captureData(grid: any, deviceId: string, sensor: any) {
    if (!sensor.value || !sensor.value[deviceId]) {
      return;
    }

    if (!grid.value) {
      grid.value = {};
    }
    if (!grid.value[deviceId]) {
      grid.value[deviceId] = {};
    }

    // Attach the rawValues to the grid
    grid.rawValue = sensor.rawValue;

    grid.value[deviceId] = {
      value: sensor.value[deviceId]
    };
    this.cdRef.detectChanges();
  }

  captureDeviceDataForGrid(currentGrid: any = {}, currentSensor: any = {}) {
    this.connectedDevices.map(device => {
      if (currentGrid && currentGrid.id && currentSensor && currentSensor) {
        this.captureData(currentGrid, device.id, currentSensor);
      } else {
        this.sensors.map(sensor => {
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
                keys.length >= this.connectedDevices.length
              ) {
                return false;
              } else {
                return true;
              }
              // return !grid.value;
            });

            if (grids.length > 0) {
              this.captureData(grids[0], device.id, sensor);
            }
          }
        });
      }
    });
  }

  // Capture data for grid on click on device
  // When a button is pressed on any device capture data for
  // all the devices
  private captureOnClick(device: any) {
    const service = SERVICES.IOBUTTON;

    const subscription: Subscription = this._connectService
      .readData(device.id, service)
      .subscribe(
        data => {
          const state = new Uint8Array(data);
          if (state.length > 0 && !!state[0]) {
            this.captureDeviceDataForGrid();
          }
        },
        error => {
          this._toastService.present({
            message:
              "Unable to detect device! Please retry bluetooth connection.",
            duration: 3000
          });
        }
      );

    this.subscriptions.push(subscription);
  }

  private getConnectedDevices(): Promise<any> {
    return this._connectService.getLastDevices().then(devices => {
      this.connectedDevices = devices;

      devices.map(device => {
        this.startNotifications(device);
        // Start the capture on click
        this.captureOnClick(device);
      });
    });
  }

  // Checks if the bluetooth is enabled.
  // If yes, scan for devices
  // Else, throw an error
  private checkIfBluetoothEnabled() {
    this._connectService
      .isBluetoothEnabled()
      .then(connected => {
        this._connectService.getConnectedDevices().then(_ => {
          this.getConnectedDevices();
        });
      })
      .catch(error => {
        this._toastService.present({
          message: "Please enable bluetooth!",
          duration: 3000
        });
      });
  }

  private getSensorTags(sensorTags) {
    this.sensors = [];
    for (let id in sensorTags) {
      const sensorTag: ISensorTag = sensorTags[id];

      // Fetch the sensor tags which have been switched "on"
      if (!!sensorTag.connect) {
        const sensors: any = sensorTag.sensors;

        // Fetch each sensor from the sensor tags config
        for (let iSensor in sensors) {
          const sensor: ISensor = sensors[iSensor];
          // Fetch only the sensors which have been switched "on"
          if (
            sensor.data.display ||
            sensor.graph.graphdisplay ||
            sensor.grid.griddisplay
          ) {
            this.sensors.push({
              name: iSensor,
              config: sensor
            });
          }
        }
      }
    }
  }

  /**
   * HOW IT WORKS
   *
   * Upon entering this page, check if any device is connected.
   * Get all the services/sensors for the experiment.
   * Initialise the charts object with all the graphs to be used for each service.
   *
   * If a device is connected start the notifications for all the services requested.
   * If no device is connected ask the user to connect a device
   * Once a device is connected just start the notifications (that'd happen automatically once user comes back to this page)
   *
   * DO THIS FOR ALL THE DEVICES
   *
   * Starting notifications would mean that the data from sensor tags has started coming in.
   * Stopping notifications would stop the notification for all services
   *
   * Upon starting graphs turn the graphsStarted flag on.
   * Upon stop graphs turn the graphsStarted flag off.
   * Upon reset graphs turn the graphsStarted flag off and also clear off the graphs.
   *
   */

  private getChartDatasets(chart: string, sensor: any): Array<any> {
    const mapDataSetConfig = this.mapDataSetConfig;
    const sensorParams = sensor.config.parameters;

    const xyzDataSet = [
      {
        mapDataSetConfig,
        borderColor: ColorCode.RED,
        label: "X"
      },
      {
        mapDataSetConfig,
        borderColor: ColorCode.BLUE,
        label: "Y"
      },
      {
        mapDataSetConfig,
        borderColor: ColorCode.GREEN,
        label: "Z"
      }
    ];

    const scalarDataSet = [
      {
        mapDataSetConfig,
        borderColor: ColorCode.BLACK,
        label: "Scalar Value"
      }
    ];

    switch (chart.toLowerCase()) {
      case "temperature":
        let tempDataSets = [];

        let ambientDataSet = {
          mapDataSetConfig,
          borderColor: ColorCode.RED,
          label: "Ambient Temperature (C)"
        };

        let irDataSet = {
          mapDataSetConfig,
          borderColor: ColorCode.GREEN,
          label: "Target (IR) Temperature (C)"
        };

        if (sensorParams.ambient) {
          tempDataSets.push(ambientDataSet);
        }

        if (sensorParams.IR) {
          tempDataSets.push(irDataSet);
        }

        return tempDataSets;

      case "barometer":
        return [
          {
            mapDataSetConfig,
            borderColor: ColorCode.RED,
            label: "Pressure (hPa)"
          }
        ];

      case "luxometer":
        return [
          {
            mapDataSetConfig,
            borderColor: ColorCode.RED,
            label: "lux"
          }
        ];

      // Accelerometer and magnetometer share similar data set config
      case "accelerometer":
      case "magnetometer":
        let xyzScalarDataSet = [];

        if (sensorParams.xyz) {
          xyzScalarDataSet = xyzScalarDataSet.concat(xyzDataSet);
        }

        if (sensorParams.scalar) {
          xyzScalarDataSet = xyzScalarDataSet.concat(scalarDataSet);
        }

        return xyzScalarDataSet;

      // Gyroscope shares the same xyzDataSet
      case "gyroscope":
        return xyzDataSet;

      case "humidity":
        return [
          {
            mapDataSetConfig,
            borderColor: ColorCode.RED,
            label: "RH"
          }
        ];
    }
  }

  private getChartType(chart: string, ctx: any, sensor: any) {
    this.mapOptions.title.text = sensor.config.graph.graphTitle;
    switch (chart.toLowerCase()) {
      case "accelerometer":
      case "barometer":
      case "gyroscope":
      case "humidity":
      case "luxometer":
      case "magnetometer":
      case "temperature":
        // These all above use the same graph
        return new Chart(ctx, {
          type: "line",
          data: {
            datasets: this.getChartDatasets(chart, sensor)
          },
          options: this.mapOptions
        });
    }
  }

  stopGraphs() {
    this.graphsStarted = false;
  }

  startGraphs() {
    this.graphsStarted = true;
    this.graphsStartedAtLeastOnce = true;
  }

  resetGraphs() {
    this.stopGraphs();

    _.keys(this.charts).forEach(chartId => {
      this.charts[chartId].reset();
      this.charts[chartId].clear();
      this.charts[chartId].data.datasets.forEach(dataset => {
        dataset.data = [];
      });
      // Also delete labels to reset the data completely
      this.charts[chartId].data.labels = [];
    });
  }

  resetGrid() {
    this.sensors.map(sensor => {
      sensor.config.grids.map(grid => {
        grid.value = null;
      });
    });
  }

  private addData(chart: any, label: string, data: any, dataValueMap: any) {
    chart.data.labels.push({
      deviceId: label,
      dataValueMap: dataValueMap,
      key: chart.data.datasets[0].label
    });

    if (typeof data === "string" || typeof data === "number") {
      chart.data.datasets.forEach(dataset => {
        dataset.data.push(data);
      });
    } else {
      chart.data.datasets.forEach(dataset => {
        _.keys(data).map(key => {
          if (key == dataset.label) {
            dataset.data.push(data[key]);
          }
        });
      });
    }

    chart.update();
  }

  // Draw graphs
  drawGraphs(deviceId: string, chart: any, value: any, dataValueMap: any) {
    if (this.graphsStarted && chart) {
      this.addData(chart, deviceId, value, dataValueMap);
    }
  }

  startNotifications(device: any) {
    this.sensors.forEach(sensorTag => {
      const config: any = sensorTag.config;

      // if the displays are off, do not start notifications
      if (
        !!config.graph.display ||
        !!config.graph.graphdisplay ||
        !!config.grid.display ||
        !!config.grid.griddisplay
      ) {
        switch (sensorTag.name.toLowerCase()) {
          case "temperature":
            this.temperatureNotifications(device, "Temperature");
            break;
          case "barometer":
            this.barometerNotifications(device, "Barometer");
            break;
          case "accelerometer":
          case "gyroscope":
          case "magnetometer":
            this.accGyroMagNotifications(
              device,
              "Accelerometer",
              "Gyroscope",
              "Magnetometer"
            );
            break;
          case "humidity":
            this.humidityNotifications(device, "Humidity");
            break;
          case "luxometer":
            this.luxometerNotifications(device, "Luxometer");
            break;

          default:
            break;
        }
      }
    });
  }

  // Also send in the raw values for each sensor
  private updateSensorValue(
    device: any,
    name: string,
    value: string,
    dataValueMap: any
  ) {
    this.sensors.map(sensor => {
      if (sensor.name === name) {
        if (!sensor.value) {
          sensor.value = {};
        }
        if (!sensor.rawValue) {
          sensor.rawValue = {};
        }

        sensor.value[device.id] = value;
        sensor.rawValue[device.id] = dataValueMap;
        this.cdRef.detectChanges();
      }
    });
  }

  private luxometerNotifications(device: any, luxometerChartId: string) {
    const service = SERVICES.Luxometer;
    const subscription: Subscription = this._connectService
      .readData(device.id, service)
      // .debounceTime(this.sampleIntervalTime)
      .subscribe(
        data => {
          // Luxometer DATA

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

          this.updateSensorValue(device, luxometerChartId, `${luxValue} lux`, {
            lux: luxValue
          });

          const luxometerChart = this.charts[luxometerChartId];

          this.drawGraphs(device.id, luxometerChart, luxValue, {
            lux: luxValue
          });
        },
        error => {
          this._toastService.present({
            message:
              "Unable to read luxometer values! Please reconnect device.",
            duration: 3000
          });
        }
      );

    const luxometerConfig = new Uint8Array(1);
    luxometerConfig[0] = 0x01;
    this._connectService
      .writeToDevice(device.id, service, luxometerConfig.buffer)
      .then(e => {
        // Success
      })
      .catch(e => {
        this._toastService.present({
          message: "Unable to write to device! Please reconnect device.",
          duration: 3000
        });
      });

    this.subscriptions.push(subscription);
  }

  private humidityNotifications(device: any, humidityChartId: string) {
    const service = SERVICES.Humidity;

    const subscription: Subscription = this._connectService
      .readData(device.id, service)
      .debounceTime(this.sampleIntervalTime)
      .subscribe(
        data => {
          // HUMIDITY DATA
          const state = new DataView(data).getUint16(0, true);
          const roomTemp = -46.85 + 175.72 / 65536.0 * state;

          // Calculate the relative humidity.
          const temp = new DataView(data).getUint16(0, true);
          const hData = temp & ~0x03;
          const RHValue = -6.0 + 125.0 / 65536.0 * hData;

          const humidityValues = {
            RH: RHValue,
            TEMP: roomTemp
          };

          this.updateSensorValue(
            device,
            humidityChartId,
            `${humidityValues.RH.toFixed(
              3
            )}% RH at ${humidityValues.TEMP.toFixed(3)} °C`,
            {
              "% RH": humidityValues.RH.toFixed(3),
              "°C": humidityValues.TEMP.toFixed(3)
            }
          );

          const humidityChart = this.charts[humidityChartId];

          this.drawGraphs(device.id, humidityChart, humidityValues.RH, {
            "% RH": humidityValues.RH.toFixed(3),
            "°C": humidityValues.TEMP.toFixed(3)
          });
        },
        error => {
          this._toastService.present({
            message: "Unable to read humidity values! Please reconnect device.",
            duration: 3000
          });
        }
      );

    const humidityConfig = new Uint8Array(1);
    humidityConfig[0] = 0x01;
    // Switch on sensor
    this._connectService
      .writeToDevice(device.id, service, humidityConfig.buffer)
      .then(e => {
        // Success
      })
      .catch(e => {
        this._toastService.present({
          message:
            "Problem with bluetooth connection! Please reconnect device.",
          duration: 3000
        });
      });

    this.subscriptions.push(subscription);
  }

  private accGyroMagNotifications(
    device: any,
    accelerometerChartId: string,
    gyroscopeChartId: string,
    magnetometerChartId: string
  ) {
    const service = SERVICES.Accelerometer;

    const subscription: Subscription = this._connectService
      .readData(device.id, service)
      // .debounceTime(this.sampleIntervalTime)
      .subscribe(
        data => {
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
          //console.log("DEBUG - accelerometer values read are :" + ax_temp + ", " + ay_temp + ", " +az_temp  )
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
            "Scalar Value": accScalar
          };

          const magnetometerValues = {
            X: magX,
            Y: magY,
            Z: magZ,
            "Scalar Value": magScalar
          };

          const accelerometerChart = this.charts[accelerometerChartId];
          const gyroscopeChart = this.charts[gyroscopeChartId];
          const magnetometerChart = this.charts[magnetometerChartId];

          this.drawGraphs(device.id, accelerometerChart, accelerometerValues, {
            X: accelerometerValues.X.toFixed(3),
            Y: accelerometerValues.Y.toFixed(3),
            Z: accelerometerValues.Z.toFixed(3),
            "Scalar Value": accelerometerValues["Scalar Value"].toFixed(3)
          });
          this.drawGraphs(device.id, gyroscopeChart, gyroscopeValues, {
            X: gyroscopeValues.X.toFixed(3),
            Y: gyroscopeValues.Y.toFixed(3),
            Z: gyroscopeValues.Z.toFixed(3)
          });
          this.drawGraphs(device.id, magnetometerChart, magnetometerValues, {
            X: magnetometerValues.X.toFixed(3),
            Y: magnetometerValues.Y.toFixed(3),
            Z: magnetometerValues.Z.toFixed(3),
            "Scalar Value": magnetometerValues["Scalar Value"].toFixed(3)
          });

          this.updateSensorValue(
            device,
            gyroscopeChartId,
            `X : ${gyroscopeValues.X.toFixed(
              3
            )}, Y : ${gyroscopeValues.Y.toFixed(
              3
            )}, Z : ${gyroscopeValues.Z.toFixed(3)}`,
            {
              X: gyroscopeValues.X.toFixed(3),
              Y: gyroscopeValues.Y.toFixed(3),
              Z: gyroscopeValues.Z.toFixed(3)
            }
          );
          this.updateSensorValue(
            device,
            accelerometerChartId,
            `X : ${accelerometerValues.X.toFixed(
              3
            )}G, Y : ${accelerometerValues.Y.toFixed(
              3
            )}G, Z : ${accelerometerValues.Z.toFixed(
              3
            )}G, Scalar Value : ${accelerometerValues["Scalar Value"].toFixed(
              3
            )}G`,
            {
              X: accelerometerValues.X.toFixed(3),
              Y: accelerometerValues.Y.toFixed(3),
              Z: accelerometerValues.Z.toFixed(3),
              "Scalar Value": accelerometerValues["Scalar Value"].toFixed(3)
            }
          );
          this.updateSensorValue(
            device,
            magnetometerChartId,
            `X : ${magnetometerValues.X.toFixed(
              3
            )}μT,  Y : ${magnetometerValues.Y.toFixed(
              3
            )}μT, Z : ${magnetometerValues.Z.toFixed(
              3
            )}μT, Scalar Value : ${magnetometerValues["Scalar Value"].toFixed(
              3
            )}μT`,
            {
              X: magnetometerValues.X.toFixed(3),
              Y: magnetometerValues.Y.toFixed(3),
              Z: magnetometerValues.Z.toFixed(3),
              "Scalar Value": magnetometerValues["Scalar Value"].toFixed(3)
            }
          );
        },
        error => {
          this._toastService.present({
            message:
              "Unable to read accelerometer values! Please reconnect device.",
            duration: 3000
          });
        }
      );

    // turn accelerometer on
    const configData = new Uint16Array(1);
    //Turn on gyro, accel, and mag, 2G range, Disable wake on motion
    configData[0] = 0x007f;
    this._connectService
      .writeToDevice(device.id, service, configData.buffer)
      .then(e => {
        // Success
      })
      .catch(e => {
        this._toastService.present({
          message: "Unable to write to device! Please reconnect device.",
          duration: 3000
        });
      });

    // turn accelerometer period on
    const periodData = new Uint8Array(1);
    periodData[0] = 0x0a;
    this._connectService
      .writeToDevice(device.id, service, configData.buffer)
      .then(e => {
        // Success
      })
      .catch(e => {
        this._toastService.present({
          message: "Unable to write to device! Please reconnect device.",
          duration: 3000
        });
      });

    this.subscriptions.push(subscription);
  }

  private temperatureNotifications(device: any, temperatureChartId: string) {
    const service = SERVICES.Temperature;

    const subscription: Subscription = this._connectService
      .readData(device.id, service)
      .debounceTime(this.sampleIntervalTime)
      .subscribe(
        data => {
          // Calculate target temperature (Celsius).
          const temp = new DataView(data).getUint16(0, true);
          const targetTemp = (temp >> 2) * 0.03125;
          // Calculate ambient temp
          const ambientTemp = new DataView(data).getUint16(2, true) / 128.0;

          const temperatureValues = {
            "Ambient Temperature (C)": ambientTemp,
            "Target (IR) Temperature (C)": targetTemp
          };

          this.updateSensorValue(
            device,
            temperatureChartId,
            `${temperatureValues["Ambient Temperature (C)"].toFixed(
              3
            )} °C [Amb], ${temperatureValues[
              "Target (IR) Temperature (C)"
            ].toFixed(3)} °C [IR]`,
            {
              "Ambient Temperature (°C)": temperatureValues[
                "Ambient Temperature (C)"
              ].toFixed(3),
              "Target (IR) Temperature (°C)": temperatureValues[
                "Target (IR) Temperature (C)"
              ].toFixed(3)
            }
          );

          const temperatureChart = this.charts[temperatureChartId];

          this.drawGraphs(device.id, temperatureChart, temperatureValues, {
            "Ambient Temperature (°C)": temperatureValues[
              "Ambient Temperature (C)"
            ].toFixed(3),
            "Target (IR) Temperature (°C)": temperatureValues[
              "Target (IR) Temperature (C)"
            ].toFixed(3)
          });
        },
        error => {
          this._toastService.present({
            message:
              "Unable to read temperature values! Please reconnect device.",
            duration: 3000
          });
        }
      );

    /**
       * We must send some data to write to the device before
       * we can start receiving any notifications.
       * Also, it seems like the barometerConfig should hold
       * some unique value. Currently any value seems to work
       *
       */
    const tempConfig = new Uint8Array(1);
    tempConfig[0] = 0x01;
    this._connectService
      .writeToDevice(device.id, service, tempConfig.buffer)
      .then(e => {
        // Success
      })
      .catch(e => {
        this._toastService.present({
          message: "Unable to write to device! Please reconnect device.",
          duration: 3000
        });
      });

    this.subscriptions.push(subscription);
  }

  private barometerNotifications(device: any, barometerChartId: string) {
    const service = SERVICES.Barometer;
    const subscription: Subscription = this._connectService
      .readData(device.id, service)
      // .debounceTime(this.sampleIntervalTime)
      .subscribe(
        data => {
          // BAROMETER DATA
          const flTempData = new DataView(data).getUint32(0, true);
          const flPressureData = new DataView(data).getUint32(2, true);

          const tempValue = (flTempData & 0x00ffffff) / 100.0;
          const pressureValue = ((flPressureData >> 8) & 0x00ffffff) / 100.0;

          this.updateSensorValue(
            device,
            barometerChartId,
            `${pressureValue} hPa at ${tempValue} °C`,
            {
              hPa: pressureValue,
              "°C": tempValue
            }
          );

          const barometerChart = this.charts[barometerChartId];

          this.drawGraphs(device.id, barometerChart, pressureValue, {
            hPa: pressureValue,
            "°C": tempValue
          });
        },
        error => {
          this._toastService.present({
            message:
              "Unable to read barometer values! Pleas ve reconnect device.",
            duration: 3000
          });
        }
      );

    /**
       * We must send some data to write to the device before
       * we can start receiving any notifications.
       * Also, it seems like the barometerConfig should hold
       * some unique value. Currently any value seems to work
       *
       */
    const barometerConfig = new Uint8Array(1);
    barometerConfig[0] = 0x01;
    this._connectService
      .writeToDevice(device.id, service, barometerConfig.buffer)
      .then(e => {
        // Success
      })
      .catch(e => {
        this._toastService.present({
          message: "Unable to write to device! Please reconnect device.",
          duration: 3000
        });
      });

    this.subscriptions.push(subscription);
  }

  stopNotifications(device: any) {
    this.graphsStarted = false;

    this.sensors.map(sensor => {
      const service = SERVICES[sensor.name];

      if (service && service.UUID) {
        this._connectService
          .stopReadingData(device, service)
          .then(e => {
            // Success
          })
          .catch(e => {
            // Throws some weird error but still stops the notifications.
          });
      }
      // Stop the capture on click too
      const config: any = sensor.config;
      if (!!config.grid.display || !!config.grid.griddisplay) {
        const service = SERVICES.IOBUTTON;

        this._connectService
          .stopReadingData(device, service)
          .then(e => {
            // Success
          })
          .catch(e => {
            // Throws some weird error but still stops the notifications.
          });
      }
    });
  }

  loading() {
    let loader = this._loadingCtrl.create({
      content: "Please wait...",
      duration: 3000
    });
    loader.present();
    return loader;
  }

  // Pick data from the sensor.rawValues
  saveGraphData() {
    const fields: string[] = ["A", "B", "C", "D", "E", "F", "G", "H"];
    const graphData: any = [];
    this.connectedDevices.map(device => {
      graphData.push({
        A: "",
        B: ""
      });
      graphData.push({
        A: "",
        B: ""
      });
      graphData.push({
        A: `Sensor Identifier ${device.id}`,
        B: ""
      });

      _.keys(this.charts).map(chartId => {
        graphData.push({
          A: "",
          B: ""
        });
        graphData.push({
          A: "",
          B: ""
        });
        graphData.push({
          A: `Type: ${chartId}`,
          B: ""
        });
        graphData.push({
          A: "",
          B: ""
        });

        /**
            * First collect all the units used
            * Assign a header/field value to each unit
            * Use the field value of the unit to push data into it
            */
        let unitMap = {};
        let fieldMap = {};

        this.charts[chartId].data.labels.map(label => {
          if (device.id === label.deviceId) {
            _.keys(label.dataValueMap).map((dataValueKey, i) => {
              if (!unitMap[dataValueKey]) {
                unitMap[dataValueKey] = {};
              }
              unitMap[dataValueKey] = fields[i];
              fieldMap[fields[i]] = dataValueKey;
            });
          }
        });
        graphData.push(fieldMap);

        this.charts[chartId].data.labels.map(label => {
          if (device.id === label.deviceId) {
            let modifiedDataValueMap = {};

            _.keys(label.dataValueMap).map(dataValueKey => {
              if (!modifiedDataValueMap[unitMap[dataValueKey]]) {
                modifiedDataValueMap[unitMap[dataValueKey]] = {};
              }
              modifiedDataValueMap[unitMap[dataValueKey]] =
                label.dataValueMap[dataValueKey];
            });

            graphData.push(modifiedDataValueMap);
          }
        });
      });
    });

    this.saveDataToFile(fields, graphData);
  }

  // Save Grid data
  // Pick data from the sensor.rawValues
  saveGridData() {
    const fields: string[] = ["A", "B", "C", "D", "E", "F", "G", "H"];
    const gridData: any = [];

    this.connectedDevices.map(device => {
      gridData.push({
        A: "",
        B: ""
      });
      gridData.push({
        A: "",
        B: ""
      });
      gridData.push({
        A: `Sensor Identifier ${device.id}`,
        B: ""
      });

      this.sensors.map(sensor => {
        gridData.push({
          A: "",
          B: ""
        });
        gridData.push({
          A: "",
          B: ""
        });
        gridData.push({
          A: `Type: ${sensor.name}`,
          B: ""
        });
        gridData.push({
          A: "",
          B: ""
        });

        /**
         * First collect all the units used
         * Assign a header/field value to each unit
         * Use the field value of the unit to push data into it
         */
        let unitMap = {};
        let fieldMap = {};
        sensor.config.grids.map((grid, i) => {
          if (!!grid.rawValue && !!grid.rawValue[device.id]) {
            const rawValueMap = grid.rawValue[device.id];

            _.keys(rawValueMap).map((rawValueKey, i) => {
              if (!unitMap[rawValueKey]) {
                unitMap[rawValueKey] = {};
              }

              unitMap[rawValueKey] = fields[i];
              fieldMap[fields[i]] = rawValueKey;
            });
          }
        });

        gridData.push(fieldMap);

        sensor.config.grids.map((grid, i) => {
          if (!!grid.rawValue && !!grid.rawValue[device.id]) {
            const rawValueMap = grid.rawValue[device.id];
            let modifiedRawValueMap = {};

            _.keys(rawValueMap).map(rawValueKey => {
              if (!modifiedRawValueMap[unitMap[rawValueKey]]) {
                modifiedRawValueMap[unitMap[rawValueKey]] = {};
              }
              modifiedRawValueMap[unitMap[rawValueKey]] =
                rawValueMap[rawValueKey];
            });

            gridData.push(modifiedRawValueMap);
          }
        });
      });
    });

    this.saveDataToFile(fields, gridData);
  }

  private saveDataToFile(fields: string[], data: any[]) {
    const csvData = this._fileService.convertArrayToCSV(fields, data);

    this._fileService
      .getFileExtension(this.investigation.labTitle)
      .then(fileName => {
        this._fileService
          .saveExperimentData(fileName, csvData)
          .then(success => {
            this._toastService.present({
              message: "Experiment data successfully saved to file " + fileName,
              duration: 3000
            });
          })
          .catch(error => {
            this._toastService.present({
              message: "Unable to save experiment data! ",
              duration: 3000
            });
          });
      });
  }

  // Helper to open a given page
  openPage(page: any) {
    this._navCtrl.push(page);
  }
}
