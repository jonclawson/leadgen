import { Component, OnInit, signal } from '@angular/core';
import { authClient } from '../../lib/auth-client';
import { RouterModule } from '@angular/router';
import { JsonPipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-auth',
  template: `
    @if (!user()) {
      <button mat-stroked-button routerLink="/signin">Sign In</button>
      <button mat-flat-button color="primary" routerLink="/signup">Sign Up</button>
    } @else {
      <span class="auth-welcome">{{ user()?.name }}</span>
      <button mat-stroked-button routerLink="/signout">Sign Out</button>
    }
  `,
  imports: [
        RouterModule,
        JsonPipe,
        MatButtonModule,
  ],
  styles: [`
    .auth-welcome {
      font-size: 0.875rem;
      color: #6b7280;
      margin-right: 8px;
    }
  `]
})
export default class AuthComponent implements OnInit {
  public user = signal<any | null>(null);

  async ngOnInit() {
    await this.getSession();
  }

  async getSession() {
    const session = await authClient.getSession();
    this.user.set(session.data?.user ?? null);
    console.log('Current session:',  this.user());
  }

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
    console.log("Login successful:", data);
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

  async signOut() {
    const { error } = await authClient.signOut();
    if (error) {
      console.error(error.message);
      return;
    }
    // Handle successful sign out
    console.log("Signed out successfully");
  }
}
