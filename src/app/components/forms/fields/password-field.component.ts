import { Component, computed, input, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-password-field',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
  ],
  template: `
    <mat-form-field class="field">
      <mat-label>{{ label() }}</mat-label>
      <input matInput
             [type]="hidePassword() ? 'password' : 'text'"
             [formControl]="control()"
             [name]="controlName()"
             [autocomplete]="controlName()"
             [placeholder]="placeholder()"
             autocomplete="current-password"
             class="field__input--text">

      @if (icon()) {
        <mat-icon matSuffix class="field__icon">{{ icon() }}</mat-icon>
      }

      <button mat-icon-button matSuffix type="button" (click)="toggleVisibility()">
        <mat-icon>{{ hidePassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
      </button>

      @if (formGroup().get(controlName())?.hasError('required')) {
        <mat-error>{{ label() }} is required</mat-error>
      }
    </mat-form-field>
  `,
})
export default class PasswordFieldComponent {
  readonly formGroup = input.required<FormGroup>();
  readonly controlName = input.required<string>();
  readonly label = input('');
  readonly icon = input('');
  readonly placeholder = input('');
  readonly hidePassword = signal(true);
  readonly control = computed(() => this.formGroup().get(this.controlName()) as FormControl);

  toggleVisibility() {
    this.hidePassword.update(value => !value);
  }
}
