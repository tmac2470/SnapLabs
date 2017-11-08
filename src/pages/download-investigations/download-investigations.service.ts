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

  private sanitiseInvestigations(investigations: any[]): any[] {
    return investigations.filter(i => {
      return !!i && !!i.labTitle;
    });
  }

  private _updateInvestigation(investigation: any): Observable<any> {
    return this.getLocalInvestigations().mergeMap(investigations => {
      if (!investigations) {
        investigations = [];
      }

      // Sanitise investigations
      let sanitisedInvestigations = this.sanitiseInvestigations(investigations);

      // First remove the old copy of investigation
      investigations = sanitisedInvestigations.filter(i => {
        return i._id !== investigation._id;
      });

      // Now push the new copy
      investigations.push(investigation);

      const promise = this._storageService.storage.set(
        StorageKey.INVESTIGATIONS_STORE,
        investigations
      );
      return Observable.fromPromise(promise);
    });
  }

  updateInvestigation(id: string): Observable<any> {
    return this.getInvestigation(id).mergeMap(investigation => {
      return this._updateInvestigation(investigation);
    });
  }

  deleteInvestigation(id: string): Observable<any> {
    return this.getLocalInvestigations().mergeMap(investigations => {
      if (!investigations) {
        investigations = [];
      }

      // Sanitise investigations
      let sanitisedInvestigations = this.sanitiseInvestigations(investigations);

      investigations = sanitisedInvestigations.filter(i => {
        return i._id !== id;
      });

      const promise = this._storageService.storage.set(
        StorageKey.INVESTIGATIONS_STORE,
        investigations
      );
      return Observable.fromPromise(promise);
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

      // Sanitise investigations
      let sanitisedInvestigations = this.sanitiseInvestigations(investigations);

      const promise = this._storageService.storage.set(
        StorageKey.INVESTIGATIONS_STORE,
        sanitisedInvestigations
      );
      return Observable.fromPromise(promise);
    });
  }
}
