import { Component, EventEmitter, Output } from '@angular/core';
import { SolicitudService } from '../services/solicitud.service';
import { CommonModule } from '@angular/common';
import { SolicitudFormComponent } from '../solicitud-form/solicitud-form.component';
import { SubirDocumentosComponent } from '../subir-documentos/subir-documentos.component';
import { DocumentoService } from '../services/documento.service';
import { Router } from '@angular/router';
import { TimelineAlumnoComponent } from '../timeline-alumno/timeline-alumno.component';
import { SubirPagoComponent } from '../subir-pago/subir-pago.component';
import { AsignacionService } from '../services/asignacion.service';
import { PagoService } from '../services/pago.service';

@Component({
  selector: 'app-estado-solicitud',
  standalone: true,
  imports: [CommonModule, SolicitudFormComponent, SubirDocumentosComponent, TimelineAlumnoComponent, SubirPagoComponent],
  templateUrl: './estado-solicitud.component.html',
  styleUrls: ['./estado-solicitud.component.css']
})
export class EstadoSolicitudComponent {
  @Output() logout = new EventEmitter<void>();
  solicitud: any = null;
  loading = true;
  error: string | null = null;
  mostrarFormulario = false;
  mostrarSubirDocs = false;
  mostrarSubirPago = false;
  idSolicitudCreada: number | null = null;
  documentos: any[] = [];
  casilleroAsignado: any = null; // Placeholder for future locker assignment
  asignacion: any = null;
  pdfUrl: string | null = null;
  pago: any = null;

  pasoActual: string = 'solicitud';

  constructor(
    private solicitudService: SolicitudService,
    private documentoService: DocumentoService,
    private asignacionService: AsignacionService,
    private pagoService: PagoService,
    private router: Router
  ) {}

  get color(): string {
    if (!this.solicitud) return '';
    switch(this.solicitud.estado) {
      case 'aprobada': return 'text-success';
      case 'rechazada': return 'text-error';
      default: return 'text-warning';
    }
  }

  get token(): string {
    return sessionStorage.getItem('token') || '';
  }

  // Nuevo: helper para saber si el alumno puede crear una nueva solicitud
  get puedeCrearNuevaSolicitud(): boolean {
    return !this.solicitud || this.solicitud.estado === 'rechazada';
  }

  // Nuevo: helper para saber si puede subir documentos
  get puedeSubirDocumentos(): boolean {
    return !!this.solicitud && this.solicitud.estado === 'pendiente' && this.documentos.length < 2;
  }

  // Nuevo: helper para saber si puede subir pago
  get puedeSubirPago(): boolean {
    // Solo permitir subir pago si:
    // - Hay solicitud aprobada
    // - NO hay pago validado como pagado
    if (!this.solicitud || this.solicitud.estado !== 'aprobada') return false;
    if (!this.pago) return true;
    // Si el pago ya está validado como pagado, no permitir subir más
    return !(this.pago.estado_pago === 'pagado' && this.pago.validado_por_coordinador);
  }

  // Nuevo: helper para saber si puede ver casillero
  get puedeVerCasillero(): boolean {
    return !!this.casilleroAsignado;
  }

  // Nuevo: helper para saber si la solicitud fue rechazada
  get solicitudRechazada(): boolean {
    return !!this.solicitud && this.solicitud.estado === 'rechazada';
  }

  handlePasoSolicitud(): void {
    // Si ya hay solicitud pendiente o aprobada, no mostrar el formulario
    if (this.solicitud && (this.solicitud.estado === 'pendiente' || this.solicitud.estado === 'aprobada')) {
      this.pasoActual = 'solicitud';
      this.mostrarFormulario = false;
      this.mostrarSubirDocs = false;
      this.mostrarSubirPago = false;
      return;
    }
    this.pasoActual = 'solicitud';
    this.mostrarFormulario = true;
    this.mostrarSubirDocs = false;
    this.mostrarSubirPago = false;
  }

