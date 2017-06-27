// Angular
import { Injectable } from '@angular/core';
// Ionic
import { Storage } from '@ionic/storage';

export class StorageKey {
  static USER_KEY: string = 'user';
  static CONNECTED_DEVICE: string = 'connected_device';
}

@Injectable()
export class StorageService {

  constructor(public storage: Storage) {
  }
}
