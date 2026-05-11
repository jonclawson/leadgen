import { Component } from '@angular/core';
import FormBuilderComponent from '../../../components/form-builder/form-builder.component';

@Component({
  selector: 'app-new-form-page',
  standalone: true,
  imports: [FormBuilderComponent],
  template: `<app-form-builder></app-form-builder>`,
})
export default class NewFormPage {}
