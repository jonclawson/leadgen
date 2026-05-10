import { Component, EventEmitter, OnInit, Output, input, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, ValidatorFn } from '@angular/forms';
import { CommonModule } from '@angular/common';
import TextFieldComponent from './fields/text-field.component';
import PasswordFieldComponent from './fields/password-field.component';
import SubmitButtonComponent from './fields/submit-button.component';

export type FormFieldType = 'email' | 'password' | 'button';

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
