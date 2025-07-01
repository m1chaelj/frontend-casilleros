import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class roleGuard implements CanActivate {
  constructor(private router: Router, @Inject(PLATFORM_ID) private platformId: Object) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    // Solo ejecutar en el navegador
    if (isPlatformBrowser(this.platformId)) {
      // Obtener usuario del sessionStorage
      const usuario = JSON.parse(sessionStorage.getItem('usuario') || '{}');
      // Rol esperado según la ruta
      const rolEsperado = route.data['role'];
      // Si no hay usuario o no tiene rol, redirigir a login
      if (!usuario || !usuario.rol) {
        this.router.navigate(['/login']);
        return false;
      }
      // Si el rol no coincide, redirigir a estado-solicitud
      if (usuario.rol !== rolEsperado) {
        this.router.navigate(['/estado-solicitud']);
        return false;
      }
      // Permitir acceso
      return true;
    }
    // Si no es navegador, denegar acceso
    return false;
  }
}