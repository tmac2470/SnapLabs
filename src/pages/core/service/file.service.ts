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
  private dirRoot: string = this.file.externalRootDirectory;
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

  convertArrayToCSV(objArray: any) {
    var array = typeof objArray != "object" ? JSON.parse(objArray) : objArray;
    var str = "";
    var row = "";
    for (var index in objArray[0]) {
      //Now convert each value to string and comma-seprated
      row += index + ",";
    }
    row = row.slice(0, -1);
    //append Label row with line break
    str += row + "\r\n";
    for (var i = 0; i < array.length; i++) {
      var line = "";
      for (var index in array[i]) {
        if (line != "") line += ",";
        line += '"' + array[i][index] + '"';
      }
      str += line + "\r\n";
    }
    return str;
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
        const fileName = `${userExt}_${experimentTitle}_${timestamp}.csv`;

        return fileName;
      });
  }

  saveExperimentData(fileName: string, text: string): Promise<FileEntry> {
    return this.checkDefaultDir().then(_ => {
      return this.saveFileToStorage(fileName, text);
    });
  }

  private saveFileToStorage(
    fileName: string,
    text: string,
    folder: string = this.getStorageLocation().fullPath
  ): Promise<any> {
    return this.file
      .createFile(folder, fileName, true)
      .then(success => {
        return this.file.writeExistingFile(folder, fileName, text);
      })
      .catch(e => {
        return new Error("Unable to write file");
      });
  }
}