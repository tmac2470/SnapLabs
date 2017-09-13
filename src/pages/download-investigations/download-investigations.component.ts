// Others
import * as _ from "lodash";
import * as moment from "moment";
// Angular
import { Component } from "@angular/core";
import { URLSearchParams } from "@angular/http";
// Ionic
import {
  ModalController,
  NavController,
  PopoverController,
  LoadingController
} from "ionic-angular";
// SnapApp
import { DownloadInvestigationsService } from "./download-investigations.service";
import { Investigation } from "../investigation-details";
import { InvestigationDetailsPageComponent } from "../investigation-details";
import { SearchSortPageComponent } from "./search-sort";
import { SearchFilterPageComponent } from "./search-filter";
import {
  ISearchParams,
  DateFormat,
  SearchSortOptions
} from "./download-investigations.model";

@Component({
  selector: "download-investigations-page-component",
  templateUrl: "download-investigations.view.html",
  styles: ["./download-investigations.styles.scss"]
})
export class DownloadInvestigationsPageComponent {
  investigations: Investigation[] = [];
  localInvestigations: Investigation[] = [];
  urlSearchParams: URLSearchParams = new URLSearchParams();
  visibleDetailsPanelId: string = "";
  searchParams: ISearchParams = {
    page: "1",
    perPage: 10,
    fields: "all",
    afterDate: moment()
      .add("-20", "days")
      .format(DateFormat.API),
    beforeDate: moment().format(DateFormat.API),
    sort: SearchSortOptions.UPDATEDDESC
  };

  constructor(
    private _modalCtrl: ModalController,
    private _navCtrl: NavController,
    private _loadingCtrl: LoadingController,
    private _popoverCtrl: PopoverController,
    private _downloadInvestigationsService: DownloadInvestigationsService
  ) {}

  // LifeCycle methods
  ionViewDidLoad() {
    this.investigations = [];
    this.localInvestigations = [];

    this.getLocalInvestigations();
    this.getApiInvestigations(this.searchParams);
  }

  processParams(searchParams: ISearchParams): URLSearchParams {
    this.searchParams = searchParams;
    this.urlSearchParams.set("page", searchParams.page || "1");

    _.forEach(searchParams, (value, key) => {
      this.urlSearchParams.set(key, !!value ? value : undefined);
    });

    return this.urlSearchParams;
  }

  getLocalInvestigations() {
    this._downloadInvestigationsService
      .getLocalInvestigations()
      .subscribe(investigations => {
        this.localInvestigations = investigations;
      });
  }

  getApiInvestigations(searchParams) {
    const loading = this.loading();

    this._downloadInvestigationsService
      .getInvestigations(this.processParams(searchParams))
      .subscribe(data => {
        this.investigations = data;
        loading.dismiss();
      });
  }

  // Helper to open a given page
  openPage(page: any) {
    this._navCtrl.push(page);
  }

  openSortOptions() {
    this.openPopover(SearchSortPageComponent);
  }

  openFilterOptions() {
    this.openModal(SearchFilterPageComponent);
  }

  openModal(page: any) {
    const modal = this._modalCtrl.create(page, {
      searchParams: this.searchParams
    });
    modal.present();

    modal.onDidDismiss(data => {
      if (data && data.searchParams) {
        this.searchParams = data.searchParams;
        this.getApiInvestigations(this.searchParams);
      }
    });
  }

  openPopover(page: any) {
    const popover = this._popoverCtrl.create(page, {
      searchParams: this.searchParams
    });
    popover.present();

    popover.onDidDismiss(data => {
      if (data && data.searchParams) {
        this.searchParams = data.searchParams;
        this.getApiInvestigations(this.searchParams);
      }
    });
  }

  openDetailsPanel(id: string) {
    if (this.visibleDetailsPanelId === id) {
      this.visibleDetailsPanelId = null;
    } else {
      this.visibleDetailsPanelId = id;
    }
  }

  isInvestigationLocal(investigation: Investigation) {
    const exists = this.localInvestigations.some(i => {
      return i._id === investigation._id;
    });
    return exists;
  }

  // Download and add it to local
  downloadInvestigation(investigation: Investigation) {
    const loading = this.loading();

    // To keep the panel open
    this.openDetailsPanel(investigation._id);
    this._downloadInvestigationsService
      .saveInvestigation(investigation)
      .subscribe(localInvestigations => {
        this.localInvestigations = localInvestigations;
        loading.dismiss();
      });
  }

  // Helper to open a given investigation details page
  openInvestigationDetails(investigation: Investigation) {
    this._downloadInvestigationsService
      .getInvestigation(investigation._id)
      .subscribe(investigationDetails => {
        this._navCtrl.push(InvestigationDetailsPageComponent, {
          investigation: investigationDetails
        });
      });
  }

  loading() {
    let loader = this._loadingCtrl.create({
      content: "Please wait...",
      duration: 3000
    });
    loader.present();
    return loader;
  }
}
