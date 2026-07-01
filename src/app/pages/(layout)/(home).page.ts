import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-home',
  imports: [RouterModule, MatButtonModule, MatIconModule, MatCardModule],
  styles: `
    @reference "../../../styles.css";

    .hero {
      text-align: center;
      padding: 80px 24px 64px;
      max-width: 720px;
      margin: 0 auto;
    }

    .hero h1 {
      font-size: 3.5rem;
      font-weight: 800;
      letter-spacing: -0.03em;
      line-height: 1.1;
      margin: 0 0 16px;
      color: #111827;
    }

    .hero h1 span {
      color: #1e3a5f;
    }

    .hero p {
      font-size: 1.25rem;
      color: #6b7280;
      line-height: 1.6;
      margin: 0 0 32px;
      max-width: 560px;
      margin-left: auto;
      margin-right: auto;
    }

    .hero-actions {
      display: flex;
      gap: 12px;
      justify-content: center;
      flex-wrap: wrap;
    }

    .hero-actions a {
      min-width: 160px;
    }

    .features {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 24px;
      padding: 0 24px 80px;
      max-width: 960px;
      margin: 0 auto;
    }

    .feature-card {
      padding: 32px 24px;
      text-align: center;
      border-radius: 12px;
      border: 1px solid #e5e7eb;
      background: #ffffff;
      transition: all 0.2s ease;
    }

    .feature-card:hover {
      border-color: #d1d5db;
      box-shadow: 0 4px 12px rgba(0,0,0,0.05);
      transform: translateY(-2px);
    }

    .feature-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 16px;
      font-size: 24px;
    }

    .feature-icon.blue {
      background: #eef2ff;
      color: #1e3a5f;
    }

    .feature-icon.green {
      background: #ecfdf5;
      color: #059669;
    }

    .feature-icon.purple {
      background: #f5f3ff;
      color: #7c3aed;
    }

    .feature-card h3 {
      font-size: 1.125rem;
      font-weight: 600;
      margin: 0 0 8px;
      color: #111827;
    }

    .feature-card p {
      font-size: 0.9375rem;
      color: #6b7280;
      line-height: 1.5;
      margin: 0;
    }
  `,
  template: `
    <div class="hero">
      <h1>Generate <span>More Leads</span></h1>
      <p>
        Create landing pages with drag-and-drop application forms to capture, manage, and grow your leads — all in one place.
      </p>
      <div class="hero-actions">
        <a mat-raised-button color="primary" routerLink="/signup" size="large">Get Started Free</a>
        <a mat-stroked-button routerLink="/articles/list">View Pages</a>
      </div>
    </div>

    <div class="features">
      <div class="feature-card">
        <div class="feature-icon blue">
          <mat-icon>widgets</mat-icon>
        </div>
        <h3>Drag & Drop Builder</h3>
        <p>Build custom application forms visually. Add text fields, selects, checkboxes and more with simple drag and drop.</p>
      </div>

      <div class="feature-card">
        <div class="feature-icon green">
          <mat-icon>smart_toy</mat-icon>
        </div>
        <h3>Smart Forms</h3>
        <p>Embed dynamic forms on any landing page. Collect validated data with real-time error checking and conditional logic.</p>
      </div>

      <div class="feature-card">
        <div class="feature-icon purple">
          <mat-icon>trending_up</mat-icon>
        </div>
        <h3>Lead Tracking</h3>
        <p>View, search, and export all submissions in one place. Filter by date, form, or page to analyze your conversion funnel.</p>
      </div>
    </div>
  `,
})
export default class Home {}
