// Angular
import { Component } from "@angular/core";
// Ionic
import {
  LoadingController,
  ActionSheetController,
  Platform
} from "ionic-angular";
import { Entry } from "@ionic-native/file";

// SnapApp
import { ToastService, FileService } from "../core/service";

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
    private _loadingCtrl: LoadingController,
    private _toastService: ToastService,
    private _fileService: FileService,
    private platform: Platform
  ) {}

  // LifeCycle methods
  ionViewWillEnter() {
    this.storageLocationPath = this._fileService.getStorageLocation().fullPath;
    this.fetchFiles();
    this.createDummyFile();
  }

  createDummyFile() {
    const expName = Math.floor(Math.random() * 100).toString();

    this._fileService
      .saveFile(expName, "LOOOOOOOL")
      .then(success => {
        console.log(success);
      })
      .catch(e => console.log(e));
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
      })
      .catch(e => {
        console.log(e);
        this._toastService.present({
          message: "File service not available!",
          duration: 3000
        });
      });
  }

  showFileOptions(file: Entry) {
    const actionSheet = this._actionSheetController.create({
      title: "File Options",
      buttons: [
        {
          text: "Share",
          icon: !this.platform.is("ios") ? "share" : null,
          handler: () => {
            console.log("Share clicked");
          }
        },
        {
          text: "Delete",
          role: "destructive",
          icon: !this.platform.is("ios") ? "trash" : null,
          handler: () => {
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
                console.log(e);
                this._toastService.present({
                  message: "File could not be deleted! ",
                  duration: 3000
                });
              });
          }
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
