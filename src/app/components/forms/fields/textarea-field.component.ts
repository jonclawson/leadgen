import { Component, computed, input } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-textarea-field',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
  ],
  template: `
    <mat-form-field class="field">
      <mat-label>{{ label() }}</mat-label>
      <textarea matInput 
        [formControl]="control()" 
        [placeholder]="placeholder()"
        [rows]="rows()"
        class="field__input--textarea">
      </textarea>
      @if (icon()) {
        <mat-icon matSuffix class="field__icon">{{ icon() }}</mat-icon>
      }
      @if (formGroup().get(controlName())?.hasError('required')) {
        <mat-error>{{ label() }} is required</mat-error>
      }
      @if (formGroup().get(controlName())?.hasError('minlength')) {
        <mat-error>{{ label() }} is too short</mat-error>
      }
      @if (formGroup().get(controlName())?.hasError('maxlength')) {
        <mat-error>{{ label() }} is too long</mat-error>
      }
    </mat-form-field>
  `,
})
export default class TextareaFieldComponent {
  readonly label = input('');
  readonly formGroup = input.required<FormGroup>();
  readonly controlName = input.required<string>();
  readonly icon = input('');
  readonly placeholder = input('');
  readonly rows = input(3);
  readonly control = computed(() => this.formGroup().get(this.controlName()) as FormControl);
}
