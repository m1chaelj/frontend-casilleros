import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-timeline-alumno',
  standalone: true,
  templateUrl: './timeline-alumno.component.html',
  styleUrls: ['./timeline-alumno.component.css'],
  imports: [CommonModule, FormsModule]
})
export class TimelineAlumnoComponent {
  @Input() pasoActual: string = '';
  @Input() estadoProceso: any;
  @Output() pasoSeleccionado = new EventEmitter<string>();

  @Input() solicitud: any;
  @Input() documentos: any[] = [];
  @Input() casilleroAsignado: any;
  @Input() pdfUrl: string | null = null;

  pasos = [
    { key: 'solicitud', label: 'Solicitud' },
    { key: 'documentos', label: 'Documentos' },
    { key: 'pago', label: 'Pago' },
    { key: 'casillero', label: 'Casillero' }
  ];

  isHabilitado(key: string): boolean {
    if (key === 'solicitud') {
      // Solo habilitar si NO hay solicitud pendiente ni aprobada
      return !this.estadoProceso?.solicitud || this.estadoProceso.solicitud.estado === 'rechazada';
    }
    if (key === 'documentos') return this.estadoProceso?.solicitud && this.estadoProceso.solicitud.estado !== 'pendiente';
    if (key === 'pago') return this.estadoProceso?.solicitud && this.estadoProceso.solicitud.estado === 'aprobada';
    if (key === 'casillero') return this.estadoProceso?.casilleroAsignado;
    return false;
  }

  // Permitir seleccionar cualquier paso para consulta, no solo los habilitados
  seleccionarPaso(key: string) {
    this.pasoSeleccionado.emit(key);
  }
}
