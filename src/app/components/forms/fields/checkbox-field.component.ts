import { Component, computed, input } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-checkbox-field',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCheckboxModule,
  ],
  template: `
    <div class="checkbox-field">
      <mat-checkbox [formControl]="control()">
        {{ label() }}
      </mat-checkbox>
      @if (formGroup().get(controlName())?.hasError('required') && formGroup().get(controlName())?.touched) {
        <div class="checkbox-error">{{ label() }} is required</div>
      }
    </div>
  `,
  styles: [`
    .checkbox-field {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      padding: 0.5rem 0;
    }

    .checkbox-error {
      color: #f44336;
      font-size: 0.75rem;
      margin-left: 32px;
    }
  `]
})
export default class CheckboxFieldComponent {
  readonly label = input('');
  readonly formGroup = input.required<FormGroup>();
  readonly controlName = input.required<string>();
  readonly control = computed(() => this.formGroup().get(this.controlName()) as FormControl);
}
