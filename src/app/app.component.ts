import { Component, inject, signal } from '@angular/core';
import { MatButtonModule, MatIconButton } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { AuthService, ProfileStateService } from '@bookstore-app/shared-lib';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, MatToolbarModule, MatButtonModule, MatIconModule, MatIconButton],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  profile = inject(ProfileStateService);
  auth = inject(AuthService);
  router = inject(Router);
  theme = signal<'light' | 'dark'>('light');

  ngOnInit() {
    const user = this.auth.signInSilent();
    if (!user) {
      this.router.navigate(['/login'])
      return;
    }
    this.profile.name.set(user.name)
    this.profile.email.set(user.email)
  }

  signOut() {
    this.auth.signOut();
    this.router.navigate(['/login'])
  }

  switchTheme() {
    this.theme.set(this.theme() === 'dark' ? 'light' : 'dark')
    document.body.style.setProperty('color-scheme', this.theme());
  }
}
