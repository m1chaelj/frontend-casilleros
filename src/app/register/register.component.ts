import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  credenciales = {
    correo: '',
    contrasena: '',
    rol: 'alumno' // Fijar el rol a 'alumno'
  };
  error = '';
  success = false;
  loading = false;

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  async handleSubmit() {
    this.loading = true;
    this.error = '';
    this.success = false;
    try {
      const res = await this.http.post<any>('http://localhost:3001/usuarios', {
        correo: this.credenciales.correo,
        contrasena: this.credenciales.contrasena,
        rol: 'alumno' // Forzar el rol a 'alumno' en la petición
      }).toPromise();
      this.success = true;
      if (isPlatformBrowser(this.platformId)) {
        this.credenciales = { correo: '', contrasena: '', rol: 'alumno' };
      }
      // Redirigir al login tras registro exitoso
      this.router.navigate(['/login']);
    } catch (err: any) {
      this.error = err?.error?.error || 'Error al registrar usuario';
    }
    this.loading = false;
  }

  navigateToLogin() {
    this.router.navigate(['/login']);
  }
}