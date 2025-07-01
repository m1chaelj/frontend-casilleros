import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SolicitudService {
  private apiUrl = `${environment.apiUrl}/solicitudes`;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

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

  obtenerSolicitudes(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl, { headers: this.getAuthHeaders() }).pipe(
      catchError(error => throwError(() => new Error('Error al obtener solicitudes')))
    );
  }

  obtenerSolicitudesUsuario(idUsuario: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/usuario/${idUsuario}`, { headers: this.getAuthHeaders() }).pipe(
      catchError(error => throwError(() => new Error('Error al obtener solicitudes del usuario')))
    );
  }

  crearSolicitud(solicitudData: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, solicitudData, { headers: this.getAuthHeaders() }).pipe(
      catchError(error => throwError(() => new Error(error.error?.error || 'Error al crear solicitud')))
    );
  }

  actualizarEstadoSolicitud(idSolicitud: number, estado: string, motivoRechazo?: string): Observable<any> {
    return this.http.put<any>(
      `${this.apiUrl}/${idSolicitud}/estado`, 
      { estado, motivo_rechazo: motivoRechazo }, 
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(error => throwError(() => new Error('Error al actualizar estado de solicitud')))
    );
  }

  eliminarSolicitud(idSolicitud: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${idSolicitud}`, { headers: this.getAuthHeaders() }).pipe(
      catchError(error => throwError(() => new Error('Error al eliminar solicitud')))
    );
  }
}