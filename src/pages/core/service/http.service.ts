// Other libraries
import * as _ from "lodash";
import { Observable } from "rxjs/Observable";
import "rxjs/add/observable/forkJoin";
import "rxjs/add/observable/fromPromise";
import "rxjs/add/observable/of";
import "rxjs/add/observable/throw";
import "rxjs/add/operator/catch";
import "rxjs/add/operator/map";
import "rxjs/add/operator/merge";
import "rxjs/add/operator/mergeMap";
// Angular
import { EventEmitter, Injectable } from "@angular/core";
import { Headers, Http, Response, RequestOptionsArgs } from "@angular/http";
// SnapApp
import { environment } from "../../environment";
import { AppError } from "./error.model";
import { NetworkService } from "./network.service";
import { HTTP_STATUS } from "./http.model";

@Injectable()
export class HttpService {
  errorEmitter = new EventEmitter<any>();
  private API_PATH: string = environment.appConfig.apiURL;

  constructor(
    private _http: Http,
    private _networkService: NetworkService
  ) {}

  private _getUrl(url: string): Observable<string> {
    const finalUrl = _.startsWith(url, "/") ? `${this.API_PATH}${url}` : url;
    return Observable.of<string>(finalUrl);
  }

  private _getOptions(
    options: RequestOptionsArgs
  ): Observable<RequestOptionsArgs> {
    const newOptions = Object.assign({}, options);
    newOptions.headers = newOptions.headers || new Headers();
    newOptions.headers.append("app-version", environment.version);
    return Observable.of(newOptions);
  }

  private _getBasicAuthOptions(
    options: RequestOptionsArgs
  ): Observable<RequestOptionsArgs> {
    const newOptions = Object.assign({}, options);
    newOptions.headers = newOptions.headers || new Headers();
    newOptions.headers.append("Content-Type", "application/json");
    newOptions.headers.append(
      "Authorization",
      `Basic ${btoa(environment.appConfig.SEGMENT_API_KEY)}`
    );
    return Observable.of(newOptions);
  }

  private _getUrlAndOptions(
    url: string,
    options: RequestOptionsArgs
  ): Observable<[string, RequestOptionsArgs]> {
    return Observable.forkJoin(this._getUrl(url), this._getOptions(options));
  }

  private _handleError(error: any): Observable<any> {
    let errorData = error.message
      ? error
      : _.isFunction(error.json) ? error.json() : undefined;
    if (!_.isString(errorData.message)) {
      errorData = undefined;
    }
    this.errorEmitter.emit({
      status: error.status,
      message: errorData,
      url: error.url
    });
    return Observable.throw(
      new Error(errorData ? errorData.message : undefined)
    );
  }

  private mapResult(data: Response): Response {
    return data;
  }

  private _checkConnectivity(): Observable<any> {
    return Observable.of(this._networkService.connected).mergeMap(connected => {
      if (connected) {
        return Observable.of(connected);
      } else {
        return Observable.throw(
          new AppError(HTTP_STATUS.NO_INTERNET, "No network")
        );
      }
    });
  }

  get(url: string, options?: RequestOptionsArgs): Observable<Response> {
    return this._checkConnectivity()
      .mergeMap(_ => this._getUrlAndOptions(url, options))
      .mergeMap(([updatedUrl, updatedOptions]) =>
        this._http.get(updatedUrl, updatedOptions)
      )
      .map(this.mapResult)
      .catch(error => this._handleError(error));
  }

  post(
    url: string,
    body: any,
    options?: RequestOptionsArgs
  ): Observable<Response> {
    return this._checkConnectivity()
      .mergeMap(_ => this._getUrlAndOptions(url, options))
      .mergeMap(([updatedUrl, updatedOptions]) =>
        this._http.post(updatedUrl, body, updatedOptions)
      )
      .map(this.mapResult)
      .catch(error => this._handleError(error));
  }

  postBasicAuth(
    url: string,
    body: any,
    options?: RequestOptionsArgs
  ): Observable<Response> {
    /**
     * Given the current use case,
     * ie only tracking calls use this api
     * We can safely skip the api calls when there's no internet connection
     */
    if (!this._networkService.connected) {
      return Observable.of(undefined);
    }
    return this._checkConnectivity()
      .mergeMap(_ => this._getUrlAndOptions(url, options))
      .mergeMap(_ => this._http.post(url, body))
      .mergeMap(_ => this._getBasicAuthOptions(options))
      .mergeMap(updatedOptions => this._http.post(url, body, updatedOptions))
      .catch(error => this._handleError(error));
  }

  put(
    url: string,
    body: any,
    options?: RequestOptionsArgs
  ): Observable<Response> {
    return this._checkConnectivity()
      .mergeMap(_ => this._getUrlAndOptions(url, options))
      .mergeMap(([updatedUrl, updatedOptions]) =>
        this._http.put(updatedUrl, body, updatedOptions)
      )
      .map(this.mapResult)
      .catch(error => this._handleError(error));
  }

  delete(url: string, options?: RequestOptionsArgs): Observable<Response> {
    return this._checkConnectivity()
      .mergeMap(_ => this._getUrlAndOptions(url, options))
      .mergeMap(([updatedUrl, updatedOptions]) =>
        this._http.delete(updatedUrl, updatedOptions)
      )
      .map(this.mapResult)
      .catch(error => this._handleError(error));
  }

  patch(
    url: string,
    body: any,
    options?: RequestOptionsArgs
  ): Observable<Response> {
    return this._checkConnectivity()
      .mergeMap(_ => this._getUrlAndOptions(url, options))
      .mergeMap(([updatedUrl, updatedOptions]) =>
        this._http.patch(updatedUrl, body, updatedOptions)
      )
      .map(this.mapResult)
      .catch(error => this._handleError(error));
  }

  head(url: string, options?: RequestOptionsArgs): Observable<Response> {
    return this._checkConnectivity()
      .mergeMap(_ => this._getUrlAndOptions(url, options))
      .mergeMap(([updatedUrl, updatedOptions]) =>
        this._http.head(updatedUrl, updatedOptions)
      )
      .map(this.mapResult)
      .catch(error => this._handleError(error));
  }
}
