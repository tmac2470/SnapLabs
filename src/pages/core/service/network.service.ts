// Angular
import { EventEmitter, Injectable } from "@angular/core";
// Ionic
import { Network } from "@ionic-native/network";

@Injectable()
export class NetworkService {
  private _connected: boolean = true;
  private _connectivityEmitter = new EventEmitter<boolean>();

  constructor(private network: Network) {
    this.network.onConnect().subscribe(_ => {
      this._connected = true;
      this._connectivityEmitter.emit(true);
    });

    this.network.onDisconnect().subscribe(_ => {
      this._connected = false;
      this._connectivityEmitter.emit(false);
    });
  }

  // Members

  get connected(): boolean {
    return this._connected;
  }

  get connectivity(): EventEmitter<boolean> {
    return this._connectivityEmitter;
  }
}
