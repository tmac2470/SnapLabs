// Other libraries
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/forkJoin';
import 'rxjs/add/observable/fromPromise';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/merge';
import 'rxjs/add/operator/mergeMap';
// Angular
import { Injectable } from '@angular/core';
// App
import { IUserCredentials } from './account.model';
import { StorageService, StorageKey } from '../core/service';

/**
 * Send out user loggedin true/false event everytime login/signup/logout happens
 */

@Injectable()
export class AccountService {
  // private API_PATH: string = '/account';

  constructor(
    private _storageService: StorageService
  ) {
  }

  // Methods

  private _saveUserToLocalStorage(user: IUserCredentials): Promise<IUserCredentials> {
    return this._storageService.storage.set(StorageKey.USER_KEY, user);
  }

  private _cleanUserFromLocalStorage(): void {
    this._storageService.storage.remove(StorageKey.USER_KEY);
  }

  getUser(): Observable<IUserCredentials> {
    const userPromise = this._storageService.storage.get(StorageKey.USER_KEY);
    return Observable.fromPromise(userPromise);
  }

  createAccount(credentials: IUserCredentials): Observable<any> {
    this._cleanUserFromLocalStorage();
    const saveUserPromise = this._saveUserToLocalStorage(credentials);
    return Observable.fromPromise(saveUserPromise);
  }

  login(credentials: IUserCredentials): Observable<IUserCredentials> {
    // this._cleanUserFromLocalStorage();
    const userPromise = this._storageService.storage.get(StorageKey.USER_KEY);
    return Observable.fromPromise(userPromise)
      .map(user => {
        if (user && user.email === credentials.email && user.password === credentials.password) {
          return user;
        } else {
          return null;
        }
      });
  }

  logout(): Observable<any> {
    this._cleanUserFromLocalStorage();
    return new Observable();
  }
}
