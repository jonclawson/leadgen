import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { FormFieldDefinitionData } from '../../services/dynamic-form.service';

interface ValidatorOption {
  value: string;
  label: string;
  hasParam?: boolean;
}

@Component({
  selector: 'app-field-editor-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatCheckboxModule,
    MatIconModule
  ],
  template: `
    <h2 mat-dialog-title>{{ data.field ? 'Edit Field' : 'Add Field' }}</h2>
    
    <mat-dialog-content>
      <form [formGroup]="fieldForm" class="field-form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Field Type</mat-label>
          <mat-select formControlName="type" required>
            <mat-option value="email">Email</mat-option>
            <mat-option value="password">Password</mat-option>
            <mat-option value="button">Button</mat-option>
          </mat-select>
        </mat-form-field>

        @if (fieldType() !== 'button') {
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Field Key</mat-label>
            <input matInput formControlName="key" required 
              placeholder="e.g., email, password">
            @if (fieldForm.get('key')?.hasError('required')) {
              <mat-error>Key is required</mat-error>
            }
            @if (fieldForm.get('key')?.hasError('duplicate')) {
              <mat-error>This key is already used</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Label</mat-label>
            <input matInput formControlName="label" required
              placeholder="e.g., Email Address">
            @if (fieldForm.get('label')?.hasError('required')) {
              <mat-error>Label is required</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Icon (optional)</mat-label>
            <input matInput formControlName="icon"
              placeholder="e.g., email, lock">
            <mat-icon matPrefix>{{ fieldForm.get('icon')?.value || 'input' }}</mat-icon>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Placeholder (optional)</mat-label>
            <input matInput formControlName="placeholder"
              placeholder="e.g., Enter your email">
          </mat-form-field>

          <div class="validators-section">
            <h4>Validators</h4>
            <div class="validators-grid">
              @for (validator of availableValidators; track validator.value) {
                <div class="validator-option">
                  <mat-checkbox 
                    [checked]="selectedValidators().includes(validator.value)"
                    (change)="toggleValidator(validator.value, $event.checked)">
                    {{ validator.label }}
                  </mat-checkbox>
                  @if (validator.hasParam && selectedValidators().includes(validator.value)) {
                    <mat-form-field appearance="outline" class="param-input">
                      <mat-label>Value</mat-label>
                      <input matInput type="number" 
                        [value]="getValidatorParam(validator.value)"
                        (input)="updateValidatorParam(validator.value, $any($event.target).value)">
                    </mat-form-field>
                  }
                </div>
              }
            </div>
          </div>
        } @else {
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Button Label</mat-label>
            <input matInput formControlName="buttonLabel" required
              placeholder="e.g., Submit">
            @if (fieldForm.get('buttonLabel')?.hasError('required')) {
              <mat-error>Button label is required</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Button Color</mat-label>
            <mat-select formControlName="buttonColor">
              <mat-option value="primary">Primary</mat-option>
              <mat-option value="accent">Accent</mat-option>
              <mat-option value="warn">Warn</mat-option>
            </mat-select>
          </mat-form-field>
        }
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="cancel()">Cancel</button>
      <button mat-raised-button color="primary" (click)="save()" 
        [disabled]="fieldForm.invalid">
        {{ data.field ? 'Update' : 'Add' }} Field
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .field-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
      min-width: 500px;
    }

    .full-width {
      width: 100%;
    }

    .validators-section {
      margin-top: 16px;
    }

    .validators-section h4 {
      margin: 0 0 12px 0;
      font-size: 16px;
      font-weight: 500;
    }

    .validators-grid {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .validator-option {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .param-input {
      width: 150px;
      margin-bottom: -1.25em;
    }

    mat-dialog-content {
      max-height: 70vh;
      overflow-y: auto;
    }

    mat-dialog-actions {
      padding: 16px 24px;
    }
  `]
})
export default class FieldEditorDialogComponent {
  data = inject<{ field: FormFieldDefinitionData | null; existingKeys: string[] }>(MAT_DIALOG_DATA);
  private dialogRef = inject(MatDialogRef<FieldEditorDialogComponent>);
  private fb = inject(FormBuilder);

  fieldForm!: FormGroup;
  selectedValidators = signal<string[]>([]);
  validatorParams = signal<Record<string, string>>({});

