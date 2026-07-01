import { Component, computed, input } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-text-field',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
  ],
  template: `
    <mat-form-field class="field" appearance="outline">
      <mat-label>{{ label() }}</mat-label>
      <input matInput 
        [type]="type()"
        [formControl]="control()"
        [name]="controlName()"
        [autocomplete]="controlName()"
        [placeholder]="placeholder()"
        class="field__input--text">
      @if (icon()) {
        <mat-icon matSuffix class="field__icon">{{ icon() }}</mat-icon>
      }
      @if (formGroup().get(controlName())?.hasError('required')) {
        <mat-error>{{ label() }} is required</mat-error>
      }
      @if (formGroup().get(controlName())?.hasError('email')) {
        <mat-error>Please enter a valid email address</mat-error>
      }
    </mat-form-field>
  `,
})
export default class TextFieldComponent {
  readonly label = input('');
  readonly formGroup = input.required<FormGroup>();
  readonly controlName = input.required<string>();
  readonly icon = input('');
  readonly placeholder = input('');
  readonly type = input('text');
  readonly control = computed(() => this.formGroup().get(this.controlName()) as FormControl);
}
