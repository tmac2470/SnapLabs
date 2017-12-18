// Other libraries
import * as moment from "moment";
import "rxjs/add/operator/toPromise";
import * as json2csv from "json2csv";

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
// Ionic
import { Platform } from "ionic-angular";
// SnapApp
import { AccountService } from "../../account/account.service";

@Injectable()
export class FileService {
  constructor(
    private file: File,
    private _accountService: AccountService,
    private platform: Platform
  ) {
    if (this.platform.is("ios")) {
      this.isIOS();
    }
  }

  // Root folder where all files are stored for the app
  // externalCacheDirectory is the default for android apps
  private dirRoot: string = this.file.externalCacheDirectory;
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

  // iOS related settings
  isIOS() {
    // iOS can only store in documentsDirectory
    this.dirRoot = this.file.documentsDirectory;
  }

  /**
   * How to
   *
   * 1. Check if the default directory exists
   * 2. If no, create the default directory at the supplied location.
   * 3. If yes, return the files from the directory.
   */

  createDefaultDir(
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
    return this.checkDefaultDir()
      .then(success => {
        return this.file.listDir(root, dir);
      })
      .catch(rootFolderNotFound => {
        return this.createDefaultDir().then(success => {
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

  convertArrayToCSV(fields: string[], data: any[]) {
    const csv = json2csv({ data: data, fields: fields });
    return csv;
  }

  getFileExtension(experimentTitle: any): Promise<string> {
    experimentTitle = experimentTitle.split(" ");
    experimentTitle = experimentTitle.join("_");

    return this._accountService
      .getUser()
      .toPromise()
      .then(user => {
        let userExt = user.email;
        if (user.username) {
          userExt = `${user.username}_${userExt}`;
        }

        const timestamp = moment().format("DD_MM_YYYY_HH_mm");
        const fileName = `${timestamp}_${experimentTitle}_${userExt}.csv`;

        return fileName;
      });
  }

  saveExperimentData(
    fileName: string,
    text: string | Blob
  ): Promise<FileEntry> {
    return this.checkDefaultDir().then(_ => {
      return this.saveFileToStorage(fileName, text);
    });
  }

  private saveFileToStorage(
    fileName: string,
    text: string | Blob,
    folder: string = this.getStorageLocation().fullPath
  ): Promise<any> {
    return this.file.writeFile(folder, fileName, text, {
      replace: true
    });
  }
}
