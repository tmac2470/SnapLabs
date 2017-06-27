// Angular
import { Component } from '@angular/core';
// Ionic
import { NavController, Platform, LoadingController } from 'ionic-angular';
// App
import { ToastService } from '../core/service';
import { ConnectService } from './connect.service';

@Component({
  selector: 'connect-page-component',
  templateUrl: 'connect.view.html',
  styles: ['./connect.styles.scss']
})
export class ConnectPageComponent {
  devices: string[]
  isBluetoothEnabled: boolean = false;
  isAndroidDevice: boolean = false;
  connectedDevice: any = {};
  isScanning: boolean = false;

  constructor(
    private _connectService: ConnectService,
    private _navCtrl: NavController,
    private _loadingCtrl: LoadingController,
    private _toastService: ToastService,
    private platform: Platform
  ) {
    if (this.platform.is('android')) {
      this.isAndroidDevice = true;
    }
  }

  ionViewDidEnter() {
    this.checkIfBluetoothEnabled();
  }

  // Checks if the bluetooth is enabled.
  // If yes, scan for devices
  // Else, throw an error
  checkIfBluetoothEnabled() {
    this._connectService.isBluetoothEnabled()
      .then(connected => {
        this.isBluetoothEnabled = true;
        this.startScanning();
      }).catch(error => {
        this.isBluetoothEnabled = false;
        this._toastService.present({
          message: 'Please enable bluetooth!',
          duration: 3000
        });
      });
  }

  // Enable bluetooth directly from the app
  // Only for android apps!
  enableBluetooth() {
    this._connectService.enableBluetooth()
      .then(enabled => {
        this._toastService.present({
          message: 'Bluetooth enabled!',
          duration: 1500,
        });
        this.checkIfBluetoothEnabled();
      }).catch(error => {
        this._toastService.present({
          message: 'Something went wrong! Please enable the bluetooth manually',
          duration: 3000
        });
      });
  }

  loading(text: string = 'Scanning...') {
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
    this._connectService.startScanning([])
      .subscribe(device => {
        this.devices.push(device);
      },
      error => {
        this._toastService.present({
          message: 'Something went wrong while searching for bluetooth devices. Please retry!',
          duration: 3000
        });
      });

    // Scan for 3 seconds and then stop
    setTimeout(() => {
      this._connectService.stopScanning()
        .then(() => {
          this.isScanning = false;
        });
    }, 3000);
  }

  startScanning() {
    if (!this.platform.is('cordova')) {
      return;
    }

    this.scanForDevices();
  }

  connectToDevice(device) {
    const loading = this.loading('Connecting...');

    this._connectService.connectToDeviceId(device.id)
      .subscribe(data => {
        console.log(device);
        console.log('device connected', device);
        this.connectedDevice = device;
        loading.dismiss();
      },
      error => {
        this._toastService.present({
          message: 'Unable to connect to device. Please retry!',
          duration: 3000
        });
      });
  }
}
