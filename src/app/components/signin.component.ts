import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Validators } from '@angular/forms';
import { authClient } from '../../lib/auth-client';
import FormComponent, { FormField } from './forms/form.component';

@Component({
  selector: 'signin',
  standalone: true,
  imports: [CommonModule, FormComponent],
  styles: [`
    .signin {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background: #f9fafb;
      padding: 24px;
    }

    .signin-card {
      width: 100%;
      max-width: 400px;
      background: white;
      border-radius: 12px;
      padding: 32px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      border: 1px solid #e5e7eb;
    }

    .signin-card h1 {
      font-size: 1.875rem;
      font-weight: 700;
      margin: 0 0 8px;
      color: #111827;
    }

    .signin-card p {
      font-size: 0.9375rem;
      color: #6b7280;
      margin: 0 0 24px;
    }
  `],
  template: `
    <div class="signin">
      <div class="signin-card">
        <h1>Sign In</h1>
        <p>Sign in to your account to access your dashboard.</p>
        <app-form [model]="signInModel" (submit)="onSubmit($event)"></app-form>
      </div>
    </div>
  `,
})
export default class SigninComponent implements OnInit {
  public user = signal<any | null>(null);

  async ngOnInit() {
    await this.getSession();
    if (this.user()) {
      // Redirect to dashboard if already signed in
      window.location.href = '/';
    }
  }

  async getSession() {
    const session = await authClient.getSession();
    this.user.set(session.data?.user ?? null);
    console.log('Current session:',  this.user());
  }
    
  readonly signInModel: FormField[] = [
    {
      type: 'text',
      key: 'email',
      label: 'Email Address',
      icon: 'email',
      placeholder: 'you@example.com',
      validators: [Validators.required, Validators.email],
    },
    {
      type: 'password',
      key: 'password',
      label: 'Password',
      icon: 'lock',
      placeholder: 'Enter your password',
      validators: [Validators.required],
    },
    {
      type: 'button',
      key: 'submit',
      buttonLabel: 'Sign In',
      buttonColor: 'primary',
    },
  ];

  async onSubmit(value: Record<string, unknown>) {
    const email = String(value.email ?? '');
    const password = String(value.password ?? '');

    const { data, error } = await authClient.signIn.email({
      email,
      password,
    });

    if (error) {
      console.error('Signin error:', error.message);
      return;
    }

    console.log('Signed in successfully', data);
    // Redirect to dashboard or home page after successful sign in
    window.location.href = '/articles/list';
  }
}
