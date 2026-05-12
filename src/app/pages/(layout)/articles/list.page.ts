import { Component } from '@angular/core';
import { ArticleListComponent } from '../../../components/articles/article-list.component';

@Component({
  selector: 'app-articles-list-page',
  standalone: true,
  imports: [ArticleListComponent],
  template: `<app-article-list></app-article-list>`,
})
export default class ArticlesListPage {}