  availableValidators: ValidatorOption[] = [
    { value: 'required', label: 'Required' },
    { value: 'email', label: 'Email' },
    { value: 'minLength', label: 'Minimum Length', hasParam: true },
    { value: 'maxLength', label: 'Maximum Length', hasParam: true },
    { value: 'pattern', label: 'Pattern (RegEx)', hasParam: true }
  ];

  fieldType = signal<string>('email');

  constructor() {
    this.initForm();
  }

  initForm() {
    const field = this.data.field;
    
    this.fieldForm = this.fb.group({
      type: [field?.type || 'email', Validators.required],
      key: [field?.key || '', [Validators.required, this.keyValidator.bind(this)]],
      label: [field?.label || '', Validators.required],
      icon: [field?.icon || ''],
      placeholder: [field?.placeholder || ''],
      buttonLabel: [field?.buttonLabel || ''],
      buttonColor: [field?.buttonColor || 'primary']
    });

    // Update fieldType signal when type changes
    this.fieldForm.get('type')?.valueChanges.subscribe((type) => {
      this.fieldType.set(type);
      this.updateFieldValidators(type);
    });

    // Set initial value and validators
    const initialType = this.fieldForm.get('type')?.value || 'email';
    this.fieldType.set(initialType);
    this.updateFieldValidators(initialType);

    // Parse existing validators
    if (field?.validators) {
      this.parseValidators(field.validators);
    }
  }

  keyValidator(control: any) {
    const key = control.value;
    if (key && this.data.existingKeys.includes(key)) {
      return { duplicate: true };
    }
    return null;
  }

  updateFieldValidators(type: string) {
    const keyControl = this.fieldForm.get('key');
    const labelControl = this.fieldForm.get('label');
    const buttonLabelControl = this.fieldForm.get('buttonLabel');

    if (type === 'button') {
      keyControl?.clearValidators();
      labelControl?.clearValidators();
      buttonLabelControl?.setValidators(Validators.required);
    } else {
      keyControl?.setValidators([Validators.required, this.keyValidator.bind(this)]);
      labelControl?.setValidators(Validators.required);
      buttonLabelControl?.clearValidators();
    }

    keyControl?.updateValueAndValidity();
    labelControl?.updateValueAndValidity();
    buttonLabelControl?.updateValueAndValidity();
  }

  parseValidators(validatorsStr: string) {
    const validators: string[] = [];
    const params: Record<string, string> = {};

    validatorsStr.split(',').forEach(v => {
      const trimmed = v.trim();
      if (trimmed.includes(':')) {
        const [name, value] = trimmed.split(':');
        validators.push(name);
        params[name] = value;
      } else {
        validators.push(trimmed);
      }
    });

    this.selectedValidators.set(validators);
    this.validatorParams.set(params);
  }

  toggleValidator(validator: string, checked: boolean) {
    if (checked) {
      this.selectedValidators.update(current => [...current, validator]);
    } else {
      this.selectedValidators.update(current => current.filter(v => v !== validator));
      this.validatorParams.update(current => {
        const updated = { ...current };
        delete updated[validator];
        return updated;
      });
    }
  }

  getValidatorParam(validator: string): string {
    return this.validatorParams()[validator] || '';
  }

  updateValidatorParam(validator: string, value: string) {
    this.validatorParams.update(current => ({
      ...current,
      [validator]: value
    }));
  }

  buildValidatorsString(): string {
    const validators = this.selectedValidators();
    const params = this.validatorParams();
    
    return validators
      .map(v => params[v] ? `${v}:${params[v]}` : v)
      .join(',');
  }

  save() {
    if (this.fieldForm.invalid) {
      return;
    }

    const type = this.fieldForm.value.type;
    const result: FormFieldDefinitionData = {
      type,
      key: type === 'button' ? 'submit' : this.fieldForm.value.key,
      label: type === 'button' ? '' : this.fieldForm.value.label,
      icon: type === 'button' ? '' : (this.fieldForm.value.icon || undefined),
      placeholder: type === 'button' ? '' : (this.fieldForm.value.placeholder || undefined),
      validators: type === 'button' ? '' : (this.buildValidatorsString() || undefined),
      buttonLabel: type === 'button' ? this.fieldForm.value.buttonLabel : undefined,
      buttonColor: type === 'button' ? this.fieldForm.value.buttonColor : undefined,
      order: this.data.field?.order || 0
    };

    this.dialogRef.close(result);
  }

  cancel() {
    this.dialogRef.close(null);
  }
}
