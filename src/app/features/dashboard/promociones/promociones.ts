import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService, PromocionDTO } from '../../../core/services/admin.service';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-promociones',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmDialogComponent],
  templateUrl: './promociones.html',
  styleUrls: ['./promociones.css']
})
export class PromocionesComponent implements OnInit {
  promociones: PromocionDTO[] = [];
  isLoading = true;
  showForm = false;

  newPromocion: PromocionDTO = {
    codigo: '',
    porcentajeDescuento: 10,
    fechaVencimiento: '',
    activo: true
  };

  isConfirmOpen = false;
  promoIdToDelete: number | null = null;

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.cargarPromociones();
  }

  cargarPromociones() {
    this.isLoading = true;
    this.adminService.getPromociones().subscribe({
      next: (data) => {
        this.promociones = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error cargando promociones', err);
        this.isLoading = false;
      }
    });
  }

  guardarPromocion() {
    if (!this.newPromocion.codigo || !this.newPromocion.fechaVencimiento) return;
    this.adminService.crearPromocion(this.newPromocion).subscribe({
      next: () => {
        this.cargarPromociones();
        this.showForm = false;
        this.newPromocion = { codigo: '', porcentajeDescuento: 10, fechaVencimiento: '', activo: true };
      },
      error: (err) => {
        alert(typeof err.error === 'string' ? err.error : 'Error al crear el cupón');
      }
    });
  }

  toggleEstado(id: number) {
    this.adminService.togglePromocionEstado(id).subscribe({
      next: () => this.cargarPromociones(),
      error: (err) => console.error('Error al cambiar estado', err)
    });
  }

  openDeleteConfirmation(id: number) {
    this.promoIdToDelete = id;
    this.isConfirmOpen = true;
  }

  confirmDelete() {
    if (this.promoIdToDelete !== null) {
      this.adminService.eliminarPromocion(this.promoIdToDelete).subscribe({
        next: () => {
          this.cargarPromociones();
          this.isConfirmOpen = false;
          this.promoIdToDelete = null;
        },
        error: (err) => {
          console.error('Error al eliminar', err);
          this.isConfirmOpen = false;
        }
      });
    }
  }
}
