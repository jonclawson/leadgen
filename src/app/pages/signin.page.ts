import { Component } from "@angular/core";
import SigninComponent from "../components/signin.component";

@Component({
  selector: 'signin-page',
  template: `<signin></signin>`,
  imports: [
    SigninComponent
  ]
})
export default class SigninPage {


}