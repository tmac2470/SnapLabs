// Other libraries
import * as moment from 'moment';
import 'rxjs/add/operator/toPromise';

// Angular
import { Injectable } from '@angular/core';
// Ionic
import { File, Entry, FileEntry, DirectoryEntry, RemoveResult } from '@ionic-native/file';

// SnapApp
import { AccountService } from '../../account/account.service';




@Injectable()
export class FileService {

  constructor(
    private _file: File,
    private _accountService: AccountService
  ) {
  }

  private extRoot: string = this._file.externalRootDirectory;
  private storeDir: string = 'SnapLabs';

  getFiles(): Promise<Entry[]> {
    return this._file.listDir(this.extRoot, this.storeDir);
  }

  getFile(fileName: string): Promise<string> {
    return this._file.readAsText(this.extRoot + this.storeDir, fileName);
  }

  deleteFile(fileName: string): Promise<RemoveResult> {
    return this._file.removeFile(this.extRoot + this.storeDir, fileName);
  }

  saveFile(expName: string, text: string): Promise<FileEntry> {


    return this._accountService.getUser().toPromise()
      .then(user => {
        let userName = user.username;
        const timestamp = moment().format('DD_MM_YYYY_HH_mm');
        const fileName = `${userName}_${expName}_${timestamp}.csv`;

        return this.checkStoreDir()
          .then(_ => {
            return this.store(fileName, text)
          });
      })
  }

  private checkStoreDir(): Promise<boolean | DirectoryEntry> {

    return this._file.checkDir(this.extRoot, this.storeDir)
      .then(result => {
        return result;
      })
      .catch(err => {
        return this.createDefaultDir();
      });

  }

  private createDefaultDir(): Promise<DirectoryEntry> {
    return this._file.createDir(this.extRoot, this.storeDir, true);
  }


  private store(fileName: string, text: string): Promise<FileEntry> {
    return this._file.writeFile(this.extRoot + this.storeDir, fileName, text);
  }

}
