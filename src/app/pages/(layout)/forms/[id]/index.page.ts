import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { DynamicFormService } from '../../../../services/dynamic-form.service';
import FormComponent, { convertFormFieldDefinition } from '../../../../components/forms/form.component';

@Component({
  selector: 'app-form-view-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    FormComponent
  ],
  template: `
    <div class="form-view-container">
      @if (loading()) {
        <div class="loading-container">
          <mat-spinner></mat-spinner>
          <p>Loading form...</p>
        </div>
      } @else if (error()) {
        <mat-card class="error-card">
          <mat-card-content>
            <mat-icon class="error-icon">error</mat-icon>
            <h2>Error Loading Form</h2>
            <p>{{ error() }}</p>
            <button mat-raised-button color="primary" routerLink="/forms">
              Back to Forms
            </button>
          </mat-card-content>
        </mat-card>
      } @else if (formData()) {
        <mat-card class="form-card">
          <mat-card-header>
            <div class="form-header">
              <div class="form-title-section">
                <mat-card-title>{{ formData()!.name }}</mat-card-title>
                @if (formData()!.description) {
                  <mat-card-subtitle>{{ formData()!.description }}</mat-card-subtitle>
                }
              </div>
              <div class="form-actions">
                <button mat-icon-button [routerLink]="['/forms', id(), 'edit']" matTooltip="Edit Form">
                  <mat-icon>edit</mat-icon>
                </button>
                <button mat-icon-button routerLink="/forms" matTooltip="Back to List">
                  <mat-icon>arrow_back</mat-icon>
                </button>
              </div>
            </div>
          </mat-card-header>
          <mat-card-content>
            @if (formFields().length > 0) {
              <app-form [model]="formFields()" (submit)="onFormSubmit($event)"></app-form>
            } @else {
              <div class="empty-form">
                <mat-icon>input</mat-icon>
                <p>This form has no fields yet. Edit the form to add fields.</p>
              </div>
            }
          </mat-card-content>
        </mat-card>

        @if (submittedData()) {
          <mat-card class="submitted-data-card">
            <mat-card-header>
              <mat-card-title>
                <mat-icon>check_circle</mat-icon>
                Form Submitted Successfully
              </mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <pre>{{ submittedData() | json }}</pre>
            </mat-card-content>
          </mat-card>
        }
      }
    </div>
  `,
  styles: [`
    .form-view-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 24px;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      padding: 48px;
      color: #666;
    }

    .error-card {
      text-align: center;
      padding: 48px;
    }

    .error-icon {
      font-size: 72px;
      width: 72px;
      height: 72px;
      color: #f44336;
      margin: 0 auto 16px;
    }

    .error-card h2 {
      color: #f44336;
      margin: 0 0 16px 0;
    }

    .error-card p {
      color: #666;
      margin-bottom: 24px;
    }

    .form-card {
      margin-bottom: 24px;
    }

    .form-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      width: 100%;
    }

    .form-title-section {
      flex: 1;
    }

    .form-actions {
      display: flex;
      gap: 8px;
    }

    .empty-form {
      text-align: center;
      padding: 48px;
      color: #999;
    }

    .empty-form mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin: 0 auto 16px;
    }

    .submitted-data-card {
      background: #e8f5e9;
    }

    .submitted-data-card mat-card-title {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #2e7d32;
    }

    .submitted-data-card mat-card-title mat-icon {
      color: #2e7d32;
    }

    .submitted-data-card pre {
      background: white;
      padding: 16px;
      border-radius: 4px;
      overflow-x: auto;
      margin: 0;
    }
  `]
})
export default class FormViewPage implements OnInit {
  private route = inject(ActivatedRoute);
  private formService = inject(DynamicFormService);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);

  id = signal<string>('');

  loading = signal(true);
  error = signal<string | null>(null);
  formData = signal<any>(null);
  submittedData = signal<any>(null);

  formFields = computed(() => {
    const data = this.formData();
    if (!data?.form?.fields) return [];
    return data.form.fields.map(convertFormFieldDefinition);
  });

  ngOnInit() {
    this.id.set(this.route.snapshot.paramMap.get('id') || '');
    this.loadForm();
  }

  loadForm() {
    const formId = this.id();
    this.loading.set(true);
    this.error.set(null);

    this.formService.getForm(formId).subscribe({
      next: (form) => {
        this.formData.set(form);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading form:', err);
        this.error.set(
          err.status === 404 
            ? 'Form not found' 
            : err.status === 403
            ? 'You do not have permission to view this form'
            : 'An error occurred while loading the form'
        );
        this.loading.set(false);
      }
    });
  }

  onFormSubmit(values: any) {
    console.log('Form submitted:', values);
    this.submittedData.set(values);
    this.snackBar.open('Form submitted successfully!', 'Close', { 
      duration: 5000,
      panelClass: 'success-snackbar'
    });
  }
}
