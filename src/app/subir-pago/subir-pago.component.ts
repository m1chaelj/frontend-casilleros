import { Component, EventEmitter, Input, Output } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { environment } from '../environments/environment';


@Component({
  selector: 'app-subir-pago',
  templateUrl: './subir-pago.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styleUrls: ['./subir-pago.component.css']
})
export class SubirPagoComponent {
  @Input() idSolicitud!: number;
  @Input() token!: string;
  @Input() disabled: boolean = false;
  @Output() pagoSubido = new EventEmitter<void>();

  comprobante: File | null = null;
  error = '';
  success = false;
  loading = false;

  constructor(private http: HttpClient) {} // Funcionará correctamente
  onFileChange(event: Event) {
    const target = event.target as HTMLInputElement;
    this.comprobante = target.files?.[0] || null;
  }

  async onSubmit() {
    if (this.disabled) return;

    this.error = '';
    this.success = false;
    this.loading = true;

    try {
      if (!this.comprobante) throw new Error('Selecciona un archivo');
      if (!this.idSolicitud) throw new Error('No se encontró id_solicitud');

      // Validar tipo de archivo: solo PDF
      const allowedTypes = ['application/pdf'];
      if (!allowedTypes.includes(this.comprobante.type)) {
        throw new Error('Solo se permite subir archivos PDF como comprobante de pago.');
      }

      const formData = new FormData();
      formData.append('comprobante', this.comprobante);
      formData.append('id_solicitud', this.idSolicitud.toString());

      const headers = this.token ? new HttpHeaders({ Authorization: `Bearer ${this.token}` }) : new HttpHeaders();

      const response = await this.http.post<any>(
        `${environment.apiUrl}/pagos`,
        formData,
        { headers, observe: 'response' }
      ).toPromise();

      if (response && response.status === 201) {
        this.success = true;
        this.pagoSubido.emit();
      } else {
        throw new Error('Error inesperado al subir comprobante de pago.');
      }
    } catch (err: any) {
      if (err.status === 403) {
        this.error = 'No tienes permiso para subir el comprobante. Verifica que tu solicitud esté aprobada y seas el dueño.';
      } else if (err.status === 401) {
        this.error = 'Sesión expirada o token inválido. Vuelve a iniciar sesión.';
      } else if (err.status === 400) {
        this.error = err.error?.error || 'Datos inválidos.';
      } else {
        this.error = err?.message || 'Error al subir comprobante de pago';
      }
    }
    this.loading = false;
  }
}
