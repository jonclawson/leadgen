import { Component } from '@angular/core';
import { injectLoad, RouteMeta } from '@analogjs/router';
import { CommonModule } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { ArticleViewComponent } from '../components/articles/article-view.component';
import { load } from './[slug].server';

export const routeMeta: RouteMeta = {
  title: 'Article',
};

@Component({
  selector: 'app-article-page',
  standalone: true,
  imports: [CommonModule, ArticleViewComponent],
  template: `
    @if (data(); as articleData) {
      @if (articleData.article) {
        <app-article-view [article]="articleData.article"></app-article-view>
      } @else {
        <div class="error-container">
          <h1>Page Not Found</h1>
          <p>The Page you're looking for doesn't exist.</p>
        </div>
      }
    } @else {
      <div class="loading-container">
        <p>Loading...</p>
      </div>
    }
  `,
  styles: [`
    .error-container, .loading-container {
      padding: 48px 24px;
      text-align: center;
      max-width: 600px;
      margin: 0 auto;
    }

    .error-container h1 {
      font-size: 32px;
      margin-bottom: 16px;
      color: #333;
    }

    .error-container p {
      font-size: 16px;
      color: #666;
    }

    .loading-container p {
      font-size: 16px;
      color: #666;
    }
  `]
})
export default class ArticlePage {
  data = toSignal(injectLoad<typeof load>(), { requireSync: true });
}
