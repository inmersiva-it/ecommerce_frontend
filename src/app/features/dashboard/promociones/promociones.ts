import { Component, OnInit, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService, PromocionDTO } from '../../../core/services/admin.service';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-promociones',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmDialogComponent],
  templateUrl: './promociones.html',
  styleUrls: ['./promociones.css']
})
export class PromocionesComponent implements OnInit {
  promociones: PromocionDTO[] = [];
  filteredPromociones: PromocionDTO[] = [];
  isLoading = true;
  showForm = false;
  isFilterInputFocused = false;

  newPromocion: PromocionDTO = {
    codigo: '',
    porcentajeDescuento: 10,
    fechaVencimiento: '',
    activo: true
  };

  isConfirmOpen = false;
  promoIdToDelete: number | null = null;

  // Dynamic columns
  columns: { key: string; label: string; filter: string; showFilter: boolean; noFilter?: boolean; noDrag?: boolean; }[] = [
    { key: 'codigo', label: 'Código', filter: '', showFilter: false },
    { key: 'porcentajeDescuento', label: 'Descuento', filter: '', showFilter: false },
    { key: 'fechaVencimiento', label: 'Vencimiento', filter: '', showFilter: false },
    { key: 'activo', label: 'Estado', filter: '', showFilter: false },
    { key: 'acciones', label: 'Acciones', filter: '', showFilter: false, noFilter: true }
  ];

  // Drag and Drop state
  draggedColumnIndex: number | null = null;
  dragOverIndex: number | null = null;

  constructor(
    private adminService: AdminService,
    private notificationService: NotificationService,
    private elementRef: ElementRef
  ) {}

  ngOnInit(): void {
    this.cargarPromociones();
  }

  cargarPromociones() {
    this.isLoading = true;
    this.adminService.getPromociones().subscribe({
      next: (data) => {
        this.promociones = data;
        this.applyFilter();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error cargando promociones', err);
        this.notificationService.showError('Error al cargar las promociones');
        this.isLoading = false;
      }
    });
  }

  applyFilter(): void {
    this.filteredPromociones = this.promociones.filter(promo => {
      return this.columns.every(col => {
        if (!col.filter || col.noFilter) return true;
        let value = '';
        if (col.key === 'activo') {
          value = promo.activo ? 'activo' : 'inactivo';
        } else if (col.key === 'porcentajeDescuento') {
          value = promo.porcentajeDescuento?.toString() || '';
        } else {
          value = this.getNestedValue(promo, col.key)?.toString() || '';
        }
        return value.toLowerCase().includes(col.filter.toLowerCase());
      });
    });
  }

  getNestedValue(obj: any, key: string): any {
    return obj[key];
  }

  toggleFilter(column: any): void {
    column.showFilter = !column.showFilter;
    if (column.showFilter) {
      this.columns.forEach(col => {
        if (col !== column) {
          col.showFilter = false;
        }
      });
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const isHeaderClick = target.closest('.header-content');
    if (!isHeaderClick) {
      this.columns.forEach(col => col.showFilter = false);
    }
  }

  clearAllFilters(): void {
    this.columns.forEach(col => {
      col.filter = '';
      col.showFilter = false;
    });
    this.applyFilter();
  }

  hasActiveFilters(): boolean {
    return this.columns.some(col => col.filter);
  }

  // Drag and Drop Handlers
  onDragStart(index: number): void {
    if (this.columns[index].noDrag || this.isFilterInputFocused) return;
    this.draggedColumnIndex = index;
  }

  onDragOver(event: DragEvent, index: number): void {
    event.preventDefault();
    if (this.columns[index].noDrag) return;
    this.dragOverIndex = index;
  }

  onDragEnd(): void {
    this.draggedColumnIndex = null;
    this.dragOverIndex = null;
  }

  onDrop(event: DragEvent, index: number): void {
    event.preventDefault();
    if (this.draggedColumnIndex === null || this.columns[index].noDrag) return;

    if (this.draggedColumnIndex !== index) {
      const movedColumn = this.columns.splice(this.draggedColumnIndex, 1)[0];
      this.columns.splice(index, 0, movedColumn);
    }

    this.draggedColumnIndex = null;
    this.dragOverIndex = null;
  }

  guardarPromocion() {
    if (!this.newPromocion.codigo || !this.newPromocion.fechaVencimiento) {
      this.notificationService.showError('Por favor complete todos los campos');
      return;
    }
    this.adminService.crearPromocion(this.newPromocion).subscribe({
      next: () => {
        this.cargarPromociones();
        this.showForm = false;
        this.newPromocion = { codigo: '', porcentajeDescuento: 10, fechaVencimiento: '', activo: true };
        this.notificationService.showSuccess('Cupón de descuento creado exitosamente');
      },
      error: (err) => {
        const msg = typeof err.error === 'string' ? err.error : 'Error al crear el cupón';
        this.notificationService.showError(msg);
      }
    });
  }

  toggleEstado(id: number) {
    this.adminService.togglePromocionEstado(id).subscribe({
      next: () => {
        this.cargarPromociones();
        this.notificationService.showSuccess('Estado de cupón cambiado correctamente');
      },
      error: (err) => {
        console.error('Error al cambiar estado', err);
        this.notificationService.showError('Error al cambiar el estado del cupón');
      }
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
          this.notificationService.showSuccess('Cupón de descuento eliminado correctamente');
        },
        error: (err) => {
          console.error('Error al eliminar', err);
          this.notificationService.showError('Error al eliminar el cupón de descuento');
          this.isConfirmOpen = false;
        }
      });
    }
  }
}
