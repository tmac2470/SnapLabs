// Others
import * as _ from "lodash";
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
import { ISearchParams } from "./download-investigations.model";

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
    perPage: 10
    // before: new Date(),
    // after: new Date("24 Jan 2017")
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
    this.getApiInvestigations();
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

  getApiInvestigations() {
    const loading = this.loading();

    this._downloadInvestigationsService
      .getInvestigations(this.processParams(this.searchParams))
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
    const modal = this._modalCtrl.create(page);
    modal.present();

    modal.onDidDismiss(data => {
      console.log(data);
    });
  }

  openPopover(page: any) {
    const popover = this._popoverCtrl.create(page);
    popover.present();

    popover.onDidDismiss(data => {
      console.log(data);
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
