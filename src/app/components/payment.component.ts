import { Component, EventEmitter, Input, OnInit, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { loadStripe, Stripe, StripeElements } from '@stripe/stripe-js';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatProgressSpinnerModule],
  template: `
    <div class="payment-container">
      <div id="payment-element">
        <!-- Stripe Elements will be injected here -->
      </div>
      
      @if (errorMessage()) {
        <div class="error-message">
          {{ errorMessage() }}
        </div>
      }

      <div class="actions">
        <button 
          mat-raised-button 
          color="primary" 
          [disabled]="loading() || !stripeLoaded()" 
          (click)="handleSubmit()">
          @if (loading()) {
            <mat-spinner diameter="20"></mat-spinner>
          } @else {
            Subscribe Now
          }
        </button>
      </div>
    </div>
  `,
  styles: [`
    .payment-container {
      margin-top: 20px;
      padding: 16px;
      border: 1px solid #ddd;
      border-radius: 8px;
      background: white;
    }
    #payment-element {
      margin-bottom: 24px;
    }
    .error-message {
      color: #f44336;
      margin-bottom: 16px;
      font-size: 14px;
    }
    .actions {
      display: flex;
      justify-content: flex-end;
    }
  `]
})
export class PaymentComponent implements OnInit {
  @Input({ required: true }) clientSecret!: string;
  @Output() paymentSuccess = new EventEmitter<void>();
  @Output() paymentError = new EventEmitter<string>();

  stripe: Stripe | null = null;
  elements: StripeElements | null = null;
  
  stripeLoaded = signal(false);
  loading = signal(false);
  errorMessage = signal<string | null>(null);

  async ngOnInit() {
    const publishableKey = import.meta.env['VITE_STRIPE_PUBLISHABLE_KEY'];
    if (!publishableKey) {
      this.errorMessage.set('Stripe Publishable Key is not configured.');
      return;
    }

    this.stripe = await loadStripe(publishableKey);
    
    if (this.stripe) {
      this.elements = this.stripe.elements({
        clientSecret: this.clientSecret,
        appearance: {
          theme: 'stripe',
        },
      });

      const paymentElement = this.elements.create('payment');
      paymentElement.mount('#payment-element');
      this.stripeLoaded.set(true);
    }
  }

  async handleSubmit() {
    if (!this.stripe || !this.elements) return;

    this.loading.set(true);
    this.errorMessage.set(null);

    const { error } = await this.stripe.confirmPayment({
      elements: this.elements,
      confirmParams: {
        return_url: window.location.href, // Redirect back to this page
      },
      redirect: 'if_required' // We try to handle it in-place
    });

    if (error) {
      this.errorMessage.set(error.message ?? 'An unknown error occurred');
      this.paymentError.emit(error.message);
    } else {
      // Payment succeeded or requires further action handled by Stripe
      this.paymentSuccess.emit();
    }
    
    this.loading.set(false);
  }
}
