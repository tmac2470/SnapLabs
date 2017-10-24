// Angular
import { Injectable } from '@angular/core';
// Ionic
import { File, Entry } from '@ionic-native/file';

@Injectable()
export class FileService {

  constructor(
    private _file: File
  ) {

  }

  private extRoot = this._file.externalRootDirectory;
  private storeDir = 'SnapLabs';

  listDir(): Promise<Entry []> {
    return this._file.listDir(this.extRoot, './');
  }

  private checkStoreDir(){
    return this._file.checkDir(this.extRoot, this.storeDir);
  }

  private store(fileName: string){

  }

}
