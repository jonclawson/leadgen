import { Component, inject, signal, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ArticleFormComponent } from '../../../../components/articles/article-form.component';
import { ArticleService, Article, UpdateArticleRequest } from '../../../../services/article.service';
import { authClient } from '../../../../../lib/auth-client';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-edit-article-page',
  standalone: true,
  imports: [CommonModule, ArticleFormComponent],
  template: `
    @if (loading()) {
      <div style="padding: 24px; text-align: center;">Loading...</div>
    } @else if (article()) {
      <app-article-form
        [article]="article()!"
        (save)="onSave($event)"
        (cancel)="onCancel()"
      ></app-article-form>
    } @else {
      <div style="padding: 24px; text-align: center;">Page not found</div>
    }
  `,
})
export default class EditArticlePage implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private articleService = inject(ArticleService);
  
  article = signal<Article | null>(null);
  loading = signal(true);
  
  @ViewChild(ArticleFormComponent) formComponent?: ArticleFormComponent;

  async ngOnInit() {
    // Check authentication
    const session = await authClient.getSession();
    if (!session.data?.user) {
      this.router.navigate(['/signin']);
      return;
    }

    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/articles/list']);
      return;
    }

    this.loadArticle(id, session.data.user.id);
  }

  loadArticle(id: string, userId: string) {
    this.loading.set(true);
    this.articleService.getArticle(id).subscribe({
      next: (response) => {
        // Check if user is the owner
        if (response.article.userId !== userId) {
          alert('You do not have permission to edit this article');
          this.router.navigate(['/articles/list']);
          return;
        }
        this.article.set(response.article);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading article:', error);
        alert('Article not found');
        this.router.navigate(['/articles/list']);
      }
    });
  }

  onSave(data: UpdateArticleRequest) {
    const id = this.article()?.id;
    if (!id) return;

    this.articleService.updateArticle(id, data).subscribe({
      next: (response) => {
        // Navigate to the article view page
        this.router.navigate(['/', response.article.slug]);
      },
      error: (error) => {
        console.error('Error updating article:', error);
        alert(error.error?.message || 'Error updating article');
        this.formComponent?.resetSubmitting();
      }
    });
  }

  onCancel() {
    const slug = this.article()?.slug;
    if (slug) {
      this.router.navigate(['/', slug]);
    } else {
      this.router.navigate(['/articles/list']);
    }
  }
}
