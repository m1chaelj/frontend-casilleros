import { Component, EventEmitter, Input, Output } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';


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

      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`
      });

      const response = await this.http.post('http://localhost:3001/pagos', formData, { headers }).toPromise();

      if (!response) throw new Error('Error al subir comprobante de pago.');

      this.success = true;
      this.pagoSubido.emit();
    } catch (err: any) {
      this.error = err?.message || 'Error al subir comprobante de pago';
    }

    this.loading = false;
  }
}
