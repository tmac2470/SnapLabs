// Angular
import { Component } from "@angular/core";
// Ionic
import {
  ActionSheetController,
  LoadingController,
  ModalController,
  Platform
} from "ionic-angular";
import { Entry } from "@ionic-native/file";

// SnapApp
import { ToastService, FileService } from "../core/service";
import { ShareService, SharePageComponent } from "../share";

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
    private _shareService: ShareService,
    private platform: Platform,
    private _modalController: ModalController
  ) {}

  // LifeCycle methods
  ionViewWillEnter() {
    this.storageLocationPath = this._fileService.getStorageLocation().fullPath;
    this.fetchFiles();
    // this.createDummyFile();
  }

  createDummyFile() {
    const expName = Math.floor(Math.random() * 100).toString();

    this._fileService
      .saveExperimentData(expName, "LOOOOOOOL")
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

  openSharePageModalAndShareOnDismiss(file: Entry) {
    let modal = this._modalController.create(SharePageComponent);
    modal.onDidDismiss(data => {
      if (data && data.recipients) {
        let emails: string[] = [];

        data.recipients.map(recipient => {
          emails.push(recipient.email);
        });

        console.log(data.recipients);
        console.log(emails);

        // this._shareService.shareViaEmail(
        //   "Hi! Please find the attached experiment data",
        //   "",
        //   [],
        //   file.toURL()
        // );
      }
    });
    modal.present();
  }

  showFileOptions(file: Entry) {
    const actionSheet = this._actionSheetController.create({
      title: "File Options",
      buttons: [
        {
          text: "Share via Email",
          icon: !this.platform.is("ios") ? "share" : null,
          handler: () => {
            console.log("Share clicked");
            this.openSharePageModalAndShareOnDismiss(file);
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
