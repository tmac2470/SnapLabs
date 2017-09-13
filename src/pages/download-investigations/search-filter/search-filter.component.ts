// Angular
import { Component } from "@angular/core";
// Ionic
import { ViewController, NavParams } from "ionic-angular";
// SnapApp
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

  constructor(private _viewCtrl: ViewController, navParams: NavParams) {
    this.searchParams = navParams.get("searchParams");
  }

  // LifeCycle methods

  apply() {
    this.close({
      searchParams: this.searchParams
    });
  }

  reset() {
    this.searchParams.afterDate = undefined;
    this.searchParams.beforeDate = undefined;
    this.searchParams.query = undefined;
  }

  close(payload: any) {
    this._viewCtrl.dismiss(payload);
  }
}
