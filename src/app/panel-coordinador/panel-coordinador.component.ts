import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { SolicitudService } from '../services/solicitud.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { isPlatformBrowser } from '@angular/common';
import { DocumentoService } from '../services/documento.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-panel-coordinador',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './panel-coordinador.component.html',
  styleUrls: ['./panel-coordinador.component.css']
})
export class PanelCoordinadorComponent implements OnInit {
  solicitudes: any[] = [];
  loading = true;
  error: string | null = null;
  filtroEstado: string = 'todos';
  estados: { [id: number]: string } = {};
  motivos: { [id: number]: string } = {};
  documentos: { [id: number]: any[] } = {};
  pagos: { [id: number]: any[] } = {};
  solicitudSeleccionada: any = null;
  casilleros: any[] = [];
  todosCasilleros: any[] = [];
  nuevoNumero = '';
  nuevaUbicacion = '';
  creando = false;
  asignando: { [idSolicitud: number]: boolean } = {};
  casilleroAsignado: any = null;
  token = '';
  casilleroASeleccionar: { [idSolicitud: number]: number | null } = {};
  rechazoPagoId: number | null = null;
  motivoRechazoPago: string = '';
  casillerosAsignados: { [id: number]: any } = {};
  loadingAsignaciones: boolean = false;

