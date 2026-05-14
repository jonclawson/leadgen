import { Component, computed, input } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

export interface SelectOption {
  value: string;
  label: string;
}

@Component({
  selector: 'app-select-field',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatIconModule,
  ],
  template: `
    <mat-form-field class="field">
      <mat-label>{{ label() }}</mat-label>
      <mat-select 
        [formControl]="control()" 
        [placeholder]="placeholder() || 'Select an option'">
        @for (option of options(); track option.value) {
          <mat-option [value]="option.value">{{ option.label }}</mat-option>
        }
      </mat-select>
      @if (icon()) {
        <mat-icon matSuffix class="field__icon">{{ icon() }}</mat-icon>
      }
      @if (formGroup().get(controlName())?.hasError('required')) {
        <mat-error>{{ label() }} is required</mat-error>
      }
    </mat-form-field>
  `,
})
export default class SelectFieldComponent {
  readonly label = input('');
  readonly formGroup = input.required<FormGroup>();
  readonly controlName = input.required<string>();
  readonly icon = input('');
  readonly placeholder = input('');
  readonly options = input<SelectOption[]>([]);
  readonly control = computed(() => this.formGroup().get(this.controlName()) as FormControl);
}
