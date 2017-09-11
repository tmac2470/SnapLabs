// Angular
import { Component } from "@angular/core";
// Ionic
import { ViewController } from "ionic-angular";
// SnapApp
import { SearchSortOptions } from "./../download-investigations.model";

@Component({
  selector: "search-sort-page-component",
  templateUrl: "search-sort.view.html"
})
export class SearchSortPageComponent {
  searchSortOptions = SearchSortOptions;
  sort: string;
  constructor(private _viewCtrl: ViewController) {}

  // LifeCycle methods

  apply() {
    this.close({
      sort: this.sort
    });
  }

  close(payload: any) {
    this._viewCtrl.dismiss(payload);
  }
}
