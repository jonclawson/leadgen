import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import AuthComponent from '../components/auth.component';
import { authClient } from '../../lib/auth-client';

@Component({
  standalone: true,
  imports: [CommonModule, RouterModule, AuthComponent, MatButtonModule, MatIconModule],
  styleUrls: ['./layout.css'],
  template: `
    <header class="site-header">
      <div class="site-header__title">My App</div>
      <nav class="site-nav">
        <a routerLink="/articles/list" routerLinkActive="active" mat-button>
          <mat-icon>article</mat-icon>
          Articles
        </a>
        @if (user()) {
          <a routerLink="/forms" routerLinkActive="active" mat-button>
            <mat-icon>description</mat-icon>
            Forms
          </a>
          <a routerLink="/submissions" routerLinkActive="active" mat-button>
            <mat-icon>mail</mat-icon>
            Submissions
          </a>
        }
      </nav>
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
export default class AppLayout implements OnInit {
  user = signal<any | null>(null);

  async ngOnInit() {
    await this.getSession();
  }

  async getSession() {
    const session = await authClient.getSession();
    this.user.set(session.data?.user ?? null);
  }
}