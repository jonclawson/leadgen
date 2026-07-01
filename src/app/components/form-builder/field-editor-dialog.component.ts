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
            <mat-option value="text">Text</mat-option>
            <mat-option value="password">Password</mat-option>
            <mat-option value="textarea">Textarea</mat-option>
            <mat-option value="select">Select (Dropdown)</mat-option>
            <mat-option value="checkbox">Checkbox</mat-option>
            <mat-option value="radio">Radio Buttons</mat-option>
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

          @if (fieldType() === 'textarea') {
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Rows</mat-label>
              <input matInput type="number" formControlName="rows" 
                placeholder="3" min="1" max="20">
              <mat-hint>Number of visible text lines (default: 3)</mat-hint>
            </mat-form-field>
          }

          @if (fieldType() === 'select' || fieldType() === 'radio') {
            <div class="options-section">
              <h4>Options</h4>
              <div class="options-list">
                @for (option of fieldOptions(); track $index) {
                  <div class="option-row">
                    <mat-form-field appearance="outline" class="option-value">
                      <mat-label>Value</mat-label>
                      <input matInput 
                        [value]="option.value"
                        (input)="updateOption($index, 'value', $any($event.target).value)">
                    </mat-form-field>
                    <mat-form-field appearance="outline" class="option-label">
                      <mat-label>Label</mat-label>
                      <input matInput 
                        [value]="option.label"
                        (input)="updateOption($index, 'label', $any($event.target).value)">
                    </mat-form-field>
                    <button mat-icon-button color="warn" type="button" 
                      (click)="removeOption($index)">
                      <mat-icon>delete</mat-icon>
                    </button>
                  </div>
                }
              </div>
              <button mat-stroked-button type="button" (click)="addOption()">
                <mat-icon>add</mat-icon> Add Option
              </button>
            </div>
          }

          @if (fieldType() === 'checkbox') {
            <div class="checkbox-config">
              <mat-checkbox formControlName="checkedByDefault">
                Checked by default
              </mat-checkbox>
            </div>
          }

          @if (fieldType() !== 'checkbox' && fieldType() !== 'radio' && fieldType() !== 'select') {
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
          }

          @if (fieldType() === 'checkbox' || fieldType() === 'select' || fieldType() === 'radio') {
            <div class="validators-section">
              <h4>Validators</h4>
              <mat-checkbox 
                [checked]="selectedValidators().includes('required')"
                (change)="toggleValidator('required', $event.checked)">
                Required
              </mat-checkbox>
            </div>
          }
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
      <button mat-flat-button color="primary" (click)="save()" 
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

    .options-section {
      margin-top: 16px;
    }

    .options-section h4 {
      margin: 0 0 12px 0;
      font-size: 16px;
      font-weight: 500;
    }

    .options-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-bottom: 12px;
    }

    .option-row {
      display: flex;
      align-items: flex-start;
      gap: 8px;
    }

    .option-value {
      flex: 1;
      min-width: 120px;
    }

    .option-label {
      flex: 2;
      min-width: 200px;
    }

    .option-row mat-form-field {
      margin-bottom: -1.25em;
    }

    .checkbox-config {
      margin-top: 16px;
      padding: 12px;
      background: rgba(0, 0, 0, 0.03);
      border-radius: 4px;
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
  fieldOptions = signal<Array<{ value: string; label: string }>>([]);

  availableValidators: ValidatorOption[] = [
    { value: 'required', label: 'Required' },
    { value: 'email', label: 'Email' },
    { value: 'minLength', label: 'Minimum Length', hasParam: true },
    { value: 'maxLength', label: 'Maximum Length', hasParam: true },
    { value: 'pattern', label: 'Pattern (RegEx)', hasParam: true }
  ];

  fieldType = signal<string>('text');

  constructor() {
    this.initForm();
  }

  initForm() {
    const field = this.data.field;
    
    const initialType = field?.type === 'email' ? 'text' : (field?.type || 'text');

    this.fieldForm = this.fb.group({
      type: [initialType, Validators.required],
      key: [field?.key || '', [Validators.required, this.keyValidator.bind(this)]],
      label: [field?.label || '', Validators.required],
      icon: [field?.icon || ''],
      placeholder: [field?.placeholder || ''],
      rows: [3],
      checkedByDefault: [false],
      buttonLabel: [field?.buttonLabel || ''],
      buttonColor: [field?.buttonColor || 'primary']
    });

    // Update fieldType signal when type changes
    this.fieldForm.get('type')?.valueChanges.subscribe((type) => {
      this.fieldType.set(type);
      this.updateFieldValidators(type);
    });

    // Set initial value and validators
    const currentType = this.fieldForm.get('type')?.value || 'text';
    this.fieldType.set(currentType);
    this.updateFieldValidators(currentType);

    // Parse existing validators
    if (field?.validators) {
      this.parseValidators(field.validators);
    }

    // Parse existing options
    if (field?.options) {
      this.parseOptions(field.options, initialType);
    }
  }

  keyValidator(control: any) {
    const key = control.value;
    const originalKey = this.data.field?.key;
    
    // If editing and the key hasn't changed, it's valid
    if (originalKey && key === originalKey) {
      return null;
    }
    
    // Check if the key is already used by another field
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

  parseOptions(optionsStr: string, type: string) {
    try {
      const parsed = JSON.parse(optionsStr);
      
      if (type === 'select' || type === 'radio') {
        // Options is an array of {value, label} objects
        if (Array.isArray(parsed)) {
          this.fieldOptions.set(parsed);
        }
      } else if (type === 'textarea') {
        // Options is a config object like {rows: 5}
        if (parsed.rows) {
          this.fieldForm.patchValue({ rows: parsed.rows });
        }
      } else if (type === 'checkbox') {
        // Options is a config object like {checked: true}
        if (parsed.checked !== undefined) {
          this.fieldForm.patchValue({ checkedByDefault: parsed.checked });
        }
      }
    } catch (e) {
      // Invalid JSON, ignore
    }
  }

  addOption() {
    this.fieldOptions.update(options => [
      ...options,
      { value: '', label: '' }
    ]);
  }

  removeOption(index: number) {
    this.fieldOptions.update(options => options.filter((_, i) => i !== index));
  }

  updateOption(index: number, field: 'value' | 'label', value: string) {
    this.fieldOptions.update(options => {
      const updated = [...options];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  }

  save() {
    if (this.fieldForm.invalid) {
      return;
    }

    const type = this.fieldForm.value.type;
    
    // Build options JSON string based on field type
    let optionsJson: string | undefined = undefined;
    
    if (type === 'select' || type === 'radio') {
      // Store array of options
      const options = this.fieldOptions();
      if (options.length > 0) {
        optionsJson = JSON.stringify(options);
      }
    } else if (type === 'textarea') {
      // Store config object with rows
      const rows = this.fieldForm.value.rows;
      if (rows && rows !== 3) {
        optionsJson = JSON.stringify({ rows });
      }
    } else if (type === 'checkbox') {
      // Store config object with checked default
      const checked = this.fieldForm.value.checkedByDefault;
      if (checked) {
        optionsJson = JSON.stringify({ checked });
      }
    }

    const result: FormFieldDefinitionData = {
      type,
      key: type === 'button' ? 'submit' : this.fieldForm.value.key,
      label: type === 'button' ? '' : this.fieldForm.value.label,
      icon: type === 'button' ? '' : (this.fieldForm.value.icon || undefined),
      placeholder: type === 'button' ? '' : (this.fieldForm.value.placeholder || undefined),
      validators: type === 'button' ? '' : (this.buildValidatorsString() || undefined),
      options: optionsJson,
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
