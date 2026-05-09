import { Component, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-submit-button',
  standalone: true,
  imports: [CommonModule, MatButtonModule],
  template: `
    <button mat-raised-button
            type="submit"
            [color]="color()"
            [disabled]="disabled()">
      {{ label() }}
    </button>
  `,
})
export default class SubmitButtonComponent {
  readonly label = input('Submit');
  readonly disabled = input(false);
  readonly color = input<'primary' | 'accent' | 'warn'>('primary');
}
