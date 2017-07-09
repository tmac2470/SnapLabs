// Other libraries
import { Observable } from 'rxjs/Observable';
// Angular
import { Injectable } from '@angular/core';
import { Http } from '@angular/http';

@Injectable()
export class InvestigationsService {
  LOCAL_INVESTIGATION_FILE_PATH = 'assets/data/';
  constructor(
    private http: Http
  ) {
  }

  getLocalInvestigationFile(fileName: String): Observable<any> {
    return this.http.get(`${this.LOCAL_INVESTIGATION_FILE_PATH}${fileName}`)
      .map(data => data.json());
  }
}
