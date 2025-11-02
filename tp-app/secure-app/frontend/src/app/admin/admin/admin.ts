import { Component, effect, inject } from '@angular/core'
import { UserService } from '../../users/user';

@Component({
  selector: 'app-admin',
  imports: [],
  templateUrl: './admin.html',
  styleUrl: './admin.css'
})
  
export class AdminComponent {
  private readonly userService = inject(UserService);
  readonly users = this.userService.users;
  // Charge la liste à l’arrivée sur la page
  constructor() {
    effect(() => this.userService.loadAll())
  }
}
