import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface FormSubmissionForm {
  id: string;
  name: string;
}

export interface FormSubmissionArticle {
  id: string;
  title: string;
}

export interface FormSubmission {
  id: string;
  formId: string;
  form: FormSubmissionForm;
  articleId: string;
  article: FormSubmissionArticle;
  userId: string;
  data: string; // JSON string
  createdAt: Date;
  updatedAt: Date;
}

export interface SubmissionFilters {
  skip?: number;
  take?: number;
  sortBy?: string;
  sortOrder?: string;
  formId?: string;
  articleId?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

export interface SubmissionsResponse {
  submissions: FormSubmission[];
  total: number;
  page: number;
  pageSize: number;
}

@Injectable({
  providedIn: 'root'
})
export class FormSubmissionService {
  private http = inject(HttpClient);
  private readonly baseUrl = '/api/form-submissions';

  submitForm(
    formId: string,
    articleId: string,
    data: Record<string, unknown>
  ): Observable<{ submission: FormSubmission }> {
    return this.http.post<{ submission: FormSubmission }>(this.baseUrl, {
      formId,
      articleId,
      data
    });
  }

  getSubmissions(filters: SubmissionFilters): Observable<SubmissionsResponse> {
    let params = new HttpParams();

    if (filters.skip !== undefined) {
      params = params.set('skip', filters.skip.toString());
    }
    if (filters.take !== undefined) {
      params = params.set('take', filters.take.toString());
    }
    if (filters.sortBy) {
      params = params.set('sortBy', filters.sortBy);
    }
    if (filters.sortOrder) {
      params = params.set('sortOrder', filters.sortOrder);
    }
    if (filters.formId) {
      params = params.set('formId', filters.formId);
    }
    if (filters.articleId) {
      params = params.set('articleId', filters.articleId);
    }
    if (filters.dateFrom) {
      params = params.set('dateFrom', filters.dateFrom);
    }
    if (filters.dateTo) {
      params = params.set('dateTo', filters.dateTo);
    }
    if (filters.search) {
      params = params.set('search', filters.search);
    }

    return this.http.get<SubmissionsResponse>(this.baseUrl, { params });
  }

  deleteSubmission(id: string): Observable<{ success: boolean }> {
    return this.http.delete<{ success: boolean }>(`${this.baseUrl}/${id}`);
  }
}
