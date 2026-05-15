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
import { marked } from 'marked';
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
        <mat-card class="article-card">
          <mat-card-header class="article-header">
            <div class="article-header-content">
              <mat-card-title class="article-title">{{ article.title }}</mat-card-title>
              <mat-card-subtitle class="article-meta">
                <!-- <span>By {{ article.author.name || article.author.email }}</span> -->
                <span class="separator">•</span>
                <span>{{ formatDate(article.createdAt) }}</span>
              </mat-card-subtitle>
            </div>
          </mat-card-header>

          <mat-card-content class="article-content">
            <div class="article-body markdown-content" [innerHTML]="renderedBody()"></div>
            
            @if (formFields().length > 0) {
              <div class="article-form-section">
                <h3 class="form-section-title">{{ article.form?.name }}</h3>
                <app-form 
                  [model]="getFormFieldsWithLoadingState()" 
                  (submit)="onFormSubmit($event)">
                </app-form>
              </div>
            }
          </mat-card-content>

          <mat-card-actions class="article-actions">
            <button mat-button routerLink="/articles/list">
              <mat-icon>arrow_back</mat-icon>
              Back to Dashboard
            </button>
            @if (canEdit()) {
              <button mat-raised-button color="primary" [routerLink]="['/articles', article.id, 'edit']">
                <mat-icon>edit</mat-icon>
                Edit Page
              </button>
            }
          </mat-card-actions>
        </mat-card>
      }
    </div>
  `,
  styles: [`
    .article-view-container {
      padding: 24px;
      max-width: 900px;
      margin: 0 auto;
    }

    .article-card {
      margin-bottom: 24px;
    }

    .article-header {
      padding: 24px 24px 16px;
      border-bottom: 1px solid #e0e0e0;
    }

    .article-header-content {
      width: 100%;
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

    .separator {
      color: #ccc;
    }

    .article-content {
      padding: 32px 24px;
    }

    .article-body {
      line-height: 1.8;
      font-size: 16px;
      color: #333;
    }

    .markdown-content :deep(h1) {
      font-size: 2em;
      margin: 0.67em 0;
      font-weight: bold;
      line-height: 1.2;
    }

    .markdown-content :deep(h2) {
      font-size: 1.5em;
      margin: 0.75em 0;
      font-weight: bold;
      line-height: 1.3;
    }

    .markdown-content :deep(h3) {
      font-size: 1.17em;
      margin: 0.83em 0;
      font-weight: bold;
      line-height: 1.4;
    }

    .markdown-content :deep(p) {
      margin: 1em 0;
    }

    .markdown-content :deep(code) {
      background: #f5f5f5;
      padding: 2px 6px;
      border-radius: 3px;
      font-family: 'Courier New', Courier, monospace;
      font-size: 0.9em;
    }

    .markdown-content :deep(pre) {
      background: #f5f5f5;
      padding: 16px;
      border-radius: 4px;
      overflow-x: auto;
      margin: 1.5em 0;
    }

    .markdown-content :deep(pre code) {
      background: none;
      padding: 0;
    }

    .markdown-content :deep(blockquote) {
      border-left: 4px solid #ddd;
      padding-left: 16px;
      margin: 1.5em 0;
      color: #666;
      font-style: italic;
    }

    .markdown-content :deep(ul), 
    .markdown-content :deep(ol) {
      padding-left: 2em;
      margin: 1em 0;
    }

    .markdown-content :deep(li) {
      margin: 0.5em 0;
    }

    .markdown-content :deep(a) {
      color: #1976d2;
      text-decoration: none;
    }

    .markdown-content :deep(a:hover) {
      text-decoration: underline;
    }

    .markdown-content :deep(img) {
      max-width: 100%;
      height: auto;
      border-radius: 4px;
      margin: 1.5em 0;
    }

    .markdown-content :deep(hr) {
      border: none;
      border-top: 1px solid #e0e0e0;
      margin: 2em 0;
    }

    .markdown-content :deep(table) {
      border-collapse: collapse;
      width: 100%;
      margin: 1.5em 0;
    }

    .markdown-content :deep(th),
    .markdown-content :deep(td) {
      border: 1px solid #ddd;
      padding: 8px 12px;
      text-align: left;
    }

    .markdown-content :deep(th) {
      background: #f5f5f5;
      font-weight: bold;
    }

    .article-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 24px;
      border-top: 1px solid #e0e0e0;
    }

    .article-form-section {
      margin-top: 48px;
      padding-top: 32px;
      border-top: 2px solid #e0e0e0;
    }

    .form-section-title {
      font-size: 24px;
      font-weight: 500;
      margin-bottom: 24px;
      color: #333;
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
    if (!this.article?.body) return 'no content';
    try {
      return marked.parse(this.article.body) as string;
    } catch (e) {
      console.error('Error rendering markdown:', e);
      return '<p>Error rendering article content</p>';
    }
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
