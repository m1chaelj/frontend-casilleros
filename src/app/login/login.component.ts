import { Component, EventEmitter, Output, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  credenciales = { correo: '', contrasena: '' };
  error = '';
  loading = false;

  @Output() loginSuccess = new EventEmitter<any>();

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  async handleSubmit(): Promise<void> {
    if (!this.credenciales.correo || !this.credenciales.contrasena) {
      this.error = 'Ingresa correo y contraseña';
      return;
    }

    this.loading = true;
    this.error = '';

    try {
      const loginRes: any = await this.http.post('https://backend-casilleros.onrender.com/usuarios/login', this.credenciales).toPromise();

      if (isPlatformBrowser(this.platformId)) {
        sessionStorage.setItem('token', loginRes.token);
        // Guarda el usuario completo, incluyendo id_usuario y rol
        sessionStorage.setItem('usuario', JSON.stringify({
          id_usuario: loginRes.id_usuario,
          correo: this.credenciales.correo,
          rol: loginRes.rol || 'alumno'
        }));
      }

      this.loginSuccess.emit(loginRes);
      this.router.navigate([loginRes.rol === 'coordinador' ? '/coordinador' : '/estado-solicitud']);

    } catch (err: any) {
      this.error = err.error?.error || 'Error al iniciar sesión';
    } finally {
      this.loading = false;
    }
  }

  navigateToRegister(): void {
    this.router.navigate(['/register']);
  }
}