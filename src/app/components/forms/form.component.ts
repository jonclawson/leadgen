import { Component, EventEmitter, OnInit, Output, input, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import TextFieldComponent from './fields/text-field.component';
import PasswordFieldComponent from './fields/password-field.component';
import SubmitButtonComponent from './fields/submit-button.component';
import TextareaFieldComponent from './fields/textarea-field.component';
import SelectFieldComponent from './fields/select-field.component';
import CheckboxFieldComponent from './fields/checkbox-field.component';
import RadioFieldComponent from './fields/radio-field.component';
import type { FormFieldDefinitionData } from '../../services/dynamic-form.service';

export type FormFieldType = 'text' | 'password' | 'button' | 'textarea' | 'select' | 'checkbox' | 'radio';

// For runtime use with ValidatorFn[]
export interface FormFieldDefinition {
  type: FormFieldType;
  key: string;
  label?: string;
  icon?: string;
  placeholder?: string;
  value?: string;
  validators?: string; // CSV string like "required,email,minLength:8"
  options?: string; // JSON string for select/radio options or config
  buttonLabel?: string;
  buttonColor?: 'primary' | 'accent' | 'warn';
  disabled?: boolean;
  order?: number;
}

export interface TextField {
  type: 'text';
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

export interface TextareaField {
  type: 'textarea';
  key: string;
  label: string;
  icon?: string;
  placeholder: string;
  rows?: number;
  value?: string;
  validators?: ValidatorFn[];
}

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectField {
  type: 'select';
  key: string;
  label: string;
  icon?: string;
  placeholder?: string;
  options: SelectOption[];
  value?: string;
  validators?: ValidatorFn[];
}

export interface CheckboxField {
  type: 'checkbox';
  key: string;
  label: string;
  value?: boolean;
  validators?: ValidatorFn[];
}

export interface RadioField {
  type: 'radio';
  key: string;
  label: string;
  options: SelectOption[];
  value?: string;
  validators?: ValidatorFn[];
}

export type FormField = TextField | PasswordField | ButtonField | TextareaField | SelectField | CheckboxField | RadioField;

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
  const rawType = def.type;
  const type = rawType === 'email' ? 'text' : (rawType as FormFieldType);
  
  // Parse options JSON if present
  const parseOptions = (optionsStr?: string): SelectOption[] => {
    if (!optionsStr) return [];
    try {
      return JSON.parse(optionsStr);
    } catch {
      return [];
    }
  };

  // Parse config JSON for simple properties (e.g., {"rows": 5})
  const parseConfig = (optionsStr?: string): any => {
    if (!optionsStr) return {};
    try {
      return JSON.parse(optionsStr);
    } catch {
      return {};
    }
  };
  
  if (type === 'text' || type === 'password') {
    return {
      type,
      key: def.key,
      label: def.label || '',
      icon: def.icon || '',
      placeholder: def.placeholder || '',
      validators: parseValidators(def.validators)
    } as TextField | PasswordField;
  } else if (type === 'textarea') {
    const config = parseConfig(def.options);
    return {
      type: 'textarea',
      key: def.key,
      label: def.label || '',
      icon: def.icon,
      placeholder: def.placeholder || '',
      rows: config.rows || 3,
      validators: parseValidators(def.validators)
    } as TextareaField;
  } else if (type === 'select') {
    return {
      type: 'select',
      key: def.key,
      label: def.label || '',
      icon: def.icon,
      placeholder: def.placeholder,
      options: parseOptions(def.options),
      validators: parseValidators(def.validators)
    } as SelectField;
  } else if (type === 'checkbox') {
    const config = parseConfig(def.options);
    return {
      type: 'checkbox',
      key: def.key,
      label: def.label || '',
      value: config.checked || false,
      validators: parseValidators(def.validators)
    } as CheckboxField;
  } else if (type === 'radio') {
    return {
      type: 'radio',
      key: def.key,
      label: def.label || '',
      options: parseOptions(def.options),
      validators: parseValidators(def.validators)
    } as RadioField;
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
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    TextFieldComponent, 
    PasswordFieldComponent, 
    TextareaFieldComponent,
    SelectFieldComponent,
    CheckboxFieldComponent,
    RadioFieldComponent,
    SubmitButtonComponent
  ],
  styleUrls: ['./form.component.css'],
  template: `
    <form class="form" [formGroup]="formGroup()" (ngSubmit)="onSubmit($event)">
      @for (field of model(); track field.key) {
        @if (field.type === 'text') {
          <div class="field-row">
            <app-text-field
              [formGroup]="formGroup()"
              [controlName]="field.key"
              [label]="field.label"
              [icon]="field.icon"
              [placeholder]="field.placeholder">
            </app-text-field>
          </div>
        }

        @if (field.type === 'password') {
          <div class="field-row">
            <app-password-field
              [formGroup]="formGroup()"
              [controlName]="field.key"
              [label]="field.label"
              [icon]="field.icon"
              [placeholder]="field.placeholder">
            </app-password-field>
          </div>
        }

        @if (field.type === 'textarea') {
          <div class="field-row">
            <app-textarea-field
              [formGroup]="formGroup()"
              [controlName]="field.key"
              [label]="field.label"
              [icon]="field.icon || ''"
              [placeholder]="field.placeholder"
              [rows]="field.rows || 3">
            </app-textarea-field>
          </div>
        }

        @if (field.type === 'select') {
          <div class="field-row">
            <app-select-field
              [formGroup]="formGroup()"
              [controlName]="field.key"
              [label]="field.label"
              [icon]="field.icon || ''"
              [placeholder]="field.placeholder || ''"
              [options]="field.options">
            </app-select-field>
          </div>
        }

        @if (field.type === 'checkbox') {
          <div class="field-row">
            <app-checkbox-field
              [formGroup]="formGroup()"
              [controlName]="field.key"
              [label]="field.label">
            </app-checkbox-field>
          </div>
        }

        @if (field.type === 'radio') {
          <div class="field-row">
            <app-radio-field
              [formGroup]="formGroup()"
              [controlName]="field.key"
              [label]="field.label"
              [options]="field.options">
            </app-radio-field>
          </div>
        }

        @if (field.type === 'button') {
          <div class="form-actions">
            <app-submit-button
              [label]="field.buttonLabel"
              [disabled]="field.disabled || formGroup().invalid"
              [color]="field.buttonColor || 'primary'">
            </app-submit-button>
          </div>
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
        // Checkbox fields have boolean values, others have string values
        const defaultValue = field.type === 'checkbox' ? (field.value ?? false) : (field.value ?? '');
        controls[field.key] = [defaultValue, field.validators ?? []];
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
