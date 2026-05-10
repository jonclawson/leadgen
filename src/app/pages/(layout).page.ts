import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import AuthComponent from '../components/auth.component';

@Component({
  standalone: true,
  imports: [CommonModule, RouterModule, AuthComponent],
  styleUrls: ['./layout.css'],
  template: `
    <header class="site-header">
      <div class="site-header__title">My App</div>
      <div class="site-header__auth">
        <app-auth></app-auth>
      </div>
    </header>

    <main class="site-main">
      <router-outlet></router-outlet>
    </main>

    <footer class="site-footer">
      © 2026 My App
    </footer>
  `,
})
export default class AppLayout {}