  handleSolicitudCreada(id_solicitud: number): void {
    this.idSolicitudCreada = id_solicitud;
    this.pasoActual = 'documentos';
    this.mostrarFormulario = false;
    this.mostrarSubirDocs = true;
  }

  handleDocsSubidos(): void {
    this.mostrarSubirDocs = false;
    this.loading = true;
    this.ngOnInit(); // Refresca estado
  }

  handlePasoDocumentos(): void {
    this.pasoActual = 'documentos';
    this.mostrarSubirDocs = true;
    this.mostrarFormulario = false;
    this.mostrarSubirPago = false;
  }

  handlePasoPago(): void {
    this.pasoActual = 'pago';
    this.mostrarSubirPago = true;
    this.mostrarFormulario = false;
    this.mostrarSubirDocs = false;
  }

  onPasoSeleccionado(paso: string) {
    if (paso === 'solicitud') {
      this.handlePasoSolicitud();
    } else if (paso === 'documentos' && this.solicitud) {
      this.handlePasoDocumentos();
    } else if (paso === 'pago' && this.solicitud && this.solicitud.estado === 'aprobada') {
      this.handlePasoPago();
    } else if (paso === 'casillero') {
      this.pasoActual = 'casillero';
      this.mostrarFormulario = false;
      this.mostrarSubirDocs = false;
      this.mostrarSubirPago = false;
    }
  }

  ngOnInit() {
    this.mostrarFormulario = false;
    this.mostrarSubirDocs = false;
    this.mostrarSubirPago = false;
    this.idSolicitudCreada = null;
    this.documentos = [];
    this.error = null;
    this.loading = true;
    const usuarioRaw = sessionStorage.getItem('usuario');
    let usuario: any = null;
    try {
      usuario = usuarioRaw ? JSON.parse(usuarioRaw) : null;
    } catch (e) {
      console.error('Error al parsear usuario de sessionStorage:', e, usuarioRaw);
      usuario = null;
    }
    if (usuario && usuario.rol === 'coordinador') {
      this.loading = false;
      this.router.navigate(['/coordinador']);
      return;
    }
    if (usuario && usuario.id_usuario) {
      this.solicitudService.obtenerSolicitudesUsuario(usuario.id_usuario).subscribe({
        next: (solicitudes: any[]) => {
          if (solicitudes && solicitudes.length > 0) {
            this.solicitud = solicitudes[0];
            // Si la solicitud fue rechazada, mostrar solo el estado y motivo
            if (this.solicitud.estado === 'rechazada') {
              this.mostrarFormulario = false;
              this.mostrarSubirDocs = false;
              this.mostrarSubirPago = false;
              this.pasoActual = 'solicitud';
              this.loading = false;
              return;
            }
            // Si no está rechazada, cargar documentos, pagos, asignación normalmente
            this.documentoService.obtenerDocumentosPorSolicitud(this.solicitud.id_solicitud).subscribe({
              next: (docs: any[]) => {
                this.documentos = docs;
                if (docs.length < 2 && this.solicitud.estado === 'pendiente') {
                  this.mostrarSubirDocs = true;
                  this.idSolicitudCreada = this.solicitud.id_solicitud;
                  this.pasoActual = 'documentos';
                } else if (this.solicitud.estado === 'aprobada') {
                  this.pasoActual = 'pago';
                } else {
                  this.pasoActual = 'solicitud';
                }
                this.asignacionService.obtenerAsignacionesUsuario(usuario.id_usuario).subscribe({
                  next: (asignaciones: any[]) => {
                    console.log('Asignaciones recibidas:', asignaciones); // <-- LOG PARA DEPURAR
                    if (asignaciones && asignaciones.length > 0) {
                      const asign = asignaciones[0];
                      if (asign.casillero && asign.casillero.numero && asign.casillero.ubicacion) {
                        this.asignacion = asign;
                        this.casilleroAsignado = {
                          numero: asign.casillero.numero,
                          ubicacion: asign.casillero.ubicacion
                        };
                        this.pdfUrl = `${this.asignacionService['apiUrl']}/${asign.id_asignacion}/pdf`;
                        this.pasoActual = 'casillero';
                      } else if (asign.numero && asign.ubicacion) {
                        this.asignacion = asign;
                        this.casilleroAsignado = {
                          numero: asign.numero,
                          ubicacion: asign.ubicacion
                        };
                        this.pdfUrl = `${this.asignacionService['apiUrl']}/${asign.id_asignacion}/pdf`;
                        this.pasoActual = 'casillero';
                      } else {
                        this.asignacion = null;
                        this.casilleroAsignado = null;
                        this.pdfUrl = null;
                      }
                    } else {
                      this.asignacion = null;
                      this.casilleroAsignado = null;
                      this.pdfUrl = null;
                    }
                    this.loading = false;
                  },
                  error: (err: any) => {
                    console.error('Error al obtener asignación:', err);
                    this.error = 'Error al obtener asignación de casillero. Intenta recargar la página.';
                    this.loading = false;
                  }
                });
              },
              error: (err: any) => {
                console.error('Error al obtener documentos:', err);
                this.error = 'Error al obtener documentos de la solicitud. Intenta recargar la página.';
                this.loading = false;
              }
            });
            this.pagoService.obtenerPagoPorSolicitud(this.solicitud.id_solicitud).subscribe({
              next: (pago: any) => {
                // El backend ahora devuelve un solo objeto (el más reciente)
                this.pago = pago || null;
              },
              error: () => { this.pago = null; }
            });
          } else {
            // No hay solicitudes, permitir crear nueva
            this.solicitud = null;
            this.mostrarFormulario = true;
            this.pasoActual = 'solicitud';
            this.loading = false;
          }
        },
        error: (err: any) => {
          console.error('Error al obtener solicitud:', err);
          this.error = 'Error al obtener tu solicitud. Intenta recargar la página.';
          this.loading = false;
        }
      });
    } else {
      this.error = 'No se pudo obtener información del usuario. Por favor, vuelve a iniciar sesión.';
      this.loading = false;
    }
  }

