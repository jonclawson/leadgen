import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import AuthComponent from '../components/auth.component';
import { authClient } from '../../lib/auth-client';

@Component({
  standalone: true,
  imports: [CommonModule, RouterModule, AuthComponent, MatButtonModule, MatIconModule, MatToolbarModule],
  styleUrls: ['./layout.css'],
  template: `
    <header class="site-header">
      <div class="site-header__toolbar">
        <div class="site-header__title">
          <button routerLink="/">Leadgen</button>
        </div>
        <nav class="site-nav">
          <a routerLink="/articles/list" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">
            Pages
          </a>
          @if (user()) {
            <a routerLink="/forms" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">
              Applications
            </a>
            <a routerLink="/submissions" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">
              Leads
            </a>
          }
        </nav>
        <div class="site-header__auth">
          <app-auth></app-auth>
        </div>
      </div>
    </header>

    <main class="site-main">
      <router-outlet></router-outlet>
    </main>

    <footer class="site-footer">
      &copy; 2026 Leadgen. All rights reserved.
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
