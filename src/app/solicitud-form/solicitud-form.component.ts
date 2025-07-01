import { Component, Input, Output, EventEmitter } from '@angular/core';
import { SolicitudService } from '../services/solicitud.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-solicitud-form',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './solicitud-form.component.html',
  styleUrls: ['./solicitud-form.component.css']
})
export class SolicitudFormComponent {
  @Input() disabled: boolean = false;
  @Output() solicitudCreada = new EventEmitter<number>();
  solicitud = {
    id_usuario: 0,
    numero_boleta: '',
    nombre_completo: '',
    semestre_actual: '',
    correo_personal: '',
    numero_celular: ''
  };
  error: string | null = null;
  success = false;
  loading = false;

  constructor(private solicitudService: SolicitudService) {
    // Usar sessionStorage en vez de localStorage para obtener el usuario
    const usuario = JSON.parse(sessionStorage.getItem('usuario') || '{}');
    this.solicitud.id_usuario = usuario.id_usuario || 0;
  }

  onSubmit(event: Event): void {
    if (this.disabled) return;
    event.preventDefault();
    this.loading = true;
    this.error = null;
    this.success = false;

    this.solicitudService.crearSolicitud(this.solicitud).subscribe({
      next: (resp: any) => {
        this.success = true;
        this.loading = false;
        if (resp && resp.id_solicitud) {
          this.solicitudCreada.emit(resp.id_solicitud);
        }
      },
      error: (err: any) => {
        // Mostrar mensaje de error más claro si ya existe una solicitud
        if (err.message && err.message.includes('ya existe')) {
          this.error = 'Ya existe una solicitud pendiente o aprobada para este usuario. No puedes crear otra hasta que la actual sea rechazada o completada.';
        } else {
          this.error = err.message || 'Error al crear solicitud';
        }
        this.loading = false;
      }
    });
  }

  onFileChange(event: Event, tipo: string): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      console.log(`Archivo de ${tipo} seleccionado:`, input.files[0].name);
    }
  }
}