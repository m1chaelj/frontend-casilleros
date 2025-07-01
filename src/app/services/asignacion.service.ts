import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AsignacionService {
  private apiUrl = `${environment.apiUrl}/asignaciones`;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  private getAuthHeaders(): HttpHeaders {
    let headers = new HttpHeaders();
    if (isPlatformBrowser(this.platformId)) {
      const token = sessionStorage.getItem('token');
      if (token) {
        headers = headers.set('Authorization', `Bearer ${token}`);
      }
    }
    return headers;
  }

  obtenerAsignacionesUsuario(idUsuario: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/usuario/${idUsuario}`, { headers: this.getAuthHeaders() }).pipe(
      catchError(error => {
        // Loguea el error para depuración
        console.error('Error al obtener asignaciones de usuario:', error);
        // Devuelve array vacío si hay error para no romper el flujo
        return new Observable<any[]>(observer => {
          observer.next([]);
          observer.complete();
        });
      })
    );
  }

  descargarConstanciaPDF(idAsignacion: number): Observable<Blob | null> {
    return this.http.get(`${this.apiUrl}/${idAsignacion}/pdf`, {
      headers: this.getAuthHeaders(),
      responseType: 'blob'
    }).pipe(
      catchError(error => {
        // Loguea el error para depuración
        console.error('Error al descargar constancia PDF:', error);
        // Devuelve null si hay error
        return new Observable<Blob | null>(observer => {
          observer.next(null);
          observer.complete();
        });
      })
    );
  }
}
