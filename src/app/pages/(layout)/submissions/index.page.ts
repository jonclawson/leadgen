import { Component, OnInit, OnDestroy, signal, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule, MatSort, Sort } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';

import { FormSubmissionService, FormSubmission, SubmissionsResponse } from '../../../services/form-submission.service';
import { SubmissionDetailDialogComponent } from './submission-detail-dialog.component';
import './submissions.component.scss';

@Component({
  selector: 'app-submissions',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatSnackBarModule,
    MatDialogModule
  ],
  template: `
    <div class="submissions-container section">
      <div class="header">
        <h1>Leads</h1>
      </div>

      <div class="filters-card">
        <div>
          <h2>Filters</h2>
        </div>
        <div>
          <form [formGroup]="filterForm" class="filters-form">
            <mat-form-field>
              <mat-label>Search</mat-label>
              <input matInput formControlName="search" placeholder="Search by form or page name">
            </mat-form-field>

            <mat-form-field>
              <mat-label>From Date</mat-label>
              <input matInput formControlName="dateFrom" type="date">
            </mat-form-field>

            <mat-form-field>
              <mat-label>To Date</mat-label>
              <input matInput formControlName="dateTo" type="date">
            </mat-form-field>

            <button mat-stroked-button (click)="resetFilters()" type="button">
              <mat-icon>refresh</mat-icon>
              Reset
            </button>
          </form>
        </div>
      </div>

      @if (loading()) {
        <div class="loading">Loading...</div>
      } @else if (submissions().length === 0) {
        <mat-card class="empty-state">
          <mat-card-content>
            <mat-icon class="empty-icon">inbox</mat-icon>
            <h2>No Leads Yet</h2>
            <p>Submissions to your forms will appear here.</p>
          </mat-card-content>
        </mat-card>
      } @else {
        <div class="table-container">
          <table mat-table [dataSource]="submissions()" matSort (matSortChange)="onSortChange($event)" [matSortActive]="sortBy()" [matSortDirection]="sortOrder()" class="submissions-table">
            <ng-container matColumnDef="formName">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Form</th>
              <td mat-cell *matCellDef="let row">{{ row.form.name }}</td>
            </ng-container>

            <ng-container matColumnDef="articleTitle">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Page</th>
              <td mat-cell *matCellDef="let row">{{ row.article.title }}</td>
            </ng-container>

            <ng-container matColumnDef="data">
              <th mat-header-cell *matHeaderCellDef>Form Data</th>
              <td mat-cell *matCellDef="let row" class="data-cell">{{ formatDataPreview(row.data) }}</td>
            </ng-container>

            <ng-container matColumnDef="createdAt">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Submitted</th>
              <td mat-cell *matCellDef="let row">{{ formatDate(row.createdAt) }}</td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-cell *matCellDef="let row">
                <button mat-icon-button (click)="viewDetails(row)" matTooltip="View Details" color="primary">
                  <mat-icon>visibility</mat-icon>
                </button>
                <button mat-icon-button (click)="deleteSubmission(row)" matTooltip="Delete" color="warn">
                  <mat-icon>delete</mat-icon>
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns; sticky: true"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;" class="table-row" (click)="viewDetails(row)"></tr>
          </table>

          <mat-paginator
            [length]="total()"
            [pageSize]="pageSize()"
            [pageSizeOptions]="[5, 10, 25, 50]"
            showFirstLastButtons
            [pageIndex]="currentPage()"
            (page)="onPageChange($event)">
          </mat-paginator>
        </div>
      }
    </div>
  `
})
export default class SubmissionsPage implements OnInit, OnDestroy {
  @ViewChild(MatSort) sort!: MatSort;
  
  private formSubmissionService = inject(FormSubmissionService);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);
  private destroy$ = new Subject<void>();
  private searchSubject$ = new Subject<string>();

  submissions = signal<FormSubmission[]>([]);
  loading = signal(false);
  total = signal(0);
  pageSize = signal(10);
  currentPage = signal(0);
  sortBy = signal('createdAt');
  sortOrder = signal<'asc' | 'desc'>('desc');

  displayedColumns = ['formName', 'articleTitle', 'data', 'createdAt', 'actions'];

  filterForm: FormGroup;

  constructor() {
    this.filterForm = this.fb.group({
      search: [''],
      dateFrom: [''],
      dateTo: ['']
    });
  }

  ngOnInit() {
    this.setupFilterListeners();
    this.loadSubmissions();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupFilterListeners() {
    // Debounce search input
    this.filterForm.get('search')?.valueChanges
      .pipe(
        debounceTime(300),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.currentPage.set(0);
        this.loadSubmissions();
      });

    // Date range changes
    this.filterForm.valueChanges
      .pipe(
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        if (this.filterForm.get('dateFrom')?.value || this.filterForm.get('dateTo')?.value) {
          this.currentPage.set(0);
          this.loadSubmissions();
        }
      });
  }

  private loadSubmissions() {
    this.loading.set(true);

    const filters = {
      skip: this.currentPage() * this.pageSize(),
      take: this.pageSize(),
      sortBy: this.sortBy(),
      sortOrder: this.sortOrder(),
      search: this.filterForm.get('search')?.value || undefined,
      dateFrom: this.filterForm.get('dateFrom')?.value || undefined,
      dateTo: this.filterForm.get('dateTo')?.value || undefined
    };

    this.formSubmissionService.getSubmissions(filters).subscribe({
      next: (response: SubmissionsResponse) => {
        this.submissions.set(response.submissions);
        this.total.set(response.total);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading submissions:', error);
        this.snackBar.open('Error loading submissions', 'Close', { duration: 3000 });
        this.loading.set(false);
      }
    });
  }

  onPageChange(event: PageEvent) {
    this.currentPage.set(Math.floor(event.pageIndex));
    this.pageSize.set(event.pageSize);
    this.loadSubmissions();
  }

  onSortChange(sort: Sort) {
    if (sort.direction) {
      this.sortBy.set(sort.active);
      this.sortOrder.set(sort.direction as 'asc' | 'desc');
      this.currentPage.set(0);
      this.loadSubmissions();
    }
  }

  resetFilters() {
    this.filterForm.reset();
    this.currentPage.set(0);
    this.sortBy.set('createdAt');
    this.sortOrder.set('desc');
    this.loadSubmissions();
  }

  viewDetails(submission: FormSubmission) {
    this.dialog.open(SubmissionDetailDialogComponent, {
      width: '600px',
      data: submission
    });
  }

  deleteSubmission(submission: FormSubmission) {
    if (!confirm(`Are you sure you want to delete this submission?`)) {
      return;
    }

    this.formSubmissionService.deleteSubmission(submission.id).subscribe({
      next: () => {
        this.snackBar.open('Submission deleted successfully', 'Close', { duration: 3000 });
        this.loadSubmissions();
      },
      error: (error) => {
        console.error('Error deleting submission:', error);
        this.snackBar.open('Error deleting submission', 'Close', { duration: 3000 });
      }
    });
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatDataPreview(data: string): string {
    try {
      const parsed = typeof data === 'string' ? JSON.parse(data) : data;
      const entries = Object.entries(parsed);
      const parts = entries.map(([key, value]) => {
        const strValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
        return `${key}: ${strValue}`;
      });
      const preview = parts.join(', ');
      return preview.length > 120 ? preview.substring(0, 120) + '...' : preview;
    } catch {
      return data || 'No data';
    }
  }
}