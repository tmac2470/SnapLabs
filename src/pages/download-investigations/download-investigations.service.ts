// Other libraries
import { Observable } from "rxjs/Observable";
import "rxjs/add/operator/map";
// Angular
import { URLSearchParams } from "@angular/http";
import { Injectable } from "@angular/core";
// App
import { HttpService, StorageService } from "../core/service";

@Injectable()
export class DownloadInvestigationsService {
  private API_PATH_EXPERIMENTS: string = "/experiments";

  constructor(
    private _http: HttpService,
    private _storageService: StorageService
  ) {}

  getExperiments(searchParams?: URLSearchParams): Observable<any> {
    return this._http
      .get(`${this.API_PATH_EXPERIMENTS}`, { search: searchParams });
  }

  getExperiment(id: string): Observable<any> {
    return this._http
      .get(`${this.API_PATH_EXPERIMENTS}/${id}`);
  }
}
