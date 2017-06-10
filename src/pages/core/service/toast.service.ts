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
    const toast = this._toastController.create(options);
    return toast.present().then(_ => toast);
  }
}
