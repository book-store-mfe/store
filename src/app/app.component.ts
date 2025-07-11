import { Component, inject, } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule, MatIconButton } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ProfileStateService } from '@bookstore-app/shared-lib';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, MatToolbarModule, MatButtonModule, MatIconModule, MatIconButton],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  profile = inject(ProfileStateService);

  constructor() {
    this.profile.name.set("Jeferson Belmiro")
    this.profile.email.set("jeferson.belmiro@gmail.com");
  }

}
