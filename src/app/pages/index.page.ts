import { Component } from '@angular/core';
import { MessageService } from '../services/message.service';
import AuthComponent from '../components/auth.component';
@Component({
  selector: 'app-home',
  imports: [AuthComponent],
  template: `
     {{ message }}
      <div>
        <app-auth></app-auth>
      </div>
  `,
})
export default class Home {
  message: string = 'Loading...';

  constructor(private messageService: MessageService) {
    this.messageService.getMessage().subscribe((data) => {
      this.message = data.message;
    });
  }
} 
