import { Component } from '@angular/core';
import FormListComponent from '../../../components/forms/form-list.component';

@Component({
  selector: 'app-forms-page',
  standalone: true,
  imports: [FormListComponent],
  template: `<app-form-list></app-form-list>`,
})
export default class FormsPage {}
