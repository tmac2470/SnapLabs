// Other libraries
import * as _ from "lodash";
// Angular
import { Component } from "@angular/core";
// Ionic
import { ViewController } from "ionic-angular";
// Snaplabs
import { ShareService } from "./share.service";

@Component({
  selector: "share-page-component",
  templateUrl: "share.view.html"
})
export class SharePageComponent {
  recipients: any[] = [{ email: "" }];
  previousRecipients: any[] = [];
  selectedRecipients: any[] = [];

  constructor(
    private _viewController: ViewController,
    private _shareService: ShareService
  ) {}

  ionViewWillEnter() {
    this._shareService.getSavedRecipients().then(recipients => {
      this.previousRecipients = recipients || [];
    });
  }

  private saveNewRecipients(newRecipients: any[]) {
    let saveNewRecipients = this.previousRecipients.concat(newRecipients);
    saveNewRecipients = _.uniqBy(saveNewRecipients, recipient => {
      return recipient.name;
    });

    this._shareService.saveRecipients(newRecipients);
  }

  addRecipient(email: string = "") {
    this.recipients.push({
      email: email
    });
  }

  addOldRecipient(event: any, email: string = "") {
    if (event.checked) {
      this.selectedRecipients.push({
        email: email
      });
    } else {
      this.selectedRecipients = this.selectedRecipients.filter(recipient => {
        return recipient.email !== email;
      });
    }
  }

  done(data: any) {
    let recipients: string[] = this.recipients.filter(recipient => {
      return !!recipient.email;
    });

    recipients = recipients.concat(this.selectedRecipients);

    this.saveNewRecipients(recipients);
    this._viewController.dismiss({
      recipients
    });
  }
}
