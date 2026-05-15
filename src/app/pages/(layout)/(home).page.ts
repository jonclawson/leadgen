import { Component } from '@angular/core';
import { MessageService } from '../../services/message.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [ RouterModule],
  styles: `
  @reference "../../../styles.css";
  .signup {
    @apply text-center;
  }
  `,
  template: `
    <div class="section">
      <h1>Generate Leads</h1>
      <p>Create landing pages with appication to collect leads today.</p>
      <p class="signup"><button routerLink="/signup">Sign Up</button></p>
    </div>
     <!-- {{ message }} -->

  `,
})
export default class Home {
  // message: string = 'Loading...';

  constructor(private messageService: MessageService) {
    // this.messageService.getMessage().subscribe((data) => {
    //   this.message = data.message;
    // });
  }
} 
