import { Component } from '@angular/core';
import SignupComponent from '../components/signup.component';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [
   SignupComponent
  ],
  template: `
    <signup></signup>
  `,
  host: {
    'class': 'signup-page'
  }
})
export default class SignupPageComponent {
  
}