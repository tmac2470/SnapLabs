// Angular
import { Component } from "@angular/core";
import * as _ from "lodash";
// Ionic
import {
  ActionSheetController,
  AlertController,
  LoadingController,
  ModalController,
  Platform
} from "ionic-angular";
import { Entry } from "@ionic-native/file";

// SnapApp
import { ToastService, FileService } from "../core/service";
import { ShareService } from "../share";

@Component({
  selector: "file-page-component",
  templateUrl: "saved-files.view.html",
  styles: ["./saved-files.styles.scss"]
})
export class SavedFilesPageComponent {
  files: Entry[];
  storageLocationPath: string;

  constructor(
    private _actionSheetController: ActionSheetController,
    private _alertController: AlertController,
    private _loadingCtrl: LoadingController,
    private _toastService: ToastService,
    private _fileService: FileService,
    private _shareService: ShareService,
    private platform: Platform,
    private _modalController: ModalController
  ) {}

  // LifeCycle methods
  ionViewWillEnter() {
    this.storageLocationPath = this._fileService.getStorageLocation().fullPath;
    this.fetchFiles();
  }

  loading() {
    let loader = this._loadingCtrl.create({
      content: "Please wait...",
      duration: 3000
    });
    loader.present();
    return loader;
  }

  private fetchFiles() {
    this._fileService
      .getFiles()
      .then(entries => {
        this.files = entries;
        this.files = _.sortBy(this.files, file => {
          return file.name;
        });
      })
      .catch(e => {
        this._toastService.present({
          message: "File service not available!",
          duration: 3000
        });
      });
  }

  shareFileViaEmail(file: Entry) {
    console.log("lol");
    this._shareService
      .shareViaEmail(
        "Hello! Please find the attached experiment data.",
        "Snaplabs: Experiment data file " + file.name,
        [],
        file.nativeURL
      )
      .then(e => {
        if (e instanceof Error) {
          this._toastService.present({
            message: e.message,
            duration: 3000
          });
        }
      })
      .catch(e => {
        this._toastService.present({
          message: e.message,
          duration: 3000
        });
      });
  }

  deleteFileConfirmation(file) {
    let confirm = this._alertController.create({
      title: "Delete file",
      message: `Delete the file ${file.name} permanently?`,
      buttons: [
        {
          text: "No",
          handler: () => {
            // Nothing
          }
        },
        {
          text: "Yes",
          handler: () => {
            this.deleteFile(file);
          }
        }
      ]
    });
    confirm.present();
  }

  deleteFile(file) {
    this._fileService
      .deleteFile(file.name)
      .then(e => {
        this.files = this.files.filter(f => {
          return f.name !== file.name;
        });

        this._toastService.present({
          message: `File ${file.name} deleted!`,
          duration: 3000
        });
      })
      .catch(e => {
        this._toastService.present({
          message: "File could not be deleted! ",
          duration: 3000
        });
      });
  }

  showFileOptions(file: Entry) {
    const actionSheet = this._actionSheetController.create({
      title: "File Options",
      buttons: [
        {
          text: "Share via Email",
          icon: !this.platform.is("ios") ? "share" : null,
          handler: () => {
            this.shareFileViaEmail(file);
          }
        },
        {
          text: "Delete",
          role: "destructive",
          icon: !this.platform.is("ios") ? "trash" : null,
          handler: () => this.deleteFileConfirmation(file)
        },
        {
          text: "Cancel",
          role: "cancel", // will always sort to be on the bottom
          icon: !this.platform.is("ios") ? "close" : null
        }
      ]
    });
    actionSheet.present();
  }
}
