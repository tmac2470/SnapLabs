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
  devices: string[] = [];
  connectedDevices: any[] = [];
  isBluetoothEnabled: boolean = false;
  isAndroidDevice: boolean = false;
  connectedDeviceKeyPressed: any = {};
  isScanning: boolean = false;
  subscriptions: Subscription[] = [];

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
    this.checkIfBluetoothEnabled();
  }

  ngOnDestroy() {
    this.subscriptions.map(subs => {
      if (subs) {
        subs.unsubscribe();
      }
    });

    this.cdRef.detach();
  }

  /**
   * How it works
   *
   * 1. Upon entering this page check if bluetooth is enabled. If yes start scanning,
   * if no throw error and ask user to enable bluetooth
   * 1. Scan for devices
   * 2. Once a device is connected, push it into the list of connected devices and rescan for devices.
   * 3. Show the list of connected devices and allow user to disconnect from them individually. Scan for devices upon disconnection.
   * 4. Also allow user to disconnect from all of them at once. Scan for devices upon disconnection.
   * 4. Upon entering this page, load the list of connected devices.
   */

  loading(text: string = "Scanning...") {
    let loader = this._loadingCtrl.create({
      content: text
    });
    loader.present();
    return loader;
  }

  // Checks if the bluetooth is enabled.
  // If yes, scan for devices
  // Else, throw an error
  checkIfBluetoothEnabled() {
    this._connectService
      .isBluetoothEnabled()
      .then(connected => {
        this.isBluetoothEnabled = true;
        this._connectService.getConnectedDevices().then(_ => {
          this.getConnectedDevices();
        });
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
    // Simple check to not run the scan on non cordova platforms
    if (!this.platform.is("cordova")) {
      return;
    }

    this.scanForDevices();
  }

  private getConnectedDevices(): Promise<any> {
    return this._connectService.getLastDevices().then(devices => {
      this.connectedDevices = devices;
    });
  }

  private onConnect(devices: any[]) {
    this.connectedDevices = devices;

    this.connectedDevices.map(async device => {
      await this.pingDevice(device);
      await this.getDeviceBatteryInfo(device);
    });

    setTimeout(() => {
      this.startScanning();
    }, 1000);
  }

  highlightConnectedDevice(device: any, state: Uint8Array) {
    if (state.length > 0 && !!state[0]) {
      if (state[0] > 0) {
        this.connectedDeviceKeyPressed[device.id] = true;
      } else {
        this.connectedDeviceKeyPressed[device.id] = false;
      }
    } else {
      this.connectedDeviceKeyPressed[device.id] = false;
    }
    this.cdRef.detectChanges();
  }

  getDeviceBatteryInfo(device: any) {
    const service = SERVICES.BATTERY;

    this._connectService
      .readOne(device.id, service)
      .then(data => {
        const state = new Uint8Array(data);

        if (state.length > 0 && !!state[0]) {
          this.connectedDevices.map(d => {
            if (d.id === device.id) {
              d.battery = state[0];
            }
          });
        }
      })
      .catch(err => {
        this._toastService.present({
          message: "Unable to get device's battery status!",
          duration: 3000
        });
      });
  }

  pingDevice(device: any) {
    const service = SERVICES.IOBUTTON;

    const subscription: Subscription = this._connectService
      .readData(device.id, service)
      .subscribe(
        data => {
          const state = new Uint8Array(data);
          this.highlightConnectedDevice(device, state);
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

  connectToDevice(device: any) {
    const loading = this.loading("Connecting...");

    this._connectService.connectToDeviceId(device.id).subscribe(
      data => {
        this._connectService
          .saveConnectedDevice(data)
          .then(devices => this.onConnect(devices));

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

  private disconnect(device: any): Promise<any> {
    return this._connectService
      .disconnect(device.id)
      .then(_ => {
        // Successfull disconnection
        return this._connectService.removeConnectedDevice(device);
      })
      .catch(e => {
        this._toastService.present({
          message: "Unable to connect to device. Please retry!",
          duration: 3000
        });
      });
  }

  disconnectOne(device: any) {
    const loading = this.loading("Disconnecting...");
    this.disconnect(device).then(_ => {
      this.getConnectedDevices();
    });
    loading.dismiss();
    this.startScanning();
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
}
