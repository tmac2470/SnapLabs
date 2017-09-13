// Angular
import { Component } from "@angular/core";
// Ionic
import { ViewController, NavParams } from "ionic-angular";
// SnapApp
import {
  ISearchParams,
  SearchSortOptions
} from "./../download-investigations.model";

@Component({
  selector: "search-sort-page-component",
  templateUrl: "search-sort.view.html"
})
export class SearchSortPageComponent {
  searchSortOptions = SearchSortOptions;
  sort: string;
  searchParams: ISearchParams = {
    page: "1",
    perPage: 50
  };

  constructor(private _viewCtrl: ViewController, navParams: NavParams) {
    this.searchParams = navParams.get("searchParams");
    this.sort = this.searchParams.sort;
  }

  // LifeCycle methods

  apply() {
    this.searchParams.sort = this.sort;
    this.close({
      searchParams: this.searchParams
    });
  }

  close(payload: any) {
    this._viewCtrl.dismiss(payload);
  }
}
