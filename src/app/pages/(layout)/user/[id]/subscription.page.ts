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
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { authClient } from '../../../../../lib/auth-client';
import { map } from 'rxjs';
import { PaymentComponent } from '../../../../components/payment.component';

@Component({
  selector: 'app-subscription-page',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    PaymentComponent
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
                  [checked]="isActive()" 
                  (change)="handleToggle($event.checked)"
                  [disabled]="performingStripeAction()"
                  color="primary">
                  Activate Public Subscription
                </mat-checkbox>
              </div>

              @if (showPayment() && clientSecret()) {
                <app-payment 
                  [clientSecret]="clientSecret()!" 
                  (paymentSuccess)="onPaymentSuccess()"
                  (paymentError)="onPaymentError($event)">
                </app-payment>
              }

              <div class="status-container">
                <div class="status-badge" [class.active]="isActive()">
                  Status: {{ statusText() }}
                </div>

                @if (subscribed() && status() === 'active') {
                   @if (cancelAtPeriodEnd()) {
                    <button mat-button color="primary" (click)="reactivateSubscription()" [disabled]="performingStripeAction()">
                      Reactivate Subscription
                    </button>
                   } @else {
                    <button mat-button color="warn" (click)="cancelSubscription()" [disabled]="performingStripeAction()">
                      Cancel Subscription
                    </button>
                   }
                }
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
    .status-container {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: 24px;
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
  private snackBar = inject(MatSnackBar);
  
  userId = toSignal(this.route.params.pipe(map(p => p['id'])));
  session = signal<any>(null);
  
  loading = signal(false);
  performingStripeAction = signal(false);
  error = signal<string | null>(null);
  
  subscribed = signal(false);
  isActive = signal(false);
  status = signal<string | null>(null);
  cancelAtPeriodEnd = signal(false);
  currentPeriodEnd = signal<string | null>(null);
  showPayment = signal(false);
  clientSecret = signal<string | null>(null);

  isCurrentUser = () => {
    const session = this.session();
    const routeId = this.userId();
    return session?.user?.id === routeId;
  };

  statusText = () => {
    if (!this.subscribed()) return 'Inactive (Private)';
    if (this.status() === 'active') {
      if (this.cancelAtPeriodEnd()) {
        const date = this.currentPeriodEnd() ? new Date(this.currentPeriodEnd()!).toLocaleDateString() : 'soon';
        return `Active (Canceled - expires on ${date})`;
      }
      return 'Active (Public)';
    }
    if (this.status() === 'canceled' || !this.isActive()) {
      return 'Inactive (Payment Expired/Private)';
    }
    return `Status: ${this.status()}`;
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
    this.http.get<{ subscribed: boolean, isActive: boolean, subscription: any }>('/api/v1/subscription').subscribe({
      next: (res) => {
        this.subscribed.set(res.subscribed);
        this.isActive.set(res.isActive);
        this.status.set(res.subscription?.status || null);
        this.cancelAtPeriodEnd.set(res.subscription?.cancelAtPeriodEnd || false);
        this.currentPeriodEnd.set(res.subscription?.currentPeriodEnd || null);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load subscription status.');
        this.loading.set(false);
      }
    });
  }

  handleToggle(checked: boolean) {
    if (checked) {
      if (this.subscribed() && this.status() === 'active') {
        if (this.cancelAtPeriodEnd()) {
          this.reactivateSubscription();
        }
        return;
      }
      this.initiateCheckout();
    } else {
      if (this.subscribed() && this.status() === 'active' && !this.cancelAtPeriodEnd()) {
        this.cancelSubscription();
      } else {
        this.showPayment.set(false);
        // If they uncheck while it's "Canceled but active", we might want to do nothing or keep it checked
        // Since it's still active, we'll keep it checked in the UI logic via [checked]="subscribed()"
      }
    }
  }

  initiateCheckout() {
    this.performingStripeAction.set(true);
    this.http.post<{ clientSecret: string }>('/api/v1/stripe/create-subscription', {}).subscribe({
      next: (res) => {
        this.clientSecret.set(res.clientSecret);
        this.showPayment.set(true);
        this.performingStripeAction.set(false);
      },
      error: (err) => {
        this.snackBar.open('Error initializing payment. Please try again.', 'Close', { duration: 5000 });
        this.performingStripeAction.set(false);
      }
    });
  }

  cancelSubscription() {
    if (!confirm('Are you sure you want to cancel your subscription?')) return;

    this.performingStripeAction.set(true);
    this.http.post<{ status: string, cancelAtPeriodEnd: boolean, currentPeriodEnd: string }>('/api/v1/stripe/cancel-subscription', {}).subscribe({
      next: (res) => {
        this.status.set(res.status);
        this.cancelAtPeriodEnd.set(true);
        this.snackBar.open('Subscription canceled. It will remain active until the end of the period.', 'Close', { duration: 5000 });
        this.performingStripeAction.set(false);
        this.fetchSubscriptionStatus();
      },
      error: (err) => {
        this.snackBar.open('Error canceling subscription.', 'Close', { duration: 5000 });
        this.performingStripeAction.set(false);
      }
    });
  }

  reactivateSubscription() {
    this.performingStripeAction.set(true);
    this.http.post<{ status: string, cancelAtPeriodEnd: boolean }>('/api/v1/stripe/reactivate-subscription', {}).subscribe({
      next: (res) => {
        this.status.set(res.status);
        this.cancelAtPeriodEnd.set(false);
        this.snackBar.open('Subscription reactivated successfully!', 'Close', { duration: 5000 });
        this.performingStripeAction.set(false);
        this.fetchSubscriptionStatus();
      },
      error: (err) => {
        this.snackBar.open('Error reactivating subscription.', 'Close', { duration: 5000 });
        this.performingStripeAction.set(false);
      }
    });
  }

  onPaymentSuccess() {
    this.showPayment.set(false);
    
    // Confirm subscription is active in the database
    this.http.post<{ success: boolean, subscription: any }>('/api/v1/stripe/confirm-subscription-active', {}).subscribe({
      next: (res) => {
        this.subscribed.set(true);
        this.status.set('active');
        this.snackBar.open('Subscription activated successfully!', 'Close', { duration: 5000 });
        this.fetchSubscriptionStatus(); // Refresh to be safe
      },
      error: (err) => {
        this.snackBar.open('Payment successful, but could not confirm subscription. Refreshing...', 'Close', { duration: 5000 });
        this.fetchSubscriptionStatus(); // Try to get actual status from server
      }
    });
  }

  onPaymentError(error: string) {
    this.snackBar.open(error, 'Close', { duration: 5000 });
  }
}
