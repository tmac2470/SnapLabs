// Other libraries
import { Observable } from "rxjs/Observable";
import "rxjs/add/operator/map";
// Angular
import { URLSearchParams } from "@angular/http";
import { Injectable } from "@angular/core";
// App
import { HttpService, StorageService, StorageKey } from "../core/service";
import { Investigation } from "../investigation-details";

@Injectable()
export class DownloadInvestigationsService {
  private API_PATH_EXPERIMENTS: string = "/experiments";

  constructor(
    private _http: HttpService,
    private _storageService: StorageService
  ) {}

  getInvestigations(searchParams?: URLSearchParams): Observable<any> {
    return this._http.get(`${this.API_PATH_EXPERIMENTS}`, {
      search: searchParams
    });
  }

  getInvestigation(id: string): Observable<any> {
    return this._http.get(`${this.API_PATH_EXPERIMENTS}/${id}`);
  }

  getLocalInvestigations(): Observable<any> {
    const promise = this._storageService.storage.get(
      StorageKey.INVESTIGATIONS_STORE
    );
    return Observable.fromPromise(promise);
  }

  saveInvestigation(investigation: Investigation): Observable<any> {
    return this.getLocalInvestigations().mergeMap(investigations => {
      if (!investigations) {
        investigations = [];
      }
      investigations.push(investigation);

      const promise = this._storageService.storage.set(
        StorageKey.INVESTIGATIONS_STORE,
        investigations
      );
      return Observable.fromPromise(promise);
    });
  }
}
