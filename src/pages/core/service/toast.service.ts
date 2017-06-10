// Angular
import { Injectable } from '@angular/core';
// Ionic
import { Toast, ToastController, ToastOptions } from 'ionic-angular';

@Injectable()
export class ToastService {

  constructor(
    private _toastController: ToastController
  ) {
  }

  present(options?: ToastOptions): Promise<Toast> {
    // Set a default timeout of 3 seconds
    options.duration = options && options.duration ? options.duration : 3000;
    options.showCloseButton = true;

    const toast = this._toastController.create(options);
    return toast.present().then(_ => toast);
  }
}
