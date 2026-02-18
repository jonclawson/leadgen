import { Component } from '@angular/core';
import { authClient } from '../../lib/auth-client';

@Component({
  selector: 'app-auth',
  template: `
    <button (click)="signIn()">Sign In</button>
    <button (click)="signUp()">Sign Up</button>
  `,
})
export default class AuthComponent {
  async signIn() {
    const { data, error } = await authClient.signIn.email({
      email: "admin@example.com",
      password: "admin123",
    });
    
    if (error) {
      console.error(error.message);
      return;
    }
    // Handle successful login
  }

  async signUp() {
    const { data, error } = await authClient.signUp.email({
      email: "admin@example.com",
      password: "admin123",
      name: "Admin User",
    });
    
    if (error) {
      console.error(error.message);
      return;
    }
    // Handle successful sign up
    console.log("Sign up successful:", data);
  }

}