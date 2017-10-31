// Angular
import { Injectable } from "@angular/core";
// Ionic
import { SocialSharing } from "@ionic-native/social-sharing";
// Snaplabs
import { StorageKey, StorageService } from "../core/service";

@Injectable()
export class ShareService {
  constructor(
    private socialSharing: SocialSharing,
    private _storageService: StorageService
  ) {}

  // Methods
  shareViaEmail(
    message: string,
    subject: string,
    recipients: string[],
    file: string
  ): Promise<any> {
    return this.socialSharing
      .canShareViaEmail()
      .then(success => {
        return this.socialSharing.shareViaEmail(
          message,
          subject,
          recipients,
          [],
          [],
          file
        );
      })
      .catch(e => {
        // Sharing via email is not possible
        return new Error("Sharing via Email is not available at the moment");
      });
  }

  saveRecipients(recipients: any[]): Promise<any> {
    return this._storageService.storage.set(
      StorageKey.RECIPIENTS_EMAIL,
      recipients
    );
  }

  getSavedRecipients(): Promise<any[]> {
    return this._storageService.storage.get(StorageKey.RECIPIENTS_EMAIL);
  }
}
