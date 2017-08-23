// Angular
import { Component, ChangeDetectorRef, OnDestroy } from "@angular/core";
import { Subscription } from "rxjs/Subscription";
// Ionic
import { NavController, Platform, LoadingController } from "ionic-angular";
// App
import { ToastService } from "../core/service";
import { ConnectService } from "./connect.service";
import * as SERVICES from "./connect.config";

@Component({
  selector: "connect-page-component",
  templateUrl: "connect.view.html",
  styles: ["./connect.styles.scss"]
})
export class ConnectPageComponent implements OnDestroy {
  devices: string[];
  isBluetoothEnabled: boolean = false;
  isAndroidDevice: boolean = false;
  connectedDevice: any = {};
  connectedDeviceKeyPressed: boolean;
  isScanning: boolean = false;
  devicePingSubscription: Subscription;

  constructor(
    private _connectService: ConnectService,
    private _navCtrl: NavController,
    private _loadingCtrl: LoadingController,
    private _toastService: ToastService,
    private cdRef: ChangeDetectorRef,
    private platform: Platform
  ) {
    if (this.platform.is("android")) {
      this.isAndroidDevice = true;
    }
  }

  ionViewDidEnter() {
    this.isConnectedToAnyDevice();
    this.checkIfBluetoothEnabled();
  }

  ngOnDestroy() {
    if (this.devicePingSubscription) {
      this.devicePingSubscription.unsubscribe();
    }
    this.cdRef.detach();
  }

  isConnectedToAnyDevice() {
    this._connectService
      .getConnectedDevice()
      .then(device => {
        this.connectedDevice = device;
        if (device && device.id) {
          this.pingDevice();
          this.getDeviceBatteryInfo();
        }
      })
      .catch(error => {
        // No device connected
        this.connectedDevice = {};
      });
  }

  highlightConnectedDevice(state: Uint8Array) {
    if (state.length > 0 && !!state[0]) {
      if (state[0] > 0) {
        this.connectedDeviceKeyPressed = true;
      } else {
        this.connectedDeviceKeyPressed = false;
      }
    } else {
      this.connectedDeviceKeyPressed = false;
    }
    this.cdRef.detectChanges();
  }

  pingDevice() {
    const device = this.connectedDevice;
    const service = SERVICES.IOBUTTON;

    this.devicePingSubscription = this._connectService
      .readData(device.id, service)
      .subscribe(
        data => {
          const state = new Uint8Array(data);
          this.highlightConnectedDevice(state);
        },
        error => {
          this._toastService.present({
            message:
              "Unable to detect device! Please retry bluetooth connection.",
            duration: 3000
          });
        }
      );
  }

  getDeviceBatteryInfo() {
    const device = this.connectedDevice;
    const service = SERVICES.BATTERY;

    this._connectService
      .readOne(device.id, service)
      .then(data => {
        const state = new Uint8Array(data);

        if (state.length > 0 && !!state[0]) {
          this.connectedDevice.battery = state[0];
        }
      })
      .catch(err => {
        this._toastService.present({
          message: "Unable to get device's battery status!",
          duration: 3000
        });
      });
  }

  // Checks if the bluetooth is enabled.
  // If yes, scan for devices
  // Else, throw an error
  checkIfBluetoothEnabled() {
    this._connectService
      .isBluetoothEnabled()
      .then(connected => {
        this.isBluetoothEnabled = true;
        this.startScanning();
      })
      .catch(error => {
        this.isBluetoothEnabled = false;
        this._toastService.present({
          message: "Please enable bluetooth!",
          duration: 3000
        });
      });
  }

  // Enable bluetooth directly from the app
  // Only for android apps!
  enableBluetooth() {
    this._connectService
      .enableBluetooth()
      .then(enabled => {
        this._toastService.present({
          message: "Bluetooth enabled!",
          duration: 1500
        });
        this.checkIfBluetoothEnabled();
      })
      .catch(error => {
        this._toastService.present({
          message: "Something went wrong! Please enable the bluetooth manually",
          duration: 3000
        });
      });
  }

  loading(text: string = "Scanning...") {
    let loader = this._loadingCtrl.create({
      content: text
    });
    loader.present();
    return loader;
  }

  // Scan for bluetooth devices nearby
  private scanForDevices() {
    this.devices = [];

    this.isScanning = true;
    this._connectService.startScanning([]).subscribe(
      device => {
        this.devices.push(device);
      },
      error => {
        this._toastService.present({
          message:
            "Something went wrong while searching for bluetooth devices. Please retry!",
          duration: 3000
        });
      }
    );

    // Scan for 3 seconds and then stop
    setTimeout(() => {
      this._connectService
        .stopScanning()
        .then(() => {
          this.isScanning = false;
        })
        .catch(e => {
          this._toastService.present({
            message: "Unable to scan for devices. Please retry!",
            duration: 3000
          });
        });
    }, 3000);
  }

  startScanning() {
    if (!this.platform.is("cordova")) {
      return;
    }

    this.scanForDevices();
  }

  connectToDevice(device) {
    const loading = this.loading("Connecting...");

    this._connectService.connectToDeviceId(device.id).subscribe(
      data => {
        this.connectedDevice = data;
        this.pingDevice();
        this.getDeviceBatteryInfo();
        loading.dismiss();
      },
      error => {
        this._toastService.present({
          message: "Unable to connect to device. Please retry!",
          duration: 3000
        });
        loading.dismiss();
      }
    );
  }

  disconnect() {
    const loading = this.loading("Disconnecting...");

    this._connectService
      .disconnect(this.connectedDevice.id)
      .then(_ => {
        this.isConnectedToAnyDevice();
        this.scanForDevices();
        loading.dismiss();
      })
      .catch(e => {
        this._toastService.present({
          message: "Unable to connect to device. Please retry!",
          duration: 3000
        });
        loading.dismiss();
      });
  }
}
