// Other libraries
import { Observable } from 'rxjs/Observable';
// Angular
import { Injectable } from '@angular/core';
// Ionic
import { BLE } from '@ionic-native/ble';
// App
import { StorageService, StorageKey } from '../core/service';

@Injectable()
export class ConnectService {

  constructor(
    private ble: BLE,
    private _storageService: StorageService
  ) {
  }

  // Methods

  private saveConnectedDevice(device: any) {
    this._storageService.storage.set(StorageKey.CONNECTED_DEVICE, device);
  }

  isBluetoothEnabled(): Promise<any> {
    return this.ble.isEnabled();
  }

  enableBluetooth(): Promise<any> {
    return this.ble.enable();
  }

  startScanning(services: any[] = []): Observable<any> {
    return this.ble.startScan(services);
  }

  stopScanning(): Promise<any> {
    return this.ble.stopScan();
  }

  connectToDeviceId(id: string): Observable<any> {
    return this.ble.connect(id)
      .map(device => this.saveConnectedDevice(device));
  }
}
