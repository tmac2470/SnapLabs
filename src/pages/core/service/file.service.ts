// Other libraries
import * as moment from "moment";
import "rxjs/add/operator/toPromise";

// Angular
import { Injectable } from "@angular/core";
// Ionic
import {
  File,
  Entry,
  FileEntry,
  DirectoryEntry,
  RemoveResult
} from "@ionic-native/file";

// SnapApp
import { AccountService } from "../../account/account.service";

@Injectable()
export class FileService {
  constructor(private file: File, private _accountService: AccountService) {}

  // Root folder where all files are stored for the app
  private dirRoot: string = this.file.dataDirectory;
  // Root folder extension or the folder inside the root folder to store the data files
  private dirExt: string = "SnapLabs";

  // Set up the data storage directories
  getStorageLocation() {
    return {
      root: this.dirRoot,
      dir: this.dirExt,
      fullPath: `${this.dirRoot}${this.dirExt}`
    };
  }

  /**
   * How to
   *
   * 1. Check if the default directory exists
   * 2. If no, create the default directory at the supplied location.
   * 3. If yes, return the files from the directory.
   */

  private createDefaultDir(
    directory: string = this.getStorageLocation().dir,
    replace: boolean = false
  ): Promise<DirectoryEntry> {
    return this.file.createDir(
      this.getStorageLocation().root,
      directory,
      replace
    );
  }

  private checkDefaultDir(): Promise<boolean> {
    return this.file.checkDir(this.dirRoot, this.dirExt);
  }

  getFiles(
    root: string = this.getStorageLocation().root,
    dir: string = this.getStorageLocation().dir
  ): Promise<Entry[]> {
    console.log("Fetching files from", root, dir);

    return this.checkDefaultDir()
      .then(success => {
        return this.file.listDir(root, dir);
      })
      .catch(rootFolderNotFound => {
        return this.createDefaultDir()
        .then(success => {
          return this.file.listDir(root, dir);
        });
      });
  }

  getFile(
    fileName: string,
    folder: string = this.getStorageLocation().fullPath
  ): Promise<string> {
    return this.file.readAsText(folder, fileName);
  }

  deleteFile(
    fileName: string,
    folder: string = this.getStorageLocation().fullPath
  ): Promise<RemoveResult> {
    return this.file.removeFile(folder, fileName);
  }

  saveExperimentData(experiment: string, text: string): Promise<FileEntry> {
    return this._accountService
      .getUser()
      .toPromise()
      .then(user => {
        let userName = user.username;
        const timestamp = moment().format("DD_MM_YYYY_HH_mm");
        const fileName = `${userName}_${experiment}_${timestamp}.csv`;

        return this.checkDefaultDir().then(_ => {
          return this.saveFileToStorage(fileName, text);
        });
      });
  }

  private saveFileToStorage(
    fileName: string,
    text: string,
    folder: string = this.getStorageLocation().fullPath
  ): Promise<FileEntry> {
    return this.file.writeFile(folder, fileName, text);
  }
}