  // Permite refrescar el estado tras la asignación
  refrescarEstado() {
    this.ngOnInit();
  }

  // Nuevo: permite navegar entre pasos para consulta, mostrando datos aunque la acción esté deshabilitada
  mostrarPaso(paso: string) {
    this.pasoActual = paso;
    this.mostrarFormulario = paso === 'solicitud' && this.puedeCrearNuevaSolicitud;
    this.mostrarSubirDocs = paso === 'documentos' && this.puedeSubirDocumentos;
    // Solo mostrar subir pago si no hay comprobante
    this.mostrarSubirPago = paso === 'pago' && this.puedeSubirPago && !this.solicitud?.comprobante_pago;
    // Si el paso es casillero, solo mostrar datos
    if (paso === 'casillero') {
      this.mostrarFormulario = false;
      this.mostrarSubirDocs = false;
      this.mostrarSubirPago = false;
    }
  }

  // Métodos para outputs de los componentes hijos
  onSolicitudCreada(event: any) {
    // Refresca el estado tras crear solicitud
    this.refrescarEstado();
  }

  onDocumentosActualizados(event: any) {
    // Refresca los documentos tras subir
    this.refrescarEstado();
  }

  onPagoSubido(event: any) {
    // Refresca el estado tras subir pago y fuerza mostrar el comprobante
    this.refrescarEstado();
    this.mostrarSubirPago = false;
    // Mostrar mensaje de éxito visual
    this.error = null;
    setTimeout(() => {
      if (this.solicitud?.comprobante_pago) {
        this.pasoActual = 'pago';
      }
    }, 500);
  }

  // Nuevo: método para mostrar mensaje de éxito tras validación/rechazo
  mostrarMensajePago(msg: string) {
    this.error = null;
    setTimeout(() => {
      this.error = msg;
      setTimeout(() => { this.error = null; }, 2500);
    }, 100);
  }
}