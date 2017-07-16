// Angular
import { Component } from "@angular/core";
// Ionic
import { NavController, Keyboard } from "ionic-angular";
// App
import { IUserCredentials } from "../account.model";
import { AccountService } from "../account.service";
import { ToastService } from "../../core/service";

export enum DataType {
  PASSWORD,
  STRING,
  BOOLEAN
}
@Component({
  selector: "signup-page-component",
  templateUrl: "signup.view.html"
})
export class SignupPageComponent {
  DataType = DataType;
  passwordDataType: DataType = DataType.PASSWORD;
  credentials: IUserCredentials = {
    email: "",
    // password: '',
    username: ""
  };

  constructor(
    private _accountService: AccountService,
    private _keyboard: Keyboard,
    private _navCtrl: NavController,
    private _toastService: ToastService
  ) {}

  // Signup Handler
  signup(credentials: IUserCredentials) {
    this._keyboard.close();
    this._accountService.createAccount(credentials).subscribe(data => {
      this._toastService.present({
        message: `Welcome ${credentials.username}!`
      });
      this._navCtrl.pop();
    });
  }

  // Toggle the visibility of password field
  togglePasswordVisibility() {
    if (this.passwordDataType === DataType.PASSWORD) {
      this.passwordDataType = DataType.STRING;
    } else {
      this.passwordDataType = DataType.PASSWORD;
    }
  }
}
