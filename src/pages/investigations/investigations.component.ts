// Angular
import { Component } from '@angular/core';
// Ionic
import { NavController, LoadingController } from 'ionic-angular';
// SnapApp
import { ToastService } from '../core/service';
import { InvestigationDetailsPageComponent } from '../investigation-details';
import { InvestigationsService } from './investigations.service';
import { Investigation } from '../investigation-details';

@Component({
  selector: 'investigations-page-component',
  templateUrl: 'investigations.view.html',
  styles: ['./investigations.styles.scss']
})
export class InvestigationsPageComponent {
  localInvestigationFiles = [
    'Balloon_Pressure_Investigation.json',
    'Classroom_Heat_and_Light_Investigation.json',
    'Investigating_the_SensorTags.json',
    'Magnetic_Mining_Investigation.json',
    'Rocket_Acceleration_Investigation.json'
  ];

  investigations: Investigation[] = [];

  constructor(
    private _investigationsService: InvestigationsService,
    private _loadingCtrl: LoadingController,
    private _navCtrl: NavController,
    private _toastService: ToastService
  ) { }

  // LifeCycle methods
  ionViewDidLoad() {
    this.investigations = [];
    this.loadLocalInvestigationData(this.localInvestigationFiles);
  }

  replaceEscapesWithSpace(fileName: String): String {
    return fileName.replace(/_/g, ' ');
  }

  loadLocalInvestigationData(files: String[]) {
    files.map(file => {
      this._investigationsService.getLocalInvestigationFile(file)
        .subscribe(fileData => {
          this.investigations.push({
            file: file,
            name: this.replaceEscapesWithSpace(file).slice(0, -5),
            data: fileData
          });
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

  // Helper to open a given investigation details page
  openInvestigationDetails(investigation: Investigation) {
    this._navCtrl.push(InvestigationDetailsPageComponent, {
      investigation: investigation
    });
  }
}
