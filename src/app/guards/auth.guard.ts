import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class authGuard implements CanActivate {
  constructor(private router: Router, @Inject(PLATFORM_ID) private platformId: Object) {}

  canActivate(): boolean {
    if (isPlatformBrowser(this.platformId)) {
      if (!sessionStorage.getItem('token')) {
        this.router.navigate(['/login']);
        return false;
      }
      return true;
    }
    // Si no es browser, no permitir navegación protegida
    return false;
  }
}