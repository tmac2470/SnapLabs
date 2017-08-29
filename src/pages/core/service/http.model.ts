// Other libraries
import { Observable } from "rxjs/Observable";
// Angular
import { RequestOptionsArgs } from "@angular/http";

export interface IHttpCustomServiceResponseData<T> {
  count?: number;
  [key: string]: any;
}

export interface IHttpCustomServiceResponse<T> {
  success: boolean;
  data: IHttpCustomServiceResponseData<T>;
}

export interface IHttpCustomService<T> {
  get(
    url: string,
    options?: RequestOptionsArgs
  ): Observable<IHttpCustomServiceResponse<T>>;
  getList(
    url: string,
    options?: RequestOptionsArgs
  ): Observable<IHttpCustomServiceResponse<T>>;
  post(
    url: string,
    body: any,
    options?: RequestOptionsArgs
  ): Observable<IHttpCustomServiceResponse<T>>;
  put(
    url: string,
    body: any,
    options?: RequestOptionsArgs
  ): Observable<IHttpCustomServiceResponse<T>>;
  delete(
    url: string,
    options?: RequestOptionsArgs
  ): Observable<IHttpCustomServiceResponse<T>>;
}

export const HTTP_STATUS = {
  NO_INTERNET: 0,
  UPGRADE_REQUIRED: 426,
  UNAUTHORIZED: 401
};
