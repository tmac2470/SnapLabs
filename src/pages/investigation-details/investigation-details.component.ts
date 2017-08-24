// Angular
import { Component, ChangeDetectorRef, OnDestroy } from "@angular/core";
import { Subscription } from "rxjs/Subscription";
// Ionic
import { NavParams, NavController, LoadingController } from "ionic-angular";
// Others
import * as _ from "lodash";
import { Chart } from "chart.js";
// SnapApp
import { ConnectPageComponent, ConnectService } from "../connect";
import { ToastService } from "../core/service";
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
export class InvestigationDetailsPageComponent implements OnDestroy {
  connectPageComponent = ConnectPageComponent;
  investigation: Investigation;
  sensors: any[] = [];
  connectedDevice: any = {};
  graphsStarted: boolean = false;
  subscriptions: Subscription[] = [];

  mapDataSetConfig = {
    drawTicks: false,
    fill: false,
    lineTension: 0.2,
    data: [],
    pointBorderWidth: 0.1,
    backgroundColor: ColorCode.WHITE
  };

  mapOptions = {
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
    private _toastService: ToastService
  ) {
    this.investigation = this._navParams.get("investigation");
  }

  ngOnDestroy() {
    this.stopNotifications();

    this.subscriptions.map(subs => {
      if (subs) {
        subs.unsubscribe();
      }
    });

    this.cdRef.detach();
  }

  // LifeCycle methods
  ionViewWillEnter() {
    const sensorTags = this.investigation.data.experimentConfig.sensorTags;
    const getSensorTags = async () => {
      await this.getSensorTags(sensorTags);
    };
    getSensorTags();
    this.isConnectedToAnyDevice();
  }

  ionViewDidEnter() {
    this.sensors.forEach(sensorTag => {
      this.initialiseChart(sensorTag.name);
    });
  }

  // Other methods
  initialiseChart(chartId) {
    const ctx = document.getElementById(chartId);
    this.charts[chartId] = this.getChartType(chartId, ctx);
  }

  isConnectedToAnyDevice() {
    this._connectService
      .getConnectedDevice()
      .then(device => {
        this.connectedDevice = device;
        // Automatically start notifications
        this.startNotifications();
      })
      .catch(e => {
        this._toastService.present({
          message: "No sensor tag connected!",
          duration: 3000
        });
      });
  }

