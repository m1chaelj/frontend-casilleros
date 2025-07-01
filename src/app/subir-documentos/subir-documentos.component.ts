import { Component, Input, Output, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-subir-documentos',
  templateUrl: './subir-documentos.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styleUrls: ['./subir-documentos.component.css']
})
export class SubirDocumentosComponent {
  @Input() idSolicitud!: number;
  @Input() disabled: boolean = false;
  @Output() documentosActualizados = new EventEmitter<void>();

  horario: File | null = null;
  credencial: File | null = null;
  error = '';
  success = false;
  loading = false;

    constructor(private http: HttpClient) {} // Funcionará correctamente

  onFileChange(event: any, tipo: 'horario' | 'credencial') {
    const file = event.target.files[0];
    if (tipo === 'horario') this.horario = file;
    if (tipo === 'credencial') this.credencial = file;
  }

  async onSubmit() {
    if (this.disabled) return;

    this.error = '';
    this.success = false;
    this.loading = true;

    if (!this.horario || !this.credencial) {
      this.error = 'Debes seleccionar ambos archivos PDF.';
      this.loading = false;
      return;
    }

    try {
      // Subir horario
      const formHorario = new FormData();
      formHorario.append('archivo', this.horario);
      formHorario.append('id_solicitud', this.idSolicitud.toString());
      formHorario.append('tipo', 'comprobante horario');
      await this.http.post('https://backend-casilleros.onrender.com/documentos', formHorario).toPromise();

      // Subir credencial
      const formCredencial = new FormData();
      formCredencial.append('archivo', this.credencial);
      formCredencial.append('id_solicitud', this.idSolicitud.toString());
      formCredencial.append('tipo', 'credencial vigente');
      await this.http.post('https://backend-casilleros.onrender.com/documentos', formCredencial).toPromise();

      this.success = true;
      this.documentosActualizados.emit();
    } catch (err: any) {
      this.error = err?.message || 'Error al subir documentos';
    }
    this.loading = false;
  }
}
