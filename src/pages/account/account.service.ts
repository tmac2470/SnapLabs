// Other libraries
import { Observable } from "rxjs/Observable";
import "rxjs/add/observable/forkJoin";
import "rxjs/add/observable/fromPromise";
import "rxjs/add/observable/throw";
import "rxjs/add/operator/catch";
import "rxjs/add/operator/map";
import "rxjs/add/operator/merge";
import "rxjs/add/operator/mergeMap";
import * as _ from "lodash";
// Angular
import { Injectable } from "@angular/core";
// App
import { IUserCredentials } from "./account.model";
import { StorageService, StorageKey } from "../core/service";

/**
 * Send out user loggedin true/false event everytime login/signup/logout happens
 */

@Injectable()
export class AccountService {
  // private API_PATH: string = '/account';

  constructor(private _storageService: StorageService) {}

  // Methods

  private _saveUserToLocalStorage(
    user: IUserCredentials
  ): Promise<IUserCredentials> {
    return this._storageService.storage.set(StorageKey.USER_KEY, user);
  }

  private _addUserToLocallyStoredUsers(
    user: IUserCredentials
  ): Promise<IUserCredentials> {
    return this._storageService.storage
      .get(StorageKey.ALL_USERS_KEY)
      .then(users => {
        this._storageService.storage.set(StorageKey.ALL_USERS_KEY, []);
        if (!users) {
          users = [];
        }
        users.push(user);

        const uniqUsers = _.uniqBy(users, user => {
          return user.email;
        });
        return this._storageService.storage.set(
          StorageKey.ALL_USERS_KEY,
          uniqUsers
        );
      });
  }

  private _cleanUserFromLocalStorage(): Promise<any> {
    return this._storageService.storage.remove(StorageKey.USER_KEY);
  }

  getUser(): Observable<IUserCredentials> {
    const userPromise = this._storageService.storage.get(StorageKey.USER_KEY);
    return Observable.fromPromise(userPromise);
  }

  createAccount(credentials: IUserCredentials): Observable<any> {
    this._cleanUserFromLocalStorage();
    const saveUserPromise = this._saveUserToLocalStorage(credentials);
    const addUserToDB = this._addUserToLocallyStoredUsers(credentials);
    return Observable.forkJoin(saveUserPromise, addUserToDB);
  }

  login(credentials: IUserCredentials): Observable<IUserCredentials> {
    // this._cleanUserFromLocalStorage();
    const userPromise = this._storageService.storage.get(StorageKey.USER_KEY);
    return Observable.fromPromise(userPromise).map(user => {
      if (
        user &&
        user.email === credentials.email
        // && user.password === credentials.password
      ) {
        return user;
      } else {
        return null;
      }
    });
  }

  logout(): Observable<any> {
    const deleteUser = this._cleanUserFromLocalStorage();
    return Observable.fromPromise(deleteUser);
  }
}
