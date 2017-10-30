// Angular
import { Component } from "@angular/core";
// Ionic
import { LoadingController } from "ionic-angular";
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

  constructor(
    private _loadingCtrl: LoadingController,
    private _toastService: ToastService,
    private _fileService: FileService
  ) {}

  // LifeCycle methods
  ionViewWillEnter() {
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
      })
      .catch(e => {
        this._toastService.present({
          message: "File service not available!",
          duration: 3000
        });
      });
  }

  deleteFile(entry: Entry) {
    this._fileService
      .deleteFile(entry.name)
      .then(result => {
        if (result.success) {
          this._toastService.present({
            message: `Deleted file ${entry.name} successfully`,
            duration: 3000
          });
          this.fetchFiles();
        } else {
          this._toastService.present({
            message: `Failed to delete file ${entry.name}`,
            duration: 3000
          });
        }
      })
      .catch(e => {
        this._toastService.present({
          message: "File service not available! " + e,
          duration: 3000
        });
      });
  }

  viewFile(entry: Entry) {}

  saveDummyFile() {
    this._fileService
      .saveFile("123", "123")
      .then(newEntry => {
        this.files.push(newEntry);
      })
      .catch(e => {
        this._toastService.present({
          message: "File service not available! " + e,
          duration: 3000
        });
      });
  }
}
