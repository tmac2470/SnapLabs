// Angular
import { Component } from "@angular/core";
// Ionic
import { ViewController } from "ionic-angular";
// SnapApp
import { ISearchParams } from "./../download-investigations.model";

class DatePickerOptions {
  static DisplayFormat = "YYYY-MM-DD";
  static PickerFormat = "DD MMM YYYY";
}

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

  constructor(private _viewCtrl: ViewController) {}

  // LifeCycle methods

  apply() {
    this.close(this.searchParams);
  }

  close(payload: any) {
    this._viewCtrl.dismiss(payload);
  }
}
