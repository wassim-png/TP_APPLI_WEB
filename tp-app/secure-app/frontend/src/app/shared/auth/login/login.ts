import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth-services';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  login = '';
  password = '';

  readonly isLoading = this.authService.isLoading;
  readonly error = this.authService.error;

  onSubmit() {
    if (!this.login || !this.password) {
      return;
    }

    this.authService.login(this.login, this.password);

    const checkLogin = setInterval(() => {
      if (this.authService.isLoggedIn() && !this.authService.isLoading()) {
        clearInterval(checkLogin);
        this.router.navigate(['/home']);
      }
    }, 100);

    setTimeout(() => clearInterval(checkLogin), 5000);
  }
}
