// Angular
import { Component } from '@angular/core';
// Ionic
import { NavController } from 'ionic-angular';
import { BLE } from '@ionic-native/ble';

@Component({
  selector: 'home-page-component',
  templateUrl: 'home.view.html'
})
export class HomePageComponent {
  devices: string[] = [];
  isScanning: boolean = false;

  constructor(public navCtrl: NavController) {
    this.devices = [];
    this.isScanning = false;
  }

  ionViewDidEnter() {
    // this.startScanning();
  }

  // Scan for bluetooth devices nearby
  startScanning() {
    this.isScanning = true;
    const ble = new BLE();

    ble.startScan([]).subscribe(device => {
      this.devices.push(device);
    });

    // Scan for 3 seconds and then stop
    setTimeout(() => {
      ble.stopScan().then(() => {
        console.log('Scanning has stopped');
        console.log(JSON.stringify(this.devices))
        this.isScanning = false;
      });
    }, 3000);
  }

  connectToDevice(device) {
    console.log('Connect To Device');
    console.log(JSON.stringify(device))
    // this.nav.push(DevicePage, {
    //   device: device
    // });
  }

}
