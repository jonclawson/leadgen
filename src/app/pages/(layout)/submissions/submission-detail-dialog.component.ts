import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { FormSubmission } from '../../../services/form-submission.service';

@Component({
  selector: 'app-submission-detail-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatCardModule
  ],
  template: `
    <div class="detail-dialog">
      <h2 mat-dialog-title>Submission Details</h2>

      <mat-dialog-content class="dialog-content">
        <div class="detail-section">
          <h3>Form Information</h3>
          <div class="info-item">
            <span class="label">Form Name:</span>
            <span class="value">{{ data.form.name }}</span>
          </div>
        </div>

        <div class="detail-section">
          <h3>Page Information</h3>
          <div class="info-item">
            <span class="label">Page Title:</span>
            <span class="value">{{ data.article.title }}</span>
          </div>
        </div>

        <div class="detail-section">
          <h3>Submission Date</h3>
          <div class="info-item">
            <span class="label">Submitted:</span>
            <span class="value">{{ formatDate(data.createdAt) }}</span>
          </div>
        </div>

        <div class="detail-section">
          <h3>Form Data</h3>
          <div class="data-display">
            <pre>{{ formatJson(data.data) }}</pre>
          </div>
        </div>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button [mat-dialog-close]="false">Close</button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .detail-dialog {
      max-width: 600px;
    }

    h2 {
      margin: 0 0 16px 0;
      font-size: 20px;
      font-weight: 500;
    }

    .dialog-content {
      max-height: 60vh;
      overflow-y: auto;
    }

    .detail-section {
      margin-bottom: 24px;
    }

    .detail-section h3 {
      margin: 0 0 12px 0;
      font-size: 14px;
      font-weight: 600;
      color: #333;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .info-item {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: 8px 0;
      border-bottom: 1px solid #e0e0e0;
    }

    .info-item:last-child {
      border-bottom: none;
    }

    .label {
      font-weight: 500;
      color: #666;
      flex-shrink: 0;
      margin-right: 16px;
    }

    .value {
      color: #333;
      word-break: break-word;
      text-align: right;
      flex: 1;
    }

    .data-display {
      background: #f5f5f5;
      border-radius: 4px;
      padding: 12px;
      overflow-x: auto;
    }

    pre {
      margin: 0;
      font-size: 12px;
      line-height: 1.5;
      color: #333;
      font-family: 'Courier New', Courier, monospace;
    }

    mat-dialog-actions {
      padding: 16px 0 0 0;
      margin-top: 24px;
      border-top: 1px solid #e0e0e0;
    }
  `]
})
export class SubmissionDetailDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: FormSubmission) {}

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }

  formatJson(jsonString: string): string {
    try {
      const parsed = typeof jsonString === 'string' ? JSON.parse(jsonString) : jsonString;
      return JSON.stringify(parsed, null, 2);
    } catch (e) {
      return jsonString;
    }
  }
}
