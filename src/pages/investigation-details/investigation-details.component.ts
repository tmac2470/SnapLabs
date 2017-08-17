// Angular
import { Component, ViewChild } from "@angular/core";
// Ionic
import { NavParams, NavController, LoadingController } from "ionic-angular";
// Chart JS
import { Chart } from "chart.js";
// SnapApp
import { ConnectPageComponent, ConnectService } from "../connect";
import { ToastService } from "../core/service";
import {
  Investigation,
  ISensor,
  ISensorTag
} from "./investigation-details.model";
import * as SERVICES from "../connect/connect.config";

@Component({
  selector: "investigation-details-page-component",
  templateUrl: "investigation-details.view.html",
  styles: ["./investigation-details.styles.scss"]
})
export class InvestigationDetailsPageComponent {
  connectPageComponent = ConnectPageComponent;
  investigation: Investigation;
  sensors: any[] = [];
  connectedDevice: any = {};

  @ViewChild("barCanvas") barCanvas;
  barChart: any;

  constructor(
    private _connectService: ConnectService,
    private _loadingCtrl: LoadingController,
    private _navCtrl: NavController,
    private _navParams: NavParams,
    private _toastService: ToastService
  ) {
    this.investigation = this._navParams.get("investigation");
  }

  // LifeCycle methods
  ionViewWillEnter() {
    const sensorTags = this.investigation.data.experimentConfig.sensorTags;

    // Fetch all the configs for all different sensor tags
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

    console.log(this.sensors);
    this.isConnectedToAnyDevice();
    this.initialiseCharts();
  }

  initialiseCharts() {
    this.barChart = new Chart(this.barCanvas.nativeElement, {
      type: "line",
      data: {
        datasets: [
          {
            fill: false,
            lineTension: 0.2,
            label: "Ambient Temperature (C)",
            data: [5, 10, 15, 20, 25, 30, 35, 40],
            borderColor: "rgba(255,0,0,1)",
            backgroundColor: "rgba(255,255,255,1)"
          },
          {
            fill: false,
            lineTension: 0.2,
            label: "Target (IR) Temperature (C)",
            data: [10, 45, 32, 31, 34, 45, 45, 32],
            borderColor: "rgba(0,0,255,1)",
            backgroundColor: "rgba(255,255,255,1)"
          }
        ]
      },
      options: {
        elements: {
          line: {
            tension: 0 // disables bezier curves for high performance
          }
        }
      }
    });
  }

  isConnectedToAnyDevice() {
    this._connectService
      .getConnectedDevice()
      .then(device => {
        console.log(device);
        this.connectedDevice = device;
      })
      .catch(e => {
        this._toastService.present({
          message: "No sensor tag connected!",
          duration: 3000
        });
      });
  }

  private barometerConvert(data) {
    return data / 100;
  }

  startNotification(device) {
    console.log("start notif");
    const service = SERVICES.BAROMETER;

    this._connectService.readData(device.id, service).subscribe(
      data => {
        // BAROMETER DATA
        const state = new Uint8Array(data);
        console.log(
          "TEMPERATURE : C",
          this.barometerConvert(state[0] | (state[1] << 8) | (state[2] << 16))
        );
        console.log(
          "PRESSURE hpa",
          this.barometerConvert(state[3] | (state[4] << 8) | (state[5] << 16))
        );
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
    var barometerConfig = new Uint8Array(1);
    barometerConfig[0] = 0x0a;
    this._connectService
      .writeToDevice(device.id, service, barometerConfig.buffer)
      .then(e => {
        console.log(e);
      })
      .catch(e => {
        console.log(e);
      });

    // var bytesToString = buffer => {
    //   return String.fromCharCode.apply(null, new Uint8Array(buffer));
    // };

    // var stringToBytes = string => {
    //   var array = new Uint8Array(string.length);
    //   for (var i = 0, l = string.length; i < l; i++) {
    //     array[i] = string.charCodeAt(i);
    //   }
    //   return array.buffer;
    // };
  }

  stopNotification(device) {
    console.log("stop notif");
    const service = SERVICES.BAROMETER;

    this._connectService
      .stopReadingData(device, service)
      .then(e => {
        console.log(e);
      })
      .catch(e => {
        console.log(e);
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
