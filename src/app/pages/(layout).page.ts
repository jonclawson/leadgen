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
      <mat-toolbar class="site-header__toolbar">
      <div  class="site-header__title"><button routerLink="/">Leadgen</button></div>
      <nav class="site-nav">
        <a routerLink="/articles/list" routerLinkActive="active" mat-button>
          Pages
        </a>
        @if (user()) {
          <a routerLink="/forms" routerLinkActive="active" mat-button>
            Applications
          </a>
          <a routerLink="/submissions" routerLinkActive="active" mat-button>
            Leads
          </a>
        }
      </nav>
      <div class="site-header__auth">
        <app-auth></app-auth>
      </div>
      </mat-toolbar>
    </header>

    <main class="site-main">
      <router-outlet></router-outlet>
    </main>

    <footer class="site-footer">
      © 2026 Leadgen. All rights reserved.
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