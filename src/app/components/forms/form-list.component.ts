import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DynamicFormService, DynamicFormListItem } from '../../services/dynamic-form.service';

@Component({
  selector: 'app-form-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatDialogModule,
    MatSnackBarModule,
    MatTooltipModule
  ],
  template: `
    <div class="form-list-container">
      <div class="header">
        <h1>Dynamic Forms</h1>
        <button mat-raised-button color="primary" routerLink="/forms/new">
          <mat-icon>add</mat-icon>
          Create New Form
        </button>
      </div>

      @if (loading()) {
        <div class="loading">Loading forms...</div>
      } @else if (forms().length === 0) {
        <mat-card class="empty-state">
          <mat-card-content>
            <mat-icon class="empty-icon">description</mat-icon>
            <h2>No Forms Yet</h2>
            <p>Create your first dynamic form to get started.</p>
            <button mat-raised-button color="primary" routerLink="/forms/new">
              Create Form
            </button>
          </mat-card-content>
        </mat-card>
      } @else {
        <div class="table-container">
          <table mat-table [dataSource]="forms()" class="forms-table">
            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef>Name</th>
              <td mat-cell *matCellDef="let form">{{ form.name }}</td>
            </ng-container>

            <ng-container matColumnDef="description">
              <th mat-header-cell *matHeaderCellDef>Description</th>
              <td mat-cell *matCellDef="let form">{{ form.description || '—' }}</td>
            </ng-container>

            <ng-container matColumnDef="fieldCount">
              <th mat-header-cell *matHeaderCellDef>Fields</th>
              <td mat-cell *matCellDef="let form">{{ form.fieldCount }}</td>
            </ng-container>

            <ng-container matColumnDef="createdAt">
              <th mat-header-cell *matHeaderCellDef>Created</th>
              <td mat-cell *matCellDef="let form">{{ formatDate(form.createdAt) }}</td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-cell *matCellDef="let form">
                <button mat-icon-button [routerLink]="['/forms', form.id, 'view']" matTooltip="View">
                  <mat-icon>visibility</mat-icon>
                </button>
                <button mat-icon-button [routerLink]="['/forms', form.id, 'edit']" matTooltip="Edit">
                  <mat-icon>edit</mat-icon>
                </button>
                <button mat-icon-button (click)="deleteForm(form)" matTooltip="Delete" color="warn">
                  <mat-icon>delete</mat-icon>
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>
        </div>
      }
    </div>
  `,
  styles: [`
    .form-list-container {
      padding: 24px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    h1 {
      margin: 0;
      font-size: 32px;
      font-weight: 500;
    }

    .loading {
      text-align: center;
      padding: 48px;
      color: #666;
    }

    .empty-state {
      text-align: center;
      padding: 48px;
      margin-top: 48px;
    }

    .empty-icon {
      font-size: 72px;
      width: 72px;
      height: 72px;
      color: #ccc;
      margin: 0 auto 16px;
    }

    .empty-state h2 {
      margin: 16px 0 8px;
      color: #666;
    }

    .empty-state p {
      color: #999;
      margin-bottom: 24px;
    }

    .table-container {
      background: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .forms-table {
      width: 100%;
    }

    .mat-column-actions {
      width: 150px;
      text-align: right;
    }
  `]
})
export default class FormListComponent implements OnInit {
  private formService = inject(DynamicFormService);
  private snackBar = inject(MatSnackBar);

  forms = signal<DynamicFormListItem[]>([]);
  loading = signal(true);
  displayedColumns = ['name', 'description', 'fieldCount', 'createdAt', 'actions'];

  ngOnInit() {
    this.loadForms();
  }

  loadForms() {
    this.loading.set(true);
    this.formService.getForms().subscribe({
      next: (response) => {
        this.forms.set(response.forms);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading forms:', error);
        // this.snackBar.open('Error loading forms', 'Close', { duration: 3000 });
        this.loading.set(false);
      }
    });
  }

  deleteForm(form: DynamicFormListItem) {
    if (!confirm(`Are you sure you want to delete "${form.name}"?`)) {
      return;
    }

    this.formService.deleteForm(form.id).subscribe({
      next: () => {
        // this.snackBar.open('Form deleted successfully', 'Close', { duration: 3000 });
        this.loadForms();
      },
      error: (error) => {
        console.error('Error deleting form:', error);
        // this.snackBar.open('Error deleting form', 'Close', { duration: 3000 });
      }
    });
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString();
  }
}
