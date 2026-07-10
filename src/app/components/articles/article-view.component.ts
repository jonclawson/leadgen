import { Component, Input, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Article } from '../../services/article.service';
import { FormSubmissionService } from '../../services/form-submission.service';
import { authClient } from '../../../lib/auth-client';
import FormComponent, { FormField, convertFormFieldDefinition } from '../forms/form.component';

@Component({
  selector: 'app-article-view',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    FormComponent
  ],
  template: `
    <div class="article-view-container">
      @if (article) {
       <div class="article-card">
        <div class="article-header">
          <div class="article-header-content">
            <div class="article-header-wrapper">
              @if (article.image_url) {
                <div class="article-image-container">
                  <img [src]="article.image_url" [alt]="article.title" class="article-image">
                </div>
              }
              <div class="article-header-text">
                <div class="article-title">{{ article.title }}</div>
                <div class="article-meta">
                  <span>{{ formatDate(article.createdAt) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="article-content">
          <div class="article-body prose-content" [innerHTML]="renderedBody()"></div>
          
          @if (formFields().length > 0) {
            <div class="article-form-section">
              <h3 class="form-section-title">{{ article.form?.name }}</h3>
              <app-form 
                [model]="getFormFieldsWithLoadingState()" 
                (submit)="onFormSubmit($event)">
              </app-form>
            </div>
          }
        </div>

        <div class="article-actions">
          <button mat-button routerLink="/articles/list">
            <mat-icon>arrow_back</mat-icon>
            Back to Dashboard
          </button>
          @if (canEdit()) {
            <button mat-flat-button color="primary" [routerLink]="['/articles', article.id, 'edit']">
              <mat-icon>edit</mat-icon>
              Edit Page
            </button>
          }
        </div>
      </div>
      }
    </div>
  `,
  styles: [`
    @reference "../../../styles.css";
    .article-view-container {
      @apply section-outer;
      height: 100vh;
    }

    .article-card {

    }

    .article-header {
      @apply section;
      border-bottom: 1px solid #e0e0e0;
    }

    .article-header-content {
      @apply section-inner;
    }

    .article-header-wrapper {
      display: grid;
      grid-template-columns: auto 1fr;
      gap: 24px;
      align-items: center;
    }

    .article-image-container {
      flex-shrink: 0;
    }

    .article-image {
      width: 200px;
      height: 200px;
      object-fit: cover;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .article-header-text {
      min-width: 0;
    }

    .article-title {
      font-size: 36px;
      font-weight: 600;
      margin-bottom: 8px;
      line-height: 1.2;
    }

    .article-meta {
      font-size: 14px;
      color: #666;
      display: flex;
      align-items: center;
      gap: 8px;
    }


    .article-content {
      @apply section;
      background-color: white;

    }

    .article-body {
      @apply section-inner;
      line-height: 1.8;
      font-size: 16px;
      color: #333;
    }

    .article-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 24px;
      @apply section-outer;
    }

    .article-form-section {

    }

    .form-section-title {
      font-size: 24px;
      font-weight: 500;
      margin-bottom: 24px;
      color: #333;
    }

    @media (max-width: 768px) {
      .article-header-wrapper {
        grid-template-columns: 1fr;
      }

      .article-image {
        width: 100%;
        height: auto;
        max-width: 300px;
      }

      .article-title {
        font-size: 28px;
      }
    }
  `]
})
export class ArticleViewComponent implements OnInit {
  @Input() article!: Article;
  
  private router = inject(Router);
  private formSubmissionService = inject(FormSubmissionService);
  private snackBar = inject(MatSnackBar);
  
  currentUserId = signal<string | null>(null);
  formFields = signal<FormField[]>([]);
  isSubmittingForm = signal(false);

  async ngOnInit() {
    const session = await authClient.getSession();
    this.currentUserId.set(session.data?.user?.id ?? null);

    // Convert form fields if article has a form
    if (this.article.form && this.article.form.fields) {
      const convertedFields = this.article.form.fields.map(field => 
        convertFormFieldDefinition({
          ...field,
          label: field.label ?? undefined,
          icon: field.icon ?? undefined,
          placeholder: field.placeholder ?? undefined,
          validators: field.validators ?? undefined,
          options: field.options ?? undefined,
          buttonLabel: field.buttonLabel ?? undefined,
          buttonColor: field.buttonColor ?? undefined
        })
      );
      this.formFields.set(convertedFields);
    }
  }

  renderedBody = () => {
    console.log('Rendering article body:', this.article.body);
    if (!this.article?.body) return '<p>No content</p>';
    return this.article.body;
  };

  canEdit(): boolean {
    return this.currentUserId() === this.article?.userId;
  }

  getFormFieldsWithLoadingState(): FormField[] {
    const fields = this.formFields();
    if (!this.isSubmittingForm()) {
      return fields;
    }

    // When submitting, disable the button field
    return fields.map(field => {
      if (field.type === 'button') {
        return { ...field, disabled: true };
      }
      return field;
    });
  }

  onFormSubmit(data: Record<string, unknown>) {
    if (!this.article?.formId) {
      this.snackBar.open('Form ID not found', 'Close', { duration: 3000 });
      return;
    }

    this.isSubmittingForm.set(true);

    this.formSubmissionService
      .submitForm(this.article.formId, this.article.id, data)
      .subscribe({
        next: (response) => {
          this.isSubmittingForm.set(false);
          this.snackBar.open('Form submitted successfully!', 'Close', { duration: 3000 });
          console.log('Form submission successful:', response);
        },
        error: (error) => {
          this.isSubmittingForm.set(false);
          const errorMessage = error?.error?.message || 'Failed to submit form';
          this.snackBar.open(errorMessage, 'Close', { duration: 5000 });
          console.error('Form submission error:', error);
        }
      });
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}
