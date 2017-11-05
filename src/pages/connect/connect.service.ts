// Other libraries
import { Observable } from "rxjs/Observable";
import * as _ from "lodash";
// Angular
import { Injectable } from "@angular/core";
// Ionic
import { BLE } from "@ionic-native/ble";
// App
import { StorageService, StorageKey } from "../core/service";

@Injectable()
export class ConnectService {
  connectedDevices: any = [];
  constructor(private ble: BLE, private _storageService: StorageService) {}

  // Methods

  updateLocalDevices(devices: any[] = []): Promise<any> {
    this.connectedDevices = devices;
    return this._storageService.storage.set(
      StorageKey.CONNECTED_DEVICES,
      devices
    );
  }

  getLastDevices(): Promise<any> {
    if (this.connectedDevices.length > 0) {
      return new Promise(resolve => {
        resolve(this.connectedDevices);
      });
    } else {
      return this._storageService.storage.get(StorageKey.CONNECTED_DEVICES);
    }
  }

  saveConnectedDevice(device: any): Promise<any> {
    return this.getLastDevices().then(devices => {
      if (!devices) {
        devices = [];
      }
      devices.push(device);
      devices = _.uniqBy(devices, device => {
        return device.id;
      });
      return this.updateLocalDevices(devices);
    });
  }

  removeConnectedDevice(device: any): Promise<any> {
    return this.getLastDevices().then(devices => {
      devices = devices.filter(d => {
        return d.id !== device.id;
      });
      return this.updateLocalDevices(devices);
    });
  }

  getConnectedDevices(): Promise<any> {
    return this.getLastDevices().then(async devices => {
      let connectedDevices: any[] = [];
      if (!devices) {
        devices = [];
      }

      await Promise.all(
        devices.map(async (device): Promise<any> => {
          await this.isConnectedToDevice(device.id)
            .then(connected => {
              connectedDevices.push(device);
            })
            .catch(e => e);
        })
      );
      return this.updateLocalDevices(connectedDevices);
    });
  }

  // getConnectedDevice(): Promise<any> {
  //   return this.getLastDevices().then(device => {
  //     if (!device) {
  //       return new Promise(null);
  //     } else {
  //       return this.isConnectedToDevice(device.id)
  //         .then(connected => {
  //           return connected ? device : null;
  //         })
  //         .catch(e => {
  //           return e;
  //         });
  //     }
  //   });
  // }

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

    return this.ble.connect(id);
    // .map(device => this.saveConnectedDevice(device));
  }

  disconnect(id: string): Promise<any> {
    return this.ble.disconnect(id);
  }

  isConnectedToDevice(id: string): Promise<any> {
    return this.ble.isConnected(id);
  }

  readData(deviceId: string, service: any): Observable<any> {
    return this.ble.startNotification(deviceId, service.UUID, service.DATA);
  }

  stopReadingData(deviceId: string, service: any): Promise<any> {
    return this.ble.stopNotification(deviceId, service.UUID, service.DATA);
  }

  readOne(deviceId: string, service: any): Promise<any> {
    return this.ble.read(deviceId, service.UUID, service.DATA);
  }

  writeToDevice(deviceId: string, service: any, buffer: any): Promise<any> {
    return this.ble.write(deviceId, service.UUID, service.CONFIG, buffer);
  }

  bytesToString(buffer) {
    return String.fromCharCode.apply(null, new Uint8Array(buffer));
  }
}
