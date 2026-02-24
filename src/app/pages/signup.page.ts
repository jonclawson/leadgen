import { PLATFORM_ID, inject, Component } from '@angular/core';
import SignupComponent from '../components/signup.component';

import { isPlatformBrowser } from '@angular/common';
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
  private platformId = inject(PLATFORM_ID);
  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      // Safe to use window, document, or localStorage here
      console.log('Client Side:', window.location.href);
    }
  }
}