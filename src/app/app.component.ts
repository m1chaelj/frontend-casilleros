import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Sistema de Casilleros ESCOM';

  constructor(private router: Router, public authService: AuthService) {}

  isLoginOrRegisterRoute(): boolean {
    const url = this.router.url;
    return url === '/login' || url === '/register';
  }

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn() && !this.isLoginOrRegisterRoute();
  }

  logout() {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('usuario');
    this.router.navigate(['/login']);
  }
}