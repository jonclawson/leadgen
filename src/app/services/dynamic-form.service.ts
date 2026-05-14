import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface DynamicFormListItem {
  id: string;
  name: string;
  description?: string;
  fieldCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface FormFieldDefinitionData {
  id?: string;
  type: string;
  key: string;
  label?: string;
  icon?: string;
  placeholder?: string;
  validators?: string;
  options?: string;
  buttonLabel?: string;
  buttonColor?: string;
  order: number;
}

export interface DynamicFormData {
  id: string;
  name: string;
  description?: string;
  userId: string;
  fields: FormFieldDefinitionData[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateFormRequest {
  name: string;
  description?: string;
  fields: FormFieldDefinitionData[];
}

export interface UpdateFormRequest {
  name: string;
  description?: string;
  fields: FormFieldDefinitionData[];
}

@Injectable({
  providedIn: 'root'
})
export class DynamicFormService {
  private http = inject(HttpClient);
  private readonly baseUrl = '/api/forms';

  getForms(): Observable<{ forms: DynamicFormListItem[] }> {
    return this.http.get<{ forms: DynamicFormListItem[] }>(this.baseUrl);
  }

  getForm(id: string): Observable<{ form: DynamicFormData }> {
    return this.http.get<{ form: DynamicFormData }>(`${this.baseUrl}/${id}`);
  }

  getPublicForm(id: string): Observable<{ form: DynamicFormData }> {
    return this.http.get<{ form: DynamicFormData }>(`${this.baseUrl}/${id}`);
  }

  createForm(data: CreateFormRequest): Observable<{ form: DynamicFormData }> {
    return this.http.post<{ form: DynamicFormData }>(this.baseUrl, data);
  }

  updateForm(id: string, data: UpdateFormRequest): Observable<{ form: DynamicFormData }> {
    return this.http.put<{ form: DynamicFormData }>(`${this.baseUrl}/${id}`, data);
  }

  deleteForm(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.baseUrl}/${id}`);
  }
}
