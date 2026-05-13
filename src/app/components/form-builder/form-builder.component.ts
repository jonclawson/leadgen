import { Component, OnInit, input, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { DynamicFormService, FormFieldDefinitionData, DynamicFormData } from '../../services/dynamic-form.service';
import FormComponent, { convertFormFieldDefinition } from '../forms/form.component';
import FieldEditorDialogComponent from './field-editor-dialog.component';

@Component({
  selector: 'app-form-builder',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatStepperModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatCardModule,
    MatSnackBarModule,
    MatDialogModule,
    DragDropModule,
    FormComponent
  ],
  template: `
    <div class="form-builder">
      <mat-stepper #stepper [linear]="true">
        <!-- Step 1: Form Details -->
        <mat-step [stepControl]="detailsForm">
          <ng-template matStepLabel>Form Details</ng-template>
          <form [formGroup]="detailsForm" class="step-content">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Form Name</mat-label>
              <input matInput formControlName="name" required placeholder="e.g., Contact Form">
              @if (detailsForm.get('name')?.hasError('required')) {
                <mat-error>Name is required</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Description (optional)</mat-label>
              <textarea matInput formControlName="description" rows="3" 
                placeholder="Describe the purpose of this form"></textarea>
            </mat-form-field>

            <div class="step-actions">
              <button mat-raised-button color="primary" matStepperNext>
                Next
                <mat-icon>arrow_forward</mat-icon>
              </button>
            </div>
          </form>
        </mat-step>

        <!-- Step 2: Add Fields -->
        <mat-step>
          <ng-template matStepLabel>Add Fields</ng-template>
          <div class="step-content">
            <div class="fields-header">
              <h3>Form Fields ({{ fields()?.length }})</h3>
              <button mat-raised-button color="primary" (click)="addField()">
                <mat-icon>add</mat-icon>
                Add Field
              </button>
            </div>

            @if (fields()?.length === 0) {
              <mat-card class="empty-fields">
                <mat-card-content>
                  <mat-icon class="empty-icon">input</mat-icon>
                  <p>No fields added yet. Click "Add Field" to get started.</p>
                </mat-card-content>
              </mat-card>
            } @else {
              <div class="fields-list" cdkDropList (cdkDropListDropped)="onFieldDrop($event)">
                @for (field of fields(); track $index) {
                  <mat-card class="field-card" cdkDrag>
                    <mat-card-content>
                      <div class="field-card-content">
                        <mat-icon class="drag-handle" cdkDragHandle>drag_indicator</mat-icon>
                        <div class="field-info">
                          <div class="field-header">
                            <strong>{{ field.label }}</strong>
                            <span class="field-type">{{ field.type }}</span>
                          </div>
                          <div class="field-details">
                            <span>Key: {{ field.key }}</span>
                            @if (field.validators) {
                              <span>Validators: {{ field.validators }}</span>
                            }
                          </div>
                        </div>
                        <div class="field-actions">
                          <button mat-icon-button (click)="editField($index)" matTooltip="Edit">
                            <mat-icon>edit</mat-icon>
                          </button>
                          <button mat-icon-button (click)="deleteField($index)" matTooltip="Delete" color="warn">
                            <mat-icon>delete</mat-icon>
                          </button>
                        </div>
                      </div>
                    </mat-card-content>
                  </mat-card>
                }
              </div>
            }

            <div class="step-actions">
              <button mat-button matStepperPrevious>
                <mat-icon>arrow_back</mat-icon>
                Back
              </button>
              <button mat-raised-button color="primary" matStepperNext [disabled]="fields().length === 0">
                Next
                <mat-icon>arrow_forward</mat-icon>
              </button>
            </div>
          </div>
        </mat-step>

        <!-- Step 3: Preview -->
        <mat-step>
          <ng-template matStepLabel>Preview</ng-template>
          <div class="step-content">
            <h3>Form Preview</h3>
            <mat-card class="preview-card">
              <mat-card-header>
                <mat-card-title>{{ detailsForm.get('name')?.value }}</mat-card-title>
                @if (detailsForm.get('description')?.value) {
                  <mat-card-subtitle>{{ detailsForm.get('description')?.value }}</mat-card-subtitle>
                }
              </mat-card-header>
              <mat-card-content>
                @if (previewFields().length > 0) {
                  <app-form [model]="previewFields()" (submit)="onPreviewSubmit($event)"></app-form>
                } @else {
                  <p class="no-preview">Add fields to see the preview</p>
                }
              </mat-card-content>
            </mat-card>

            <div class="step-actions">
              <button mat-button matStepperPrevious>
                <mat-icon>arrow_back</mat-icon>
                Back
              </button>
              <button mat-raised-button color="primary" (click)="saveForm()" [disabled]="saving()">
                @if (saving()) {
                  <span>Saving...</span>
                } @else {
                  <span>{{ formId() ? 'Update Form' : 'Create Form' }}</span>
                }
              </button>
            </div>
          </div>
        </mat-step>
      </mat-stepper>
    </div>
  `,
  styles: [`
    .form-builder {
      max-width: 900px;
      margin: 0 auto;
      padding: 24px;
    }

    .step-content {
      padding: 24px 0;
    }

    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }

    .step-actions {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
      margin-top: 24px;
    }

    .fields-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .fields-header h3 {
      margin: 0;
    }

    .empty-fields {
      text-align: center;
      padding: 48px;
      background: #f5f5f5;
    }

    .empty-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: #ccc;
      margin: 0 auto 16px;
    }

    .fields-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-bottom: 24px;
    }

    .field-card {
      cursor: move;
    }

    .field-card-content {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .drag-handle {
      color: #666;
      cursor: grab;
    }

    .drag-handle:active {
      cursor: grabbing;
    }

    .field-info {
      flex: 1;
    }

    .field-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 4px;
    }

    .field-type {
      background: #e3f2fd;
      color: #1976d2;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 12px;
    }

    .field-details {
      font-size: 14px;
      color: #666;
      display: flex;
      gap: 16px;
    }

    .field-actions {
      display: flex;
      gap: 4px;
    }

    .preview-card {
      margin-bottom: 24px;
    }

    .no-preview {
      text-align: center;
      color: #999;
      padding: 24px;
    }

    .cdk-drag-preview {
      box-shadow: 0 5px 10px rgba(0,0,0,0.3);
    }

    .cdk-drag-animating {
      transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
    }
  `]
})
export default class FormBuilderComponent implements OnInit {
  formId = input<string>();
  
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);
  private formService = inject(DynamicFormService);

  detailsForm!: FormGroup;
  fields = signal<FormFieldDefinitionData[]>([]);
  saving = signal(false);

  previewFields = computed(() => {
    const fieldsList = this.fields();
    if (!fieldsList || !Array.isArray(fieldsList)) return [];
    return fieldsList.map(convertFormFieldDefinition);
  });

  ngOnInit() {
    this.detailsForm = this.fb.group({
      name: ['', Validators.required],
      description: ['']
    });

    const id = this.formId();
    if (id) {
      this.loadForm(id);
    }
  }

  loadForm(id: string) {
    this.formService.getForm(id).subscribe({
      next: (data) => {
        this.detailsForm.patchValue({
          name: data?.form?.name,
          description: data?.form?.description
        });
        this.fields.set(data?.form?.fields || []);
      },
      error: (error) => {
        console.error('Error loading form:', error);
        this.snackBar.open('Error loading form', 'Close', { duration: 3000 });
        this.router.navigate(['/forms']);
      }
    });
  }

  addField() {
    const dialogRef = this.dialog.open(FieldEditorDialogComponent, {
      width: '600px',
      data: { field: null, existingKeys: this.fields().map(f => f.key) }
    });

    dialogRef.afterClosed().subscribe((result: FormFieldDefinitionData | null) => {
      if (result) {
        this.fields.update(current => [...current, result]);
      }
    });
  }

  editField(index: number) {
    const field = this.fields()[index];
    const existingKeys = this.fields()
      .map(f => f.key)
      .filter((_, i) => i !== index);

    const dialogRef = this.dialog.open(FieldEditorDialogComponent, {
      width: '600px',
      data: { field, existingKeys }
    });

    dialogRef.afterClosed().subscribe((result: FormFieldDefinitionData | null) => {
      if (result) {
        this.fields.update(current => {
          const updated = [...current];
          updated[index] = result;
          return updated;
        });
      }
    });
  }

  deleteField(index: number) {
    const field = this.fields()[index];
    if (confirm(`Delete field "${field.label}"?`)) {
      this.fields.update(current => current.filter((_, i) => i !== index));
    }
  }

  onFieldDrop(event: CdkDragDrop<FormFieldDefinitionData[]>) {
    this.fields.update(current => {
      const updated = [...current];
      moveItemInArray(updated, event.previousIndex, event.currentIndex);
      return updated;
    });
  }

  onPreviewSubmit(values: any) {
    console.log('Preview form submitted:', values);
    this.snackBar.open('This is just a preview - no data was submitted', 'Close', { duration: 3000 });
  }

  saveForm() {
    if (this.detailsForm.invalid || this.fields().length === 0) {
      this.snackBar.open('Please fill in all required fields', 'Close', { duration: 3000 });
      return;
    }

    this.saving.set(true);
    const formData = {
      name: this.detailsForm.value.name,
      description: this.detailsForm.value.description || undefined,
      fields: this.fields().map((field, index) => ({
        ...field,
        order: index
      }))
    };

    const id = this.formId();
    const request = id
      ? this.formService.updateForm(id, formData)
      : this.formService.createForm(formData);

    request.subscribe({
      next: () => {
        this.snackBar.open(
          id ? 'Form updated successfully' : 'Form created successfully',
          'Close',
          { duration: 3000 }
        );
        this.router.navigate(['/forms']);
      },
      error: (error) => {
        console.error('Error saving form:', error);
        this.snackBar.open('Error saving form', 'Close', { duration: 3000 });
        this.saving.set(false);
      }
    });
  }
}
