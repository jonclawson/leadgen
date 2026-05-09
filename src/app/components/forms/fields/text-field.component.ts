// an angular component for a text field in a form
import { Component, Input, input, computed } from '@angular/core';
import { 
  FormBuilder, 
  FormGroup, 
  Validators, 
  ReactiveFormsModule, 
  AbstractControl, 
  ValidationErrors 
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-text-field',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
  ],  
  template: `
      <mat-form-field class="field">
      <mat-label>{{ label() }}</mat-label>
      <input matInput 
        type="text" 
        [formControlName]="controlName()" 
        required 
        class="field__input--text">
      <mat-icon matSuffix class="field__icon">{{icon()}}</mat-icon>
      @if (formGroup().get(controlName())?.hasError('required')) {
        <mat-error>{{ label() }} is required</mat-error>
      }
    </mat-form-field>
  `,
  // styleUrls: ['./text-field.component.css'],
})
export default class TextFieldComponent {
  readonly label = input('');
  readonly formGroup = input.required<FormGroup>();
  readonly controlName = input('');
  readonly icon = input('');
}