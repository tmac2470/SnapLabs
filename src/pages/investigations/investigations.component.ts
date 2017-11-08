// Angular
import { Component } from "@angular/core";
// Ionic
import {
  ActionSheetController,
  NavController,
  LoadingController,
  Platform
} from "ionic-angular";
// SnapApp
import { ToastService } from "../core/service";
import { InvestigationDetailsPageComponent } from "../investigation-details";
import { InvestigationsService } from "./investigations.service";
import { Investigation } from "../investigation-details";
import { DownloadInvestigationsService } from "../download-investigations";
import { ConnectPageComponent } from "../connect";

class SortInvestigations {
  static NAME = "labTitle";
}

@Component({
  selector: "investigations-page-component",
  templateUrl: "investigations.view.html",
  styles: ["./investigations.styles.scss"]
})
export class InvestigationsPageComponent {
  connectPageComponent = ConnectPageComponent;
  sortOrderInvestigations: string = SortInvestigations.NAME;
  localInvestigationFiles: any[] = [
    {
      name: "Balloon_Pressure_Investigation.json",
      local: true
    },
    {
      name: "Classroom_Heat_and_Light_Investigation.json",
      local: true
    },
    {
      name: "Investigating_the_SensorTags.json",
      local: true
    },
    {
      name: "Magnetic_Mining_Investigation.json",
      local: true
    },
    {
      name: "Rocket_Acceleration_Investigation.json",
      local: true
    },
    {
      name: "Thermal_Conductivity.json",
      local: true
    }
  ];

  investigations: Investigation[] = [];

  constructor(
    private _actionSheetController: ActionSheetController,
    private _downloadInvestigationsService: DownloadInvestigationsService,
    private _investigationsService: InvestigationsService,
    private _loadingCtrl: LoadingController,
    private platform: Platform,
    private _navCtrl: NavController,
    private _toastService: ToastService
  ) {}

  // LifeCycle methods
  ionViewDidLoad() {
    this.investigations = [];
    this.loadLocalInvestigationData(this.localInvestigationFiles);
    this.getLocalInvestigations();
  }

  loadLocalInvestigationData(files: any[]) {
    files.map((file, i) => {
      this._investigationsService
        .getLocalInvestigationFile(file.name)
        .subscribe(fileData => {
          fileData.local = true;
          this.investigations.push(fileData);
        });
    });
  }

  updateInvestigation(investigation: any) {
    const loading = this.loading();
    this._downloadInvestigationsService
      .updateInvestigation(investigation._id)
      .subscribe(_ => {
        this._toastService.present({
          message: "Investigation details successfully updated!",
          duration: 3000
        });
        loading.dismiss();
      });
  }

  deleteInvestigation(investigation: any) {
    const loading = this.loading();

    this._downloadInvestigationsService
      .deleteInvestigation(investigation._id)
      .subscribe(_ => {
        this._toastService.present({
          message: "Investigation deleted!",
          duration: 3000
        });

        this.investigations = this.investigations.filter(i => {
          return i._id !== investigation._id;
        });

        loading.dismiss();
      });
  }

  openInvestigationOptions(investigation: any) {
    let cssClass = investigation.local ? "disabled" : "";
    let buttons = [
      {
        cssClass: "",
        text: "Open",
        icon: !this.platform.is("ios") ? "open" : null,
        handler: () => {
          this.openInvestigationDetails(investigation);
        }
      },
      {
        cssClass: cssClass,
        text: "Fetch updates from server",
        icon: !this.platform.is("ios") ? "refresh" : null,
        handler: () => {
          if (!investigation.local) {
            this.updateInvestigation(investigation);
          }
        }
      },
      {
        cssClass: cssClass,
        text: "Delete",
        role: "destructive",
        icon: !this.platform.is("ios") ? "trash" : null,
        handler: () => {
          if (!investigation.local) {
            this.deleteInvestigation(investigation);
          }
        }
      },
      {
        cssClass: "",
        text: "Cancel",
        role: "cancel", // will always sort to be on the bottom
        icon: !this.platform.is("ios") ? "close" : null
      }
    ];

    const actionSheet = this._actionSheetController.create({
      title: "Investigation Options",
      buttons: buttons
    });
    actionSheet.present();
  }

  getLocalInvestigations() {
    this._downloadInvestigationsService
      .getLocalInvestigations()
      .subscribe(investigations => {
        if (!!investigations && investigations.length) {
          this.investigations = this.investigations.concat(investigations);
        }
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

  // Helper to open a given investigation details page
  openInvestigationDetails(investigation: Investigation) {
    this._navCtrl.push(InvestigationDetailsPageComponent, {
      investigation: investigation
    });
  }

  // Helper to open a given page
  openPage(page: any) {
    this._navCtrl.push(page);
  }
}
