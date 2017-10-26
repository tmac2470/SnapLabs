// Angular
import { Component } from "@angular/core";
// Ionic
import { NavController, LoadingController } from "ionic-angular";
import { Entry } from '@ionic-native/file';

// SnapApp
import {
  AccountService
} from "../account";
import { ToastService, FileService } from "../core/service";



@Component({
  selector: "file-page-component",
  templateUrl: "file.view.html",
  styles: ["./file.styles.scss"]
})
export class FilePageComponent {

  isLoggedIn: boolean = false;

  files: Entry[];

  constructor(
    private _accountService: AccountService,
    private _loadingCtrl: LoadingController,
    private _navCtrl: NavController,
    private _toastService: ToastService,
    private _fileService: FileService
  ) {
    this.fetchFiles();
  }

  // LifeCycle methods
  ionViewWillEnter() {

  }

  loading() {
    let loader = this._loadingCtrl.create({
      content: "Please wait...",
      duration: 3000
    });
    loader.present();
    return loader;
  }

  private fetchFiles(){
    this._fileService.getFiles().then( entries => {
      this.files = entries;
    })
  }

  deleteFile(entry: Entry){
    this._fileService.deleteFile(entry.name).then(
      result => {
        if(result.success){
          this._toastService.present({
            message:
              `Delete ${entry.name} Successfully`,
            duration: 3000
          });
          this.fetchFiles();
        }else{
          this._toastService.present({
            message:
              `Fail to delete ${entry.name}`,
            duration: 3000
          });
        }
      }
    );
  }

  viewFile(entry: Entry){

  }

  saveDummyFile(){
    this._fileService.saveFile('123','123').then( newEntry => {
      this.files.push(newEntry);
    });
  }


}