  constructor(
    private solicitudService: SolicitudService,
    private documentoService: DocumentoService,
    private authService: AuthService,
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.token = sessionStorage.getItem('token') || '';
      this.cargarSolicitudes();
      this.cargarTodosCasilleros();
      this.cargarTodasAsignaciones();
    }
  }

  cargarSolicitudes(): void {
    this.loading = true;
    this.error = null;
    this.solicitudService.obtenerSolicitudes().subscribe({
      next: (solicitudes: any[]) => {
        this.solicitudes = solicitudes;
        solicitudes.forEach(s => {
          this.estados[s.id_solicitud] = s.estado;
          this.motivos[s.id_solicitud] = s.motivo_rechazo || '';
          this.cargarDocumentos(s.id_solicitud);
          this.cargarPagos(s.id_solicitud);
          // Buscar el pago aprobado para la solicitud
          const pagos = this.pagos[s.id_solicitud] || [];
          const pagoAprobado = pagos.find((p: any) => p.estado_pago === 'pagado' && p.validado_por_coordinador);
          if (pagoAprobado) {
            this.cargarCasilleroAsignado(s.id_solicitud, pagoAprobado.id_pago);
          } else {
            this.casillerosAsignados[s.id_solicitud] = null;
          }
        });
        // Si hay una solicitud seleccionada, actualizarla con la versión más reciente
        if (this.solicitudSeleccionada) {
          const actualizada = solicitudes.find(s => s.id_solicitud === this.solicitudSeleccionada.id_solicitud);
          if (actualizada) {
            this.solicitudSeleccionada = actualizada;
          }
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = err.message;
        this.loading = false;
        if (err.status === 401) {
          this.authService.logout();
        }
      }
    });
  }

  cargarDocumentos(idSolicitud: number): void {
    this.documentoService.obtenerDocumentosPorSolicitud(idSolicitud).subscribe({
      next: (docs) => {
        this.documentos[idSolicitud] = docs;
      },
      error: () => {
        this.documentos[idSolicitud] = [];
      }
    });
  }

  cargarPagos(idSolicitud: number): void {
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${this.token}` });
    // Usar endpoint que devuelve TODOS los pagos
    this.http.get<any[]>(`${environment.apiUrl}/pagos/solicitud/${idSolicitud}/todos`, { headers }).subscribe({
      next: (pagos) => {
        this.pagos[idSolicitud] = pagos;
        // Buscar el pago aprobado y cargar casillero asignado
        const pagoAprobado = pagos.find((p: any) => p.estado_pago === 'pagado' && p.validado_por_coordinador);
        if (pagoAprobado) {
          this.cargarCasilleroAsignado(idSolicitud, pagoAprobado.id_pago);
        } else {
          this.casillerosAsignados[idSolicitud] = null;
        }
      },
      error: () => {
        this.pagos[idSolicitud] = [];
        this.casillerosAsignados[idSolicitud] = null;
      }
    });
  }

  cargarTodosCasilleros(): void {
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${this.token}` });
    this.http.get<any[]>(`${environment.apiUrl}/casilleros`, { headers }).subscribe({
      next: (casilleros) => {
        this.todosCasilleros = casilleros;
      }
    });
  }

  seleccionarSolicitud(solicitud: any): void {
    this.solicitudSeleccionada = solicitud;
    this.cargarDocumentos(solicitud.id_solicitud);
    this.cargarPagos(solicitud.id_solicitud);
    this.cargarCasillerosDisponibles();
    // Buscar el pago aprobado para la solicitud seleccionada
    const pagos = this.pagos[solicitud.id_solicitud] || [];
    const pagoAprobado = pagos.find((p: any) => p.estado_pago === 'pagado' && p.validado_por_coordinador);
    if (pagoAprobado) {
      this.cargarCasilleroAsignado(solicitud.id_solicitud, pagoAprobado.id_pago);
    } else {
      this.casillerosAsignados[solicitud.id_solicitud] = null;
    }
  }

  cargarCasillerosDisponibles(): void {
    this.http.get<any[]>(`${environment.apiUrl}/casilleros/disponibles`).subscribe({
      next: (casilleros) => {
        this.casilleros = casilleros;
      }
    });
  }

  cargarCasilleroAsignado(idSolicitud: number, idPago: number): void {
    if (!idPago) {
      this.casillerosAsignados[idSolicitud] = null;
      return;
    }
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${this.token}` });
    this.http.get<any[]>(`${environment.apiUrl}/asignaciones/pago/${idPago}`, { headers }).subscribe({
      next: (asignaciones) => {
        if (asignaciones && asignaciones.length > 0) {
          const asign = asignaciones[0];
          this.casillerosAsignados[idSolicitud] = {
            numero: asign.numero,
            ubicacion: asign.ubicacion
          };
        } else {
          this.casillerosAsignados[idSolicitud] = null;
        }
      },
      error: () => {
        this.casillerosAsignados[idSolicitud] = null;
      }
    });
  }

  cargarTodasAsignaciones(): void {
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${this.token}` });
    this.http.get<any[]>(`${environment.apiUrl}/asignaciones`, { headers }).subscribe({
      next: (asignaciones) => {
        // Mapear por id_solicitud
        asignaciones.forEach((asign: any) => {
          if (asign.id_solicitud) {
            this.casillerosAsignados[asign.id_solicitud] = {
              numero: asign.numero,
              ubicacion: asign.ubicacion
            };
          }
        });
      },
      error: () => {}
    });
  }

  get solicitudesFiltradas(): any[] {
    if (this.filtroEstado === 'todos') return this.solicitudes;
    return this.solicitudes.filter(s => s.estado === this.filtroEstado);
  }

  actualizarEstado(solicitud: any): void {
    this.loading = true;
    const estado = this.estados[solicitud.id_solicitud];
    const motivo = estado === 'rechazada' ? this.motivos[solicitud.id_solicitud] : undefined;
    this.solicitudService.actualizarEstadoSolicitud(
      solicitud.id_solicitud,
      estado,
      motivo
    ).subscribe({
      next: (updated) => {
        const index = this.solicitudes.findIndex(s => s.id_solicitud === solicitud.id_solicitud);
        if (index !== -1) this.solicitudes[index] = updated;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.message;
        this.loading = false;
      }
    });
  }

  eliminarSolicitud(id: number): void {
    if (confirm('¿Eliminar solicitud?')) {
      this.loading = true;
      this.solicitudService.eliminarSolicitud(id).subscribe({
        next: () => {
          this.solicitudes = this.solicitudes.filter(s => s.id_solicitud !== id);
          this.loading = false;
        },
        error: (err) => {
          this.error = err.message;
          this.loading = false;
        }
      });
    }
  }

  get hayPagoAprobado(): boolean {
    if (!this.solicitudSeleccionada) return false;
    const pagos = this.pagos[this.solicitudSeleccionada.id_solicitud] || [];
    return pagos.some((p: any) => p.estado_pago === 'pagado' && p.validado_por_coordinador);
  }

  tienePagoAprobado(solicitudId: number): boolean {
    const pagos = this.pagos[solicitudId] || [];
    return pagos.some((p: any) => p.estado_pago === 'pagado' && p.validado_por_coordinador);
  }

  aprobarPago(pago: any): void {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': `Bearer ${this.token}` });
    this.http.put(`${environment.apiUrl}/pagos/${pago.id_pago}/validar`, { validado: true, estado_pago: 'pagado' }, { headers }).subscribe({
      next: () => {
        this.cargarPagos(this.solicitudSeleccionada.id_solicitud);
      },
      error: (err) => {
        this.error = err.message;
      }
    });
  }

  rechazarPago(pago: any): void {
    this.rechazoPagoId = pago.id_pago;
    this.motivoRechazoPago = '';
  }

  confirmarRechazoPago(): void {
    if (!this.rechazoPagoId) return;
    const headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': `Bearer ${this.token}` });
    this.http.put(`${environment.apiUrl}/pagos/${this.rechazoPagoId}/validar`, { validado: false, estado_pago: 'no pagado', motivo_rechazo: this.motivoRechazoPago }, { headers }).subscribe({
      next: () => {
        this.cargarPagos(this.solicitudSeleccionada.id_solicitud);
        this.rechazoPagoId = null;
        this.motivoRechazoPago = '';
      },
      error: (err) => {
        this.error = err.message;
        this.rechazoPagoId = null;
        this.motivoRechazoPago = '';
      }
    });
  }

  cancelarRechazoPago(): void {
    this.rechazoPagoId = null;
    this.motivoRechazoPago = '';
  }

  asignarCasillero(idSolicitud: number): void {
    if (!this.casilleroASeleccionar[idSolicitud]) return;
    this.asignando[idSolicitud] = true;
    // Buscar el pago aprobado
    const pagos = this.pagos[idSolicitud] || [];
    const pagoAprobado = pagos.find((p: any) => p.estado_pago === 'pagado' && p.validado_por_coordinador);
    if (!pagoAprobado) {
      this.error = 'No hay pago aprobado.';
      this.asignando[idSolicitud] = false;
      return;
    }
    const headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': `Bearer ${this.token}` });
    this.http.post(`${environment.apiUrl}/asignaciones`, { id_pago: pagoAprobado.id_pago, id_casillero: this.casilleroASeleccionar[idSolicitud] }, { headers }).subscribe({
      next: (asignacion: any) => {
        // Refrescar casilleros asignados ANTES de permitir mostrar el formulario de nuevo
        this.cargarTodasAsignaciones();
        this.casillerosAsignados[idSolicitud] = {
          numero: asignacion.numero,
          ubicacion: asignacion.ubicacion
        };
        // Refrescar casilleros disponibles y todas las asignaciones
        this.cargarCasillerosDisponibles();
        // Refrescar pagos y solicitudes para actualizar la UI
        this.cargarPagos(idSolicitud);
        this.cargarSolicitudes();
        this.asignando[idSolicitud] = false;
      },
      error: (err) => {
        this.error = err.message;
        this.asignando[idSolicitud] = false;
      }
    });
  }

  crearCasillero(): void {
    if (!this.nuevoNumero || !this.nuevaUbicacion) return;
    this.creando = true;
    const headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': `Bearer ${this.token}` });
    this.http.post(`${environment.apiUrl}/casilleros`, { numero: this.nuevoNumero, ubicacion: this.nuevaUbicacion }, { headers }).subscribe({
      next: () => {
        this.nuevoNumero = '';
        this.nuevaUbicacion = '';
        this.cargarTodosCasilleros();
        this.cargarCasillerosDisponibles();
        this.creando = false;
      },
      error: (err) => {
        this.error = err.message;
        this.creando = false;
      }
    });
  }

  eliminarCasillero(c: any): void {
    if (!c.disponible) return;
    if (!confirm('¿Seguro que deseas eliminar este casillero?')) return;
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${this.token}` });
    this.http.delete(`${environment.apiUrl}/casilleros/${c.id_casillero}`, { headers }).subscribe({
      next: () => {
        this.cargarTodosCasilleros();
        this.cargarCasillerosDisponibles();
      },
      error: (err) => {
        this.error = err.message;
      }
    });
  }

  marcarComoPagado(pago: any): void {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': `Bearer ${this.token}` });
    this.http.put(`${environment.apiUrl}/pagos/${pago.id_pago}/validar`, { validado: true, estado_pago: 'pagado', motivo_rechazo: null }, { headers }).subscribe({
      next: () => {
        this.cargarPagos(pago.id_solicitud);
      },
      error: (err) => {
        this.error = err.message;
      }
    });
  }

  // Métodos para aprobar/rechazar pagos, asignar casillero, crear/eliminar casillero, etc. pueden agregarse aquí
}