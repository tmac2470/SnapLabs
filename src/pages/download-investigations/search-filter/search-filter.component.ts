// Other
import * as moment from "moment";
// Angular
import { Component } from "@angular/core";
// Ionic
import { ViewController, NavParams } from "ionic-angular";
// SnapApp
import { ToastService } from "../../core/service";
import {
  ISearchParams,
  DatePickerOptions
} from "./../download-investigations.model";

@Component({
  selector: "search-filter-page-component",
  templateUrl: "search-filter.view.html"
})
export class SearchFilterPageComponent {
  datePickerOptions = DatePickerOptions;
  searchParams: ISearchParams = {
    page: "1",
    perPage: 50
  };
  constructor(
    private _viewCtrl: ViewController,
    navParams: NavParams,
    private _toastService: ToastService
  ) {
    this.searchParams = navParams.get("searchParams");
  }

  // LifeCycle methods

  apply() {
    this.close({
      searchParams: this.searchParams
    });
  }

  checkDates() {
    const condition = moment(this.searchParams.afterDate).isAfter(
      this.searchParams.beforeDate
    );

    if (condition) {
      this._toastService.present({
        message: "From date must be before To date",
        duration: 3000
      });
      this.searchParams.beforeDate = null;
    }
  }

  reset() {
    this.searchParams.afterDate = null;
    this.searchParams.beforeDate = null;
    this.searchParams.query = null;
  }

  close(payload: any) {
    this._viewCtrl.dismiss(payload);
  }
}
