import { Component, Input, input, computed, signal } from '@angular/core';
import { 
  FormBuilder, 
  FormGroup, 
  Validators, 
  ReactiveFormsModule, 
  AbstractControl, 
  ValidationErrors 
} from '@angular/forms';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-form',
  template: `
    <form [formGroup]="formGroup()">
      <ng-content></ng-content>
    </form>
  `,
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule]
})
export default class FormComponent {
  readonly formGroup = input.required<FormGroup>();
}