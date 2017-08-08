// Other libraries
import { Observable } from "rxjs/Observable";
// Angular
import { Injectable } from "@angular/core";
// Ionic
import { BLE } from "@ionic-native/ble";
// App
import { StorageService, StorageKey } from "../core/service";

@Injectable()
export class ConnectService {
  constructor(private ble: BLE, private _storageService: StorageService) {}

  // Methods

  private saveConnectedDevice(device: any) {
    this._storageService.storage.set(StorageKey.CONNECTED_DEVICE, device);
    return device;
  }

  getLastDevice(): Promise<any> {
    return this._storageService.storage.get(StorageKey.CONNECTED_DEVICE);
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
    this.disconnect(id)
      .then(disconnected => {
        // Ok disconnected
      })
      .catch(error => {
        // error disconnecting
      });

    return this.ble.connect(id).map(device => this.saveConnectedDevice(device));
  }

  disconnect(id: string): Promise<any> {
    return this.ble.disconnect(id);
  }

  isConnectedToDevice(id: string): Promise<any> {
    return this.ble.isConnected(id);
  }

  getConnectedDevice(): Promise<any> {
    return this.getLastDevice().then(device => {
      if (!device) {
        return new Promise(null);
      } else {
        return this.isConnectedToDevice(device.id)
          .then(connected => {
            return connected ? device : null;
          })
          .catch(e => {
            return e;
          });
      }
    });
  }

  readData(deviceId: string, service: any, data: any): Observable<any> {
    return this.ble.startNotification(deviceId, service, data);
  }

  stopReadingData(deviceId: string, service: any): Promise<any> {
    return this.ble.stopNotification(deviceId, service.UUID, service.DATA);
  }

  readOne(deviceId: string, service: any): Promise<any> {
    return this.ble.read(deviceId, service.UUID, service.DATA);
  }

  writeToDevice(
    deviceId: string,
    service: any,
    data: any,
    buffer: any
  ): Promise<any> {
    return this.ble.write(deviceId, service, data, buffer);
  }
}
