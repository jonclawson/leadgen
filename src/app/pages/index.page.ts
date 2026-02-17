import { Component } from '@angular/core';
import { MessageService } from '../services/message.service';

@Component({
  selector: 'app-home',
  imports: [],
  template: `
     {{ message }}
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
