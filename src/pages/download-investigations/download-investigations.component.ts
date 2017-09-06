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
  urlSearchParams: URLSearchParams = new URLSearchParams();
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
    this.getExperiments();
  }

  processParams(searchParams: ISearchParams): URLSearchParams {
    this.searchParams = searchParams;
    this.urlSearchParams.set("page", searchParams.page || "1");

    _.forEach(searchParams, (value, key) => {
      this.urlSearchParams.set(key, !!value ? value : undefined);
    });

    return this.urlSearchParams;
  }

  getExperiments() {
    const loading = this.loading();

    this._downloadInvestigationsService
      .getExperiments(this.processParams(this.searchParams))
      .subscribe(data => {
        this.investigations = data;
        loading.dismiss();
      });
  }

  // Helper to open a given page
  openPage(page: any) {
    this._navCtrl.push(page);
  }

  // Helper to open a given investigation details page
  openInvestigationDetails(investigation: Investigation) {
    this._downloadInvestigationsService
      .getExperiment(investigation._id)
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
