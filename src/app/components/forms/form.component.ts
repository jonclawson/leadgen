import { Component, EventEmitter, OnInit, Output, input, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import TextFieldComponent from './fields/text-field.component';
import PasswordFieldComponent from './fields/password-field.component';
import SubmitButtonComponent from './fields/submit-button.component';
import type { FormFieldDefinitionData } from '../../services/dynamic-form.service';

export type FormFieldType = 'email' | 'password' | 'button';

// For runtime use with ValidatorFn[]
export interface FormFieldDefinition {
  type: FormFieldType;
  key: string;
  label?: string;
  icon?: string;
  placeholder?: string;
  value?: string;
  validators?: string; // CSV string like "required,email,minLength:8"
  buttonLabel?: string;
  buttonColor?: 'primary' | 'accent' | 'warn';
  disabled?: boolean;
  order?: number;
}

export interface EmailField {
  type: 'email';
  key: string;
  label: string;
  icon: string;
  placeholder: string;
  value?: string;
  validators?: ValidatorFn[];
}

export interface PasswordField {
  type: 'password';
  key: string;
  label: string;
  icon: string;
  placeholder: string;
  value?: string;
  validators?: ValidatorFn[];
}

export interface ButtonField {
  type: 'button';
  key: string;
  buttonLabel: string;
  buttonColor?: 'primary' | 'accent' | 'warn';
  disabled?: boolean;
}

export type FormField = EmailField | PasswordField | ButtonField;

// Utility function to parse validator string into ValidatorFn[]
export function parseValidators(validatorString?: string): ValidatorFn[] {
  if (!validatorString || validatorString.trim() === '') return [];
  
  const validators: ValidatorFn[] = [];
  const parts = validatorString.split(',').map(v => v.trim());
  
  for (const part of parts) {
    if (part === 'required') {
      validators.push(Validators.required);
    } else if (part === 'email') {
      validators.push(Validators.email);
    } else if (part.startsWith('minLength:')) {
      const length = parseInt(part.split(':')[1], 10);
      if (!isNaN(length)) validators.push(Validators.minLength(length));
    } else if (part.startsWith('maxLength:')) {
      const length = parseInt(part.split(':')[1], 10);
      if (!isNaN(length)) validators.push(Validators.maxLength(length));
    } else if (part.startsWith('pattern:')) {
      const pattern = part.substring('pattern:'.length);
      if (pattern) validators.push(Validators.pattern(pattern));
    }
  }
  
  return validators;
}

// Convert FormFieldDefinitionData from API to FormField for runtime use
export function convertFormFieldDefinition(def: FormFieldDefinitionData): FormField {
  const type = def.type as FormFieldType;
  
  if (type === 'email' || type === 'password') {
    return {
      type,
      key: def.key,
      label: def.label || '',
      icon: def.icon || '',
      placeholder: def.placeholder || '',
      validators: parseValidators(def.validators)
    } as EmailField | PasswordField;
  } else {
    return {
      type: 'button',
      key: def.key || 'submit',
      buttonLabel: def.buttonLabel || 'Submit',
      buttonColor: def.buttonColor || 'primary',
    } as ButtonField;
  }
}

@Component({
  selector: 'app-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TextFieldComponent, PasswordFieldComponent, SubmitButtonComponent],
  template: `
    <form [formGroup]="formGroup()" (ngSubmit)="onSubmit($event)">
      @for (field of model(); track field.key) {
        @if (field.type === 'email') {
          <app-text-field
            [formGroup]="formGroup()"
            [controlName]="field.key"
            [label]="field.label"
            [icon]="field.icon"
            [placeholder]="field.placeholder">
          </app-text-field>
        }

        @if (field.type === 'password') {
          <app-password-field
            [formGroup]="formGroup()"
            [controlName]="field.key"
            [label]="field.label"
            [icon]="field.icon"
            [placeholder]="field.placeholder">
          </app-password-field>
        }

        @if (field.type === 'button') {
          <app-submit-button
            [label]="field.buttonLabel"
            [disabled]="field.disabled || formGroup().invalid"
            [color]="field.buttonColor || 'primary'">
          </app-submit-button>
        }
      }
    </form>
  `
})
export default class FormComponent implements OnInit {
  readonly model = input.required<FormField[]>();
  @Output() readonly submit = new EventEmitter<Record<string, unknown>>();

  readonly formGroup = signal(this.fb.group({}));
  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.formGroup.set(this.createFormGroup(this.model()));
  }

  private createFormGroup(fields: FormField[]) {
    const controls: Record<string, any> = {};

    fields.forEach(field => {
      if (field.type !== 'button' && field.key) {
        controls[field.key] = [field.value ?? '', field.validators ?? []];
      }
    });

    return this.fb.group(controls);
  }

  onSubmit(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    if (this.formGroup().valid) {
      this.submit.emit(this.formGroup().value);
    } else {
      this.formGroup().markAllAsTouched();
    }
  }
}
