import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { CommonModule } from '@angular/common';
import { authClient } from '../../lib/auth-client';

@Component({
  selector: 'signup',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule
  ],
  styleUrls: ['./signup.component.css'],
  template: `
    <div class="signup__container">
      <mat-card class="signup__card" appearance="outlined">
        <mat-card-header class="signup__header">
          <div class="signup__header-wrapper">
            <mat-card-title class="signup__title">
              Create Account
            </mat-card-title>
            <mat-card-subtitle class="signup__subtitle">
              Join us today and get started
            </mat-card-subtitle>
          </div>
        </mat-card-header>
        
        <mat-card-content class="signup__content">
          <form [formGroup]="signupForm" (ngSubmit)="onSubmit()" class="signup__form">
            <!-- Name Fields Row -->
            <div class="signup__name-fields">
              <mat-form-field  class="signup__field-group" appearance="outline">
                <mat-label>First Name</mat-label>
                <input matInput formControlName="firstName" required 
                       class="signup__input">
                <mat-icon matSuffix class="signup__icon">person</mat-icon>
                @if (signupForm.get('firstName')?.hasError('required')) {
                  <mat-error>First name is required</mat-error>
                }
              </mat-form-field>

              <mat-form-field  class="signup__field-group" appearance="outline">
                <mat-label>Last Name</mat-label>
                <input matInput formControlName="lastName" required 
                       class="signup__input">
                @if (signupForm.get('lastName')?.hasError('required')) {
                  <mat-error>Last name is required</mat-error>
                }
              </mat-form-field>
            </div>

            <mat-form-field  class="signup__field-group" appearance="outline">
              <mat-label>Email Address</mat-label>
              <input matInput type="email" formControlName="email" required 
                     class="signup__input" placeholder="you@example.com">
              <mat-icon matSuffix class="signup__icon">email</mat-icon>
              @if (signupForm.get('email')?.hasError('required')) {
                <mat-error>Email is required</mat-error>
              }
              @if (signupForm.get('email')?.hasError('email')) {
                <mat-error>Please enter a valid email address</mat-error>
              }
            </mat-form-field>

            <mat-form-field  class="signup__field-group" appearance="outline">
              <mat-label>Password</mat-label>
              <input matInput [type]="hidePassword ? 'password' : 'text'" 
                     formControlName="password" 
                     required class="signup__input" 
                     autocomplete="new-password">
              <button mat-icon-button matSuffix 
                      (click)="hidePassword = !hidePassword" 
                      type="button"
                      class="signup__icon signup__icon--hover">
                <mat-icon>{{hidePassword ? 'visibility_off' : 'visibility'}}</mat-icon>
              </button>
              @if (signupForm.get('password')?.hasError('required')) {
                <mat-error>Password is required</mat-error>
              }
              @if (signupForm.get('password')?.hasError('minlength')) {
                <mat-error>Password must be at least 8 characters</mat-error>
              }
              @if (signupForm.get('password')?.hasError('pattern')) {
                <mat-error>Password must contain uppercase, lowercase, number and special character</mat-error>
              }
            </mat-form-field>

            <mat-form-field  class="signup__field-group" appearance="outline">
              <mat-label>Confirm Password</mat-label>
              <input matInput [type]="hideConfirmPassword ? 'password' : 'text'" 
                     formControlName="confirmPassword" required class="signup__input" 
                     autocomplete="new-password">
              <button mat-icon-button matSuffix 
                      (click)="hideConfirmPassword = !hideConfirmPassword" 
                      type="button"
                      class="signup__icon signup__icon--hover">
                <mat-icon>{{hideConfirmPassword ? 'visibility_off' : 'visibility'}}</mat-icon>
              </button>
              @if (signupForm.get('confirmPassword')?.hasError('required')) {
                <mat-error>Please confirm your password</mat-error>
              }
              @if (signupForm.hasError('passwordMismatch') && !signupForm.get('confirmPassword')?.hasError('required')) {
                <mat-error>Passwords do not match</mat-error>
              }
            </mat-form-field>

            <!-- Terms and Conditions -->
            <div class="signup__terms">
              <mat-checkbox formControlName="acceptTerms" 
                           class="signup__terms-checkbox"
                           color="primary">
              </mat-checkbox>
              <label class="signup__terms-label">
                I agree to the 
                <a href="#" class="signup__terms-link">Terms of Service</a> 
                and 
                <a href="#" class="signup__terms-link">Privacy Policy</a>
              </label>
            </div>
            @if (signupForm.get('acceptTerms')?.hasError('required')) {
              <mat-error class="signup__error">
                You must accept the terms and conditions
              </mat-error>
            }

            <!-- Submit Button -->
            <button mat-flat-button color="primary" type="submit" 
                    [disabled]="signupForm.invalid || isLoading"
                    class="signup__submit-btn">
              @if (isLoading) {
                <mat-icon class="signup__loading-icon">refresh</mat-icon>
              }
              {{ isLoading ? 'Creating Account...' : 'Create Account' }}
            </button>
          </form>
        </mat-card-content>

        <mat-card-actions class="signup__actions">
          <div class="signup__actions-wrapper">
            <div class="signup__divider">
              <div class="signup__divider-line"></div>
              <span class="signup__divider-text">or</span>
              <div class="signup__divider-line"></div>
            </div>
            
            <!-- Social Login Buttons -->
            <div class="signup__social-buttons">
              <button mat-stroked-button class="signup__social-btn">
                <mat-icon class="signup__social-icon">
                  <svg class="signup__social-icon--google" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                </mat-icon>
                Google
              </button>
              <button mat-stroked-button class="signup__social-btn">
                <mat-icon class="signup__social-icon">facebook</mat-icon>
                Facebook
              </button>
            </div>

            <p class="signup__login-text">
              Already have an account? 
              <a routerLink="/signin" 
                 class="signup__login-link">
                Sign in here
              </a>
            </p>
          </div>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  host: {
    'class': 'signup'
  }
})
export default class SignupComponent {
  signupForm: FormGroup;
  hidePassword = true;
  hideConfirmPassword = true;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {
    this.signupForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [
        Validators.required, 
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      ]],
      confirmPassword: ['', [Validators.required]],
      acceptTerms: [false, [Validators.requiredTrue]]
    }, 
    { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const form = control as FormGroup;       // cast if you need Group API
    const pw = form.get('password');
    const cp = form.get('confirmPassword');

    if (pw && cp && pw.value !== cp.value) {
      return { passwordMismatch: true };
    }
    return null;
  }

  async onSubmit() {
    if (this.signupForm.valid) {
      this.isLoading = true;
      
      try {
        const formData = this.signupForm.value;
        console.log('Signup form data:', formData);
        
        const { data, error } = await authClient.signUp.email({
            email: formData.email,
            password: formData.password,
            name: `${formData.firstName} ${formData.lastName}`,
        });

        // Navigate to success page or login
        this.router.navigate(['/signin'], { 
          queryParams: { message: 'Account created successfully! Please sign in.' }
        });
        
      } catch (error) {
        console.error('Signup error:', error);
        // TODO: Handle error (show toast, etc.)
      } finally {
        this.isLoading = false;
      }
    }
  }
}