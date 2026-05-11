import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import FormBuilderComponent from '../../../../components/form-builder/form-builder.component';

@Component({
  selector: 'app-edit-form-page',
  standalone: true,
  imports: [FormBuilderComponent],
  template: `
    @if (id()) {
      <app-form-builder [formId]="id()"></app-form-builder>
    }
  `,
})
export default class EditFormPage implements OnInit {
  private route = inject(ActivatedRoute);
  id = signal<string>('');

  ngOnInit() {
    this.id.set(this.route.snapshot.paramMap.get('id') || '');
    console.log('Editing form with ID:', this.id());  
  }
}
