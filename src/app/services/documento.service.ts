import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../environments/environment';

@Injectable({ providedIn: 'root' })
export class DocumentoService {
  private apiUrl = `${environment.apiUrl}/documentos`;

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

  obtenerDocumentosPorSolicitud(idSolicitud: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/solicitud/${idSolicitud}`, { headers: this.getAuthHeaders() }).pipe(
      catchError(error => {
        console.error('Error al obtener documentos de la solicitud:', error);
        // Devuelve array vacío si hay error para no romper el flujo
        return new Observable<any[]>(observer => {
          observer.next([]);
          observer.complete();
        });
      })
    );
  }
}
