import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { authClient } from '../../../../../lib/auth-client';
import { map, of } from 'rxjs';

@Component({
  selector: 'app-subscription-page',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="subscription-container section">
      <mat-card class="subscription-card">
        <mat-card-header>
          <mat-card-title>My Subscription</mat-card-title>
          <mat-card-subtitle>Manage article visibility</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          @if (loading()) {
            <div class="loading-spinner">
              <mat-spinner diameter="40"></mat-spinner>
            </div>
          } @else if (error()) {
            <p class="error-message">
              <mat-icon color="warn">error</mat-icon>
              {{ error() }}
            </p>
          } @else if (!isCurrentUser()) {
             <p class="error-message">You are not authorized to view this page.</p>
          } @else {
            <div class="subscription-info">
              <p>
                By subscribing, your landing pages will be publicly visible to everyone.
                If you unsubscribe, only you can see your articles.
              </p>
              
              <div class="toggle-container">
                <mat-checkbox 
                  [checked]="subscribed()" 
                  (change)="toggleSubscription($event.checked)"
                  color="primary">
                  Activate Public Subscription
                </mat-checkbox>
              </div>

              <div class="status-badge" [class.active]="subscribed()">
                Status: {{ subscribed() ? 'Active (Public)' : 'Inactive (Private)' }}
              </div>
            </div>
          }
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .subscription-container {
      max-width: 600px;
      margin: 40px auto;
      padding: 0 20px;
    }
    .subscription-card {
      padding: 24px;
    }
    .loading-spinner {
      display: flex;
      justify-content: center;
      padding: 32px;
    }
    .subscription-info {
      margin-top: 16px;
    }
    .toggle-container {
      margin: 24px 0;
    }
    .status-badge {
      display: inline-block;
      padding: 8px 16px;
      border-radius: 20px;
      background: #f0f0f0;
      font-weight: 500;
      font-size: 14px;
    }
    .status-badge.active {
      background: #e8f5e9;
      color: #2e7d32;
    }
    .error-message {
      color: #d32f2f;
      display: flex;
      align-items: center;
      gap: 8px;
    }
  `]
})
export default class SubscriptionPage {
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  
  userId = toSignal(this.route.params.pipe(map(p => p['id'])));
  session = signal<any>(null);
  
  loading = signal(false);
  error = signal<string | null>(null);
  subscribed = signal(false);

  isCurrentUser = () => {
    const session = this.session();
    const routeId = this.userId();
    return session?.user?.id === routeId;
  };

  constructor() {
    this.init();
  }

  async init() {
    const session = await authClient.getSession();
    this.session.set(session.data);
    this.fetchSubscriptionStatus();
  }

  async fetchSubscriptionStatus() {
    this.loading.set(true);
    this.http.get<{ subscribed: boolean }>('/api/v1/subscription').subscribe({
      next: (res) => {
        this.subscribed.set(res.subscribed);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load subscription status.');
        this.loading.set(false);
      }
    });
  }

  toggleSubscription(subscribe: boolean) {
    this.loading.set(true);
    this.http.post<{ subscribed: boolean }>('/api/v1/subscription', { subscribe }).subscribe({
      next: (res) => {
        this.subscribed.set(res.subscribed);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Could not update subscription.');
        this.loading.set(false);
      }
    });
  }
}
