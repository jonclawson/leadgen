import { Component, OnInit, Input, Output, EventEmitter, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSelectModule } from '@angular/material/select';
import { Article } from '../../services/article.service';
import { DynamicFormService, DynamicFormListItem } from '../../services/dynamic-form.service';
import { marked } from 'marked';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-article-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatSelectModule
  ],
  template: `
    <div class="article-form-container">
      <form [formGroup]="articleForm" (ngSubmit)="onSubmit()">
        <mat-card>
          <mat-card-header>
            <mat-card-title>{{ isEditMode ? 'Edit Article' : 'Create New Article' }}</mat-card-title>
          </mat-card-header>
          
          <mat-card-content>
            <div class="form-fields">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Title</mat-label>
                <input matInput formControlName="title" required>
                @if (articleForm.get('title')?.hasError('required') && articleForm.get('title')?.touched) {
                  <mat-error>Title is required</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Slug (URL-friendly)</mat-label>
                <input matInput formControlName="slug" required>
                <mat-hint>This will be used in the article URL</mat-hint>
                @if (articleForm.get('slug')?.hasError('required') && articleForm.get('slug')?.touched) {
                  <mat-error>Slug is required</mat-error>
                }
              </mat-form-field>

              <mat-tab-group class="full-width">
                <mat-tab label="Editor">
                  <div class="tab-content">
                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>Body (Markdown)</mat-label>
                      <textarea 
                        matInput 
                        formControlName="body" 
                        rows="20" 
                        required
                        placeholder="Write your article in Markdown..."></textarea>
                      @if (articleForm.get('body')?.hasError('required') && articleForm.get('body')?.touched) {
                        <mat-error>Article body is required</mat-error>
                      }
                    </mat-form-field>
                  </div>
                </mat-tab>
                
                <mat-tab label="Preview">
                  <div class="tab-content preview-content">
                    <div class="markdown-preview" [innerHTML]="markdownPreview()"></div>
                  </div>
                </mat-tab>
              </mat-tab-group>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Optional Form</mat-label>
                <mat-select formControlName="formId">
                  <mat-option [value]="null">None</mat-option>
                  @for (form of availableForms(); track form.id) {
                    <mat-option [value]="form.id">{{ form.name }}</mat-option>
                  }
                </mat-select>
                <mat-hint>Select a form to display at the bottom of your article</mat-hint>
              </mat-form-field>
            </div>
          </mat-card-content>

          <mat-card-actions>
            <button mat-raised-button color="primary" type="submit" [disabled]="!articleForm.valid || submitting()">
              <mat-icon>save</mat-icon>
              {{ isEditMode ? 'Update' : 'Create' }} Article
            </button>
            <button mat-button type="button" (click)="onCancel()">
              Cancel
            </button>
          </mat-card-actions>
        </mat-card>
      </form>
    </div>
  `,
  styles: [`
    .article-form-container {
      padding: 24px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .form-fields {
      padding: 16px 0;
    }

    .full-width {
      width: 100%;
    }

    .tab-content {
      padding: 16px 0;
      min-height: 400px;
    }

    .preview-content {
      background: #f5f5f5;
      padding: 24px;
      border-radius: 4px;
    }

    .markdown-preview {
      background: white;
      padding: 24px;
      border-radius: 4px;
      min-height: 350px;
      line-height: 1.6;
    }

    .markdown-preview :deep(h1) {
      font-size: 2em;
      margin: 0.67em 0;
      font-weight: bold;
    }

    .markdown-preview :deep(h2) {
      font-size: 1.5em;
      margin: 0.75em 0;
      font-weight: bold;
    }

    .markdown-preview :deep(h3) {
      font-size: 1.17em;
      margin: 0.83em 0;
      font-weight: bold;
    }

    .markdown-preview :deep(p) {
      margin: 1em 0;
    }

    .markdown-preview :deep(code) {
      background: #f4f4f4;
      padding: 2px 6px;
      border-radius: 3px;
      font-family: monospace;
    }

    .markdown-preview :deep(pre) {
      background: #f4f4f4;
      padding: 16px;
      border-radius: 4px;
      overflow-x: auto;
    }

    .markdown-preview :deep(pre code) {
      background: none;
      padding: 0;
    }

    .markdown-preview :deep(blockquote) {
      border-left: 4px solid #ddd;
      padding-left: 16px;
      margin-left: 0;
      color: #666;
    }

    .markdown-preview :deep(ul), 
    .markdown-preview :deep(ol) {
      padding-left: 2em;
    }

    .markdown-preview :deep(a) {
      color: #1976d2;
      text-decoration: none;
    }

    .markdown-preview :deep(a:hover) {
      text-decoration: underline;
    }

    mat-card-actions {
      display: flex;
      gap: 8px;
      padding: 16px;
    }
  `]
})
export class ArticleFormComponent implements OnInit {
  @Input() article?: Article;
  @Output() save = new EventEmitter<{ title: string; slug: string; body: string; formId?: string | null }>();
  @Output() cancel = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private formService = inject(DynamicFormService);
  
  articleForm!: FormGroup;
  submitting = signal(false);
  availableForms = signal<DynamicFormListItem[]>([]);
  
  markdownPreview = computed(() => {
    const body = this.articleForm?.get('body')?.value || '';
    try {
      return marked.parse(body) as string;
    } catch (e) {
      return '<p>Error rendering markdown preview</p>';
    }
  });

  get isEditMode(): boolean {
    return !!this.article;
  }

  ngOnInit() {
    this.articleForm = this.fb.group({
      title: [this.article?.title || '', [Validators.required]],
      slug: [this.article?.slug || '', [Validators.required]],
      body: [this.article?.body || '', [Validators.required]],
      formId: [this.article?.formId || null]
    });

    // Load available forms
    this.formService.getForms().subscribe({
      next: (response) => {
        this.availableForms.set(response.forms);
      },
      error: (error) => {
        console.error('Error loading forms:', error);
      }
    });

    // Auto-generate slug from title when creating new article
    if (!this.isEditMode) {
      this.articleForm.get('title')?.valueChanges
        .pipe(debounceTime(300))
        .subscribe(title => {
          const currentSlug = this.articleForm.get('slug')?.value;
          // Only auto-generate if slug is empty or was previously auto-generated
          if (!currentSlug || this.wasAutoGenerated(currentSlug, this.lastTitle)) {
            const slug = this.generateSlug(title);
            this.articleForm.get('slug')?.setValue(slug, { emitEvent: false });
          }
          this.lastTitle = title;
        });
    }
  }

  private lastTitle = '';

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  private wasAutoGenerated(currentSlug: string, previousTitle: string): boolean {
    const expectedSlug = this.generateSlug(previousTitle);
    return currentSlug === expectedSlug;
  }

  onSubmit() {
    if (this.articleForm.valid && !this.submitting()) {
      this.submitting.set(true);
      const formValue = this.articleForm.value;
      this.save.emit({
        title: formValue.title,
        slug: formValue.slug,
        body: formValue.body,
        formId: formValue.formId
      });
    }
  }

  onCancel() {
    this.cancel.emit();
  }

  resetSubmitting() {
    this.submitting.set(false);
  }
}
