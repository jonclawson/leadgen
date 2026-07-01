import { Component } from "@angular/core";
import SigninComponent from "../../components/signin.component";

@Component({
  selector: 'signin-page',
  template: `
    <div class="signin-page-wrapper">
      <signin></signin>
    </div>
  `,
  imports: [
    SigninComponent
  ],
  styles: [`
    .signin-page-wrapper {
      display: flex;
      justify-content: center;
      padding: 48px 24px;
    }
  `]
})
export default class SigninPage {}
