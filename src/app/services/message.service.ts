import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MessageService {
  constructor(private http: HttpClient) {}

  getMessage(): Observable<{ message: string }> {
    return this.http.get<{ message: string }>('/api/v1/hello');
  }
}