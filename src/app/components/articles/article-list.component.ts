import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ArticleService, ArticleListItem } from '../../services/article.service';
import { authClient } from '../../../lib/auth-client';

@Component({
  selector: 'app-article-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatTooltipModule
  ],
  template: `
    <div class="article-list-container">
      <div class="header">
        <h1>Articles</h1>
        @if (currentUserId()) {
          <button mat-raised-button color="primary" routerLink="/articles/new">
            <mat-icon>add</mat-icon>
            Create New Article
          </button>
        }
      </div>

      @if (loading()) {
        <div class="loading">Loading articles...</div>
      } @else if (articles().length === 0) {
        <mat-card class="empty-state">
          <mat-card-content>
            <mat-icon class="empty-icon">article</mat-icon>
            <h2>No Articles Yet</h2>
            <p>Be the first to create an article!</p>
            @if (currentUserId()) {
              <button mat-raised-button color="primary" routerLink="/articles/new">
                Create Article
              </button>
            }
          </mat-card-content>
        </mat-card>
      } @else {
        <div class="table-container">
          <table mat-table [dataSource]="articles()" class="articles-table">
            <ng-container matColumnDef="title">
              <th mat-header-cell *matHeaderCellDef>Title</th>
              <td mat-cell *matCellDef="let article">{{ article.title }}</td>
            </ng-container>

            <ng-container matColumnDef="author">
              <th mat-header-cell *matHeaderCellDef>Author</th>
              <td mat-cell *matCellDef="let article">{{ article.author.name || article.author.email }}</td>
            </ng-container>

            <ng-container matColumnDef="excerpt">
              <th mat-header-cell *matHeaderCellDef>Excerpt</th>
              <td mat-cell *matCellDef="let article" class="excerpt">{{ article.body }}</td>
            </ng-container>

            <ng-container matColumnDef="createdAt">
              <th mat-header-cell *matHeaderCellDef>Created</th>
              <td mat-cell *matCellDef="let article">{{ formatDate(article.createdAt) }}</td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-cell *matCellDef="let article">
                <button mat-icon-button (click)="viewArticle(article)" matTooltip="View">
                  <mat-icon>visibility</mat-icon>
                </button>
                @if (canEdit(article)) {
                  <button mat-icon-button [routerLink]="['/articles', article.id, 'edit']" matTooltip="Edit">
                    <mat-icon>edit</mat-icon>
                  </button>
                  <button mat-icon-button (click)="deleteArticle(article)" matTooltip="Delete" color="warn">
                    <mat-icon>delete</mat-icon>
                  </button>
                }
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>
        </div>
      }
    </div>
  `,
  styles: [`
    .article-list-container {
      padding: 14px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    h1 {
      margin: 0;
      font-size: 32px;
      font-weight: 500;
    }

    .loading {
      text-align: center;
      padding: 48px;
      color: #666;
    }

    .empty-state {
      text-align: center;
      padding: 48px;
      margin-top: 48px;
    }

    .empty-icon {
      font-size: 72px;
      width: 72px;
      height: 72px;
      color: #ccc;
      margin: 0 auto 16px;
    }

    .empty-state h2 {
      margin: 16px 0 8px;
      color: #666;
    }

    .empty-state p {
      color: #999;
      margin-bottom: 24px;
    }

    .table-container {
      background: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .articles-table {
      width: 100%;
    }

    .excerpt {
      max-width: 300px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .mat-column-actions {
      width: 150px;
      text-align: right;
    }
  `]
})
export class ArticleListComponent implements OnInit {
  private articleService = inject(ArticleService);
  private router = inject(Router);

  articles = signal<ArticleListItem[]>([]);
  loading = signal(true);
  currentUserId = signal<string | null>(null);
  displayedColumns = ['title', 'author', 'excerpt', 'createdAt', 'actions'];

  async ngOnInit() {
    await this.loadSession();
    this.loadArticles();
  }

  async loadSession() {
    const session = await authClient.getSession();
    this.currentUserId.set(session.data?.user?.id ?? null);
  }

  loadArticles() {
    this.loading.set(true);
    this.articleService.getArticles().subscribe({
      next: (response) => {
        this.articles.set(response.articles);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading articles:', error);
        this.loading.set(false);
      }
    });
  }

  canEdit(article: ArticleListItem): boolean {
    return this.currentUserId() === article.author.id;
  }

  viewArticle(article: ArticleListItem) {
    this.router.navigate(['/', article.slug]);
  }

  deleteArticle(article: ArticleListItem) {
    if (!confirm(`Are you sure you want to delete "${article.title}"?`)) {
      return;
    }

    this.articleService.deleteArticle(article.id).subscribe({
      next: () => {
        this.loadArticles();
      },
      error: (error) => {
        console.error('Error deleting article:', error);
      }
    });
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString();
  }
}
