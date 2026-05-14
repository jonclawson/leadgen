import { Component, computed, input } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatRadioModule } from '@angular/material/radio';
import { CommonModule } from '@angular/common';

export interface RadioOption {
  value: string;
  label: string;
}

@Component({
  selector: 'app-radio-field',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatRadioModule,
  ],
  template: `
    <div class="radio-field">
      <label class="radio-field__label">{{ label() }}</label>
      <mat-radio-group 
        [formControl]="control()"
        class="radio-field__group">
        @for (option of options(); track option.value) {
          <mat-radio-button [value]="option.value">
            {{ option.label }}
          </mat-radio-button>
        }
      </mat-radio-group>
      @if (formGroup().get(controlName())?.hasError('required') && formGroup().get(controlName())?.touched) {
        <div class="radio-error">{{ label() }} is required</div>
      }
    </div>
  `,
  styles: [`
    .radio-field {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      padding: 0.5rem 0;
    }

    .radio-field__label {
      font-size: 0.875rem;
      font-weight: 500;
      color: rgba(0, 0, 0, 0.87);
    }

    .radio-field__group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      margin-left: 0.5rem;
    }

    .radio-error {
      color: #f44336;
      font-size: 0.75rem;
      margin-left: 0.5rem;
    }
  `]
})
export default class RadioFieldComponent {
  readonly label = input('');
  readonly formGroup = input.required<FormGroup>();
  readonly controlName = input.required<string>();
  readonly options = input<RadioOption[]>([]);
  readonly control = computed(() => this.formGroup().get(this.controlName()) as FormControl);
}
