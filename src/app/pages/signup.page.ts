import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-signup',
  standalone: true,
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
  template: `
    <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <mat-card class="w-full max-w-md shadow-2xl">
        <mat-card-header class="text-center pb-6">
          <div class="w-full">
            <mat-card-title class="text-3xl font-bold text-gray-800 mb-2">
              Create Account
            </mat-card-title>
            <mat-card-subtitle class="text-gray-600 text-base">
              Join us today and get started
            </mat-card-subtitle>
          </div>
        </mat-card-header>
        
        <mat-card-content class="px-6 pb-6">
          <form [formGroup]="signupForm" (ngSubmit)="onSubmit()" class="space-y-4">
            <!-- Name Fields Row -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <mat-form-field appearance="outline" class="w-full">
                <mat-label>First Name</mat-label>
                <input matInput formControlName="firstName" required 
                       class="text-sm">
                <mat-icon matSuffix class="text-gray-400">person</mat-icon>
                <mat-error *ngIf="signupForm.get('firstName')?.hasError('required')">
                  First name is required
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Last Name</mat-label>
                <input matInput formControlName="lastName" required 
                       class="text-sm">
                <mat-error *ngIf="signupForm.get('lastName')?.hasError('required')">
                  Last name is required
                </mat-error>
              </mat-form-field>
            </div>

            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Email Address</mat-label>
              <input matInput type="email" formControlName="email" required 
                     class="text-sm" placeholder="you@example.com">
              <mat-icon matSuffix class="text-gray-400">email</mat-icon>
              <mat-error *ngIf="signupForm.get('email')?.hasError('required')">
                Email is required
              </mat-error>
              <mat-error *ngIf="signupForm.get('email')?.hasError('email')">
                Please enter a valid email address
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Password</mat-label>
              <input matInput [type]="hidePassword ? 'password' : 'text'" 
                     formControlName="password" required class="text-sm">
              <button mat-icon-button matSuffix 
                      (click)="hidePassword = !hidePassword" 
                      type="button"
                      class="text-gray-400 hover:text-gray-600">
                <mat-icon>{{hidePassword ? 'visibility_off' : 'visibility'}}</mat-icon>
              </button>
              <mat-error *ngIf="signupForm.get('password')?.hasError('required')">
                Password is required
              </mat-error>
              <mat-error *ngIf="signupForm.get('password')?.hasError('minlength')">
                Password must be at least 8 characters
              </mat-error>
              <mat-error *ngIf="signupForm.get('password')?.hasError('pattern')">
                Password must contain uppercase, lowercase, number and special character
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Confirm Password</mat-label>
              <input matInput [type]="hideConfirmPassword ? 'password' : 'text'" 
                     formControlName="confirmPassword" required class="text-sm">
              <button mat-icon-button matSuffix 
                      (click)="hideConfirmPassword = !hideConfirmPassword" 
                      type="button"
                      class="text-gray-400 hover:text-gray-600">
                <mat-icon>{{hideConfirmPassword ? 'visibility_off' : 'visibility'}}</mat-icon>
              </button>
              <mat-error *ngIf="signupForm.get('confirmPassword')?.hasError('required')">
                Please confirm your password
              </mat-error>
              <mat-error *ngIf="signupForm.hasError('passwordMismatch') && !signupForm.get('confirmPassword')?.hasError('required')">
                Passwords do not match
              </mat-error>
            </mat-form-field>

            <!-- Terms and Conditions -->
            <div class="flex items-start space-x-2 py-2">
              <mat-checkbox formControlName="acceptTerms" 
                           class="mt-1"
                           color="primary">
              </mat-checkbox>
              <label class="text-sm text-gray-600 leading-relaxed">
                I agree to the 
                <a href="#" class="text-blue-600 hover:text-blue-800 underline">Terms of Service</a> 
                and 
                <a href="#" class="text-blue-600 hover:text-blue-800 underline">Privacy Policy</a>
              </label>
            </div>
            <mat-error *ngIf="signupForm.get('acceptTerms')?.hasError('required')" 
                       class="text-red-500 text-xs mt-1">
              You must accept the terms and conditions
            </mat-error>

            <!-- Submit Button -->
            <!-- [disabled]="signupForm.invalid || isLoading" -->
            <button mat-raised-button color="primary" type="submit" 
                    class="w-full h-12 text-base font-semibold mt-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-200">
              <mat-icon *ngIf="isLoading" class="animate-spin mr-2">refresh</mat-icon>
              {{ isLoading ? 'Creating Account...' : 'Create Account' }}
            </button>
          </form>
        </mat-card-content>

        <mat-card-actions class="px-6 pb-6 pt-0">
          <div class="text-center w-full">
            <div class="flex items-center justify-center space-x-4 mb-4">
              <div class="flex-1 h-px bg-gray-300"></div>
              <span class="text-gray-500 text-sm">or</span>
              <div class="flex-1 h-px bg-gray-300"></div>
            </div>
            
            <!-- Social Login Buttons -->
            <div class="grid grid-cols-2 gap-3 mb-6">
              <button mat-stroked-button class="h-10 text-sm border-gray-300 hover:bg-gray-50">
                <mat-icon class="mr-2">
                  <svg class="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                </mat-icon>
                Google
              </button>
              <button mat-stroked-button class="h-10 text-sm border-gray-300 hover:bg-gray-50">
                <mat-icon class="mr-2">facebook</mat-icon>
                Facebook
              </button>
            </div>

            <p class="text-sm text-gray-600">
              Already have an account? 
              <a routerLink="/login" 
                 class="text-blue-600 hover:text-blue-800 font-semibold underline transition-colors duration-200">
                Sign in here
              </a>
            </p>
          </div>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export default class SignupPageComponent {
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
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
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
        
        // TODO: Implement actual signup logic here
        // Example: await this.authService.signup(formData)
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Navigate to success page or login
        this.router.navigate(['/login'], { 
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