// Angular
import { Component } from '@angular/core';
// Ionic
import { NavController, Platform, LoadingController } from 'ionic-angular';
import { BLE } from '@ionic-native/ble';
// App
import { ToastService } from '../core/service';

@Component({
  selector: 'connect-page-component',
  templateUrl: 'connect.view.html',
  styles: ['./connect.styles.scss']
})
export class ConnectPageComponent {
  devices: string[]
  isBluetoothEnabled: boolean = false;
  isAndroidDevice: boolean = false;

  constructor(
    private _navCtrl: NavController,
    private _loadingCtrl: LoadingController,
    private _toastService: ToastService,
    private ble: BLE,
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
    this.ble.isEnabled()
      .then(connected => {
        console.log('connected in bluetooth', connected);
        this.isBluetoothEnabled = true;
        this.startScanning();
      }).catch(error => {
        console.log('error in bluetooth', error);
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
    this.ble.enable()
      .then(enabled => {
        console.log('bluetooth enabled', enabled);
        this._toastService.present({
          message: 'Bluetooth enabled!',
          duration: 1500,
        });
        this.checkIfBluetoothEnabled();
      }).catch(error => {
        console.log('error enabling bluetooth', error);

        this._toastService.present({
          message: 'Something went wrong! Please enable the bluetooth manually',
          duration: 3000
        });
      });
  }

  loading() {
    let loader = this._loadingCtrl.create({
      content: "Scanning..."
    });
    loader.present();
    return loader;
  }

  // Scan for bluetooth devices nearby
  startScanning() {
    if (!this.platform.is('cordova')) {
      return;
    }

    this.devices = [];
    // Get the loading modal
    const loading = this.loading();

    this.ble.startScan([]).subscribe(device => {
      this.devices.push(device);
    });

    // Scan for 3 seconds and then stop
    setTimeout(() => {
      this.ble.stopScan().then(() => {
        console.log('Scanning has stopped');
        console.log(JSON.stringify(this.devices))
        loading.dismiss();
      });
    }, 3000);
  }

  connectToDevice(device) {
    console.log('Connect To Device');
    console.log(JSON.stringify(device))
    this.ble.connect(device.id).subscribe(data => {
      console.log('device connected', device);
    });
  }

}