  getSensorTags(sensorTags) {
    this.sensors = [];
    for (let id in sensorTags) {
      const sensorTag: ISensorTag = sensorTags[id];

      // Fetch the sensor tags which have been switched "on"
      if (sensorTag.connect === "on" || sensorTag.connect === "1") {
        const sensors: any = sensorTag.sensors;

        // Fetch each sensor from the sensor tags config
        for (let iSensor in sensors) {
          const sensor: ISensor = sensors[iSensor];
          // Fetch only the sensors which have been switched "on"
          if (
            sensor.data.display === "on" ||
            sensor.graph.graphdisplay === "on" ||
            sensor.grid.griddisplay === "on"
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
   * Starting notifications would mean that the data from sensor tags has started coming in.
   * Stopping notifications would stop the notification for all services
   *
   * Upon starting graphs turn the graphsStarted flag on.
   * Upon stop graphs turn the graphsStarted flag off.
   * Upon reset graphs turn the graphsStarted flag off and also clear off the graphs.
   *
   */

  getChartDatasets(chart: string): Array<any> {
    const mapDataSetConfig = this.mapDataSetConfig;

    switch (chart.toLowerCase()) {
      case "temperature":
        return [
          {
            mapDataSetConfig,
            borderColor: ColorCode.RED,
            label: "Ambient Temperature (C)"
          },
          {
            mapDataSetConfig,
            borderColor: ColorCode.GREEN,
            label: "Target (IR) Temperature (C)"
          }
        ];

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

      case "magnetometer":
        return [
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
          },
          {
            mapDataSetConfig,
            borderColor: ColorCode.BLACK,
            label: "Scalar Value"
          }
        ];

      case "gyroscope":
        return [
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

      case "accelerometer":
        return [
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
          },
          {
            mapDataSetConfig,
            borderColor: ColorCode.BLACK,
            label: "Scalar Value"
          }
        ];

      case "humidity":
        return [
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
    }
  }

  getChartType(chart: string, ctx: any) {
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
            datasets: this.getChartDatasets(chart)
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
  }

  resetGraphs() {
    this.stopGraphs();

    _.keys(this.charts).map(chartId => {
      this.charts[chartId].reset();
      this.charts[chartId].clear();
      this.charts[chartId].data.datasets.forEach(dataset => {
        dataset.data = [];
      });
    });
  }

  addData(chart, label, data) {
    chart.data.labels.push(label);
    chart.data.datasets.forEach(dataset => {
      dataset.data.push(data);
    });
    chart.update();
  }

  // Draw graphs
  drawGraphs(chart: any, value: number) {
    if (this.graphsStarted) {
      this.addData(chart, "null", value);
    }
  }

  startNotifications() {
    const device = this.connectedDevice;

    this.sensors.forEach(sensorTag => {
      switch (sensorTag.name.toLowerCase()) {
        case "temperature":
        case "barometer":
          this.barometerTempNotifications(device, "Barometer", "Temperature");
          break;
        case "accelerometer":
          this.accelerometerTempNotifications(device, "Accelerometer");
          break;
        case "gyroscope":
        case "humidity":
        case "luxometer":
        case "magnetometer":
          break;

        default:
          break;
      }
    });
  }

  updateSensorValue(name: string, value: string) {
    this.sensors.map(sensor => {
      if (sensor.name === name) {
        sensor.value = value;
        this.cdRef.detectChanges();
      }
    });
  }

  accelerometerTempNotifications(device: any, accelerometerChartId: string) {
    const service = SERVICES.Accelerometer;

    const sensorMpu9250GyroConvert = data => {
      // return data / (65536 / 500);
      return data / (32768 / 2);
    };

    const subscription: Subscription = this._connectService
      .readData(device.id, service)
      .subscribe(
        data => {
          // BAROMETER DATA
          const state = new Int16Array(data);

          //0 gyro x
          //1 gyro y
          //2 gyro z
          //3 accel x
          //4 accel y
          //5 accel z
          //6 mag x
          //7 mag y
          //8 mag z

          console.log(
            "Gyro",
            sensorMpu9250GyroConvert(state[0]),
            sensorMpu9250GyroConvert(state[1]),
            sensorMpu9250GyroConvert(state[2])
          );
          console.log(
            "Acc",
            sensorMpu9250GyroConvert(state[3]),
            sensorMpu9250GyroConvert(state[4]),
            sensorMpu9250GyroConvert(state[5])
          );
          console.log("Mag", state[6], state[7], state[8]);
        },
        error => {
          console.log(error);
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

  barometerConvert(data) {
    return data / 100;
  }

  barometerTempNotifications(
    device: any,
    barometerChartId: string,
    temperatureChartId: string
  ) {
    const service = SERVICES.Barometer;
    const subscription: Subscription = this._connectService
      .readData(device.id, service)
      .subscribe(
        data => {
          // BAROMETER DATA
          const state = new Uint8Array(data);

          const tempValue = this.barometerConvert(
            state[0] | (state[1] << 8) | (state[2] << 16)
          );

          const pressureValue = this.barometerConvert(
            state[3] | (state[4] << 8) | (state[5] << 16)
          );

          this.updateSensorValue(barometerChartId, `${pressureValue} hPa`);
          this.updateSensorValue(temperatureChartId, `${tempValue} °C`);

          this.drawGraphs(this.charts[barometerChartId], pressureValue);
          this.drawGraphs(this.charts[temperatureChartId], tempValue);
        },
        error => {
          console.log(error);
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

  stopNotifications() {
    const device = this.connectedDevice;
    this.graphsStarted = false;

    this.sensors.map(sensor => {
      const service = SERVICES[sensor.name];

      this._connectService
        .stopReadingData(device, service)
        .then(e => {
          // console.log(e);
        })
        .catch(e => {
          // console.log(e);
        });
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

  // Helper to open a given page
  openPage(page: any) {
    this._navCtrl.push(page);
  }
}
