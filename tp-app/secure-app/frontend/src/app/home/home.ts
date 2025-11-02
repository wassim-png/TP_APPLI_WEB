
import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../shared/auth/auth-services';

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
  
export class HomeComponent implements OnInit {
  readonly authService = inject(AuthService);
  
  readonly currentUser = this.authService.currentUser;
  readonly isLoggedIn = this.authService.isLoggedIn;

  ngOnInit() {
    this.authService.whoami();
  }

  logout() {
    this.authService.logout();
  }
}
