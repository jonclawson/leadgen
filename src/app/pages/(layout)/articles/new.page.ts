import { Component, inject, signal, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ArticleFormComponent } from '../../../components/articles/article-form.component';
import { ArticleService, CreateArticleRequest } from '../../../services/article.service';
import { authClient } from '../../../../lib/auth-client';

@Component({
  selector: 'app-new-article-page',
  standalone: true,
  imports: [ArticleFormComponent],
  template: `
    <app-article-form
      (save)="onSave($event)"
      (cancel)="onCancel()"
    ></app-article-form>
  `,
})
export default class NewArticlePage implements OnInit {
  private router = inject(Router);
  private articleService = inject(ArticleService);
  
  @ViewChild(ArticleFormComponent) formComponent?: ArticleFormComponent;

  async ngOnInit() {
    // Check authentication
    const session = await authClient.getSession();
    if (!session.data?.user) {
      this.router.navigate(['/signin']);
    }
  }

  onSave(data: CreateArticleRequest) {
    this.articleService.createArticle(data).subscribe({
      next: (response) => {
        // Navigate to the article view page
        this.router.navigate(['/', response.article.slug]);
      },
      error: (error) => {
        console.error('Error creating article:', error);
        alert(error.error?.message || 'Error creating article');
        this.formComponent?.resetSubmitting();
      }
    });
  }

  onCancel() {
    this.router.navigate(['/articles/list']);
  }
}
