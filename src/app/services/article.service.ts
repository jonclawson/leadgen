import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ArticleAuthor {
  id: string;
  name: string | null;
  email: string;
}

export interface ArticleListItem {
  id: string;
  title: string;
  slug: string;
  body: string; // excerpt
  author: ArticleAuthor;
  formId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  body: string;
  userId: string;
  author: ArticleAuthor;
  formId?: string | null;
  form?: {
    id: string;
    name: string;
    fields: Array<{
      id: string;
      type: string;
      key: string;
      label?: string | null;
      icon?: string | null;
      placeholder?: string | null;
      validators?: string | null;
      buttonLabel?: string | null;
      buttonColor?: string | null;
      order: number;
    }>;
  } | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateArticleRequest {
  title: string;
  slug: string;
  body: string;
  formId?: string | null;
}

export interface UpdateArticleRequest {
  title: string;
  slug: string;
  body: string;
  formId?: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class ArticleService {
  private http = inject(HttpClient);
  private readonly baseUrl = '/api/articles';

  getArticles(): Observable<{ articles: ArticleListItem[] }> {
    return this.http.get<{ articles: ArticleListItem[] }>(this.baseUrl);
  }

  getArticle(id: string): Observable<{ article: Article }> {
    return this.http.get<{ article: Article }>(`${this.baseUrl}/${id}`);
  }

  getArticleBySlug(slug: string): Observable<{ article: Article }> {
    return this.http.get<{ article: Article }>(`${this.baseUrl}/slug/${slug}`);
  }

  createArticle(data: CreateArticleRequest): Observable<{ article: Article }> {
    return this.http.post<{ article: Article }>(this.baseUrl, data);
  }

  updateArticle(id: string, data: UpdateArticleRequest): Observable<{ article: Article }> {
    return this.http.put<{ article: Article }>(`${this.baseUrl}/${id}`, data);
  }

  deleteArticle(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.baseUrl}/${id}`);
  }
}
