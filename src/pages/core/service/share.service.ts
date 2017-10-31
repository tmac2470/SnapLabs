// Angular
import { Injectable } from "@angular/core";
// Ionic
import { SocialSharing } from "@ionic-native/social-sharing";

@Injectable()
export class ShareService {
  constructor(private socialSharing: SocialSharing) {}

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
          null,
          null,
          file
        );
      })
      .catch(e => {
        console.log(e);
        // Sharing via email is not possible
        return new Error("Sharing via Email is not available at the moment");
      });
  }
}
