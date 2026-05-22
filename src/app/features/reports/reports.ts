import { Component, OnInit, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PedidoService, PedidoDTO } from '../../core/services/pedido.service';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmDialogComponent],
  templateUrl: './reports.html',
  styleUrl: './reports.css',
})
export class Reports implements OnInit {
  compras: PedidoDTO[] = [];
  filteredCompras: PedidoDTO[] = [];
  isLoading = true;
  totalVendido = 0;
  isFilterInputFocused = false;

  isConfirmDeleteOpen = false;
  compraIdToDelete: number | null = null;

  // Dynamic columns
  columns: { key: string; label: string; filter: string; showFilter: boolean; noFilter?: boolean; noDrag?: boolean; }[] = [
    { key: 'id', label: 'ID', filter: '', showFilter: false },
    { key: 'fechaPedido', label: 'Fecha', filter: '', showFilter: false },
    { key: 'usuarioNombre', label: 'Cliente', filter: '', showFilter: false },
    { key: 'usuarioEmail', label: 'Email', filter: '', showFilter: false },
    { key: 'metodoPagoNombre', label: 'Método Pago', filter: '', showFilter: false },
    { key: 'estado', label: 'Estado', filter: '', showFilter: false },
    { key: 'total', label: 'Total', filter: '', showFilter: false },
    { key: 'detalles', label: 'Detalles', filter: '', showFilter: false },
    { key: 'acciones', label: 'Acciones', filter: '', showFilter: false, noFilter: true }
  ];

  // Drag and Drop state
  draggedColumnIndex: number | null = null;
  dragOverIndex: number | null = null;

  constructor(
    private pedidoService: PedidoService,
    private notificationService: NotificationService,
    private elementRef: ElementRef
  ) {}

  ngOnInit(): void {
    this.cargarCompras();
  }

  cargarCompras() {
    this.isLoading = true;
    this.pedidoService.getTodosLosPedidos().subscribe({
      next: (data) => {
        this.compras = data;
        this.totalVendido = data.reduce((acc, c) => acc + c.total, 0);
        this.applyFilter();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar reportes', err);
        this.notificationService.showError('Error al cargar los reportes de ventas');
        this.isLoading = false;
      }
    });
  }

  applyFilter(): void {
    this.filteredCompras = this.compras.filter(compra => {
      return this.columns.every(col => {
        if (!col.filter || col.noFilter) return true;
        let value = '';
        if (col.key === 'usuarioNombre') {
          value = compra.usuarioNombre || '';
        } else if (col.key === 'usuarioEmail') {
          value = compra.usuarioEmail || '';
        } else if (col.key === 'metodoPagoNombre') {
          value = compra.metodoPagoNombre || '';
        } else if (col.key === 'estado') {
          value = compra.estado || '';
        } else if (col.key === 'fechaPedido') {
          value = new Date(compra.fechaPedido).toLocaleString() || '';
        } else if (col.key === 'total') {
          value = compra.total?.toString() || '';
        } else if (col.key === 'detalles') {
          value = compra.detalles?.map(d => `${d.cantidad}x ${d.productoNombre}`).join(', ') || '';
        } else {
          value = this.getNestedValue(compra, col.key)?.toString() || '';
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

  openDeleteConfirmation(id: number) {
    this.compraIdToDelete = id;
    this.isConfirmDeleteOpen = true;
  }

  confirmDelete() {
    if (this.compraIdToDelete !== null) {
      this.pedidoService.eliminarPedido(this.compraIdToDelete).subscribe({
        next: () => {
          this.cargarCompras();
          this.isConfirmDeleteOpen = false;
          this.compraIdToDelete = null;
          this.notificationService.showSuccess('Reporte de venta eliminado correctamente');
        },
        error: (err) => {
          console.error('Error al eliminar compra/pedido', err);
          this.notificationService.showError('Error al eliminar el reporte de venta');
          this.isConfirmDeleteOpen = false;
          this.compraIdToDelete = null;
        }
      });
    }
  }
}
