// Others
import * as _ from "lodash";
// Angular
import { Component } from "@angular/core";
import { URLSearchParams } from "@angular/http";
// Ionic
import { NavController, LoadingController } from "ionic-angular";
// SnapApp
import { DownloadInvestigationsService } from "./download-investigations.service";
import { Investigation } from "../investigation-details";
import { InvestigationDetailsPageComponent } from "../investigation-details";

export interface ISearchParams {
  before?: Date;
  after?: Date;
  content?: string;
  field?: string;
  sort?: string;
  page: string;
}

@Component({
  selector: "download-investigations-page-component",
  templateUrl: "download-investigations.view.html"
})
export class DownloadInvestigationsPageComponent {
  investigations: Investigation[] = [];
  localInvestigations: Investigation[] = [];
  urlSearchParams: URLSearchParams = new URLSearchParams();
  visibleDetailsPanelId: string = "";
  searchParams: ISearchParams = {
    page: "1"
    // before: new Date(),
    // after: new Date("24 Jan 2017")
  };

  constructor(
    private _navCtrl: NavController,
    private _loadingCtrl: LoadingController,
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
