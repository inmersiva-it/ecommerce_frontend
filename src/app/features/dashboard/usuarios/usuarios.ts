import { Component, OnInit, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService, UsuarioDTO } from '../../../core/services/admin.service';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmDialogComponent],
  templateUrl: './usuarios.html',
  styleUrls: ['./usuarios.css']
})
export class UsuariosComponent implements OnInit {
  usuarios: UsuarioDTO[] = [];
  filteredUsuarios: UsuarioDTO[] = [];
  isLoading = true;
  errorMsg = '';
  isFilterInputFocused = false;

  // Confirm para bloquear/activar
  isConfirmToggleOpen = false;
  usuarioIdToToggle: number | null = null;
  confirmToggleMessage = '';

  // Confirm para cambiar rol
  isConfirmRolOpen = false;
  usuarioIdRol: number | null = null;
  confirmRolMessage = '';

  // Confirm para eliminar usuario
  isConfirmDeleteOpen = false;
  usuarioIdToDelete: number | null = null;
  confirmDeleteMessage = '';

  // Dynamic columns
  columns: { key: string; label: string; filter: string; showFilter: boolean; noFilter?: boolean; noDrag?: boolean; }[] = [
    { key: 'id', label: 'ID', filter: '', showFilter: false },
    { key: 'nombre', label: 'Usuario', filter: '', showFilter: false },
    { key: 'email', label: 'Email', filter: '', showFilter: false },
    { key: 'rol', label: 'Rol', filter: '', showFilter: false },
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
    this.cargarUsuarios();
  }

  cargarUsuarios() {
    this.isLoading = true;
    this.errorMsg = '';
    this.adminService.getUsuarios().subscribe({
      next: (data) => {
        this.usuarios = data;
        this.applyFilter();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error cargando usuarios', err);
        this.notificationService.showError('Error al cargar los usuarios');
        this.isLoading = false;
      }
    });
  }

  applyFilter(): void {
    this.filteredUsuarios = this.usuarios.filter(u => {
      return this.columns.every(col => {
        if (!col.filter || col.noFilter) return true;
        let value = '';
        if (col.key === 'activo') {
          value = u.activo ? 'activo' : 'bloqueado';
        } else {
          value = this.getNestedValue(u, col.key)?.toString().toLowerCase() || '';
        }
        return value.includes(col.filter.toLowerCase());
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

  // --- Bloquear / Activar ---
  openToggleConfirmation(usuario: UsuarioDTO) {
    this.usuarioIdToToggle = usuario.id;
    this.confirmToggleMessage = usuario.activo
      ? `¿Deseas bloquear a ${usuario.nombre}? No podrá iniciar sesión hasta que se active nuevamente.`
      : `¿Deseas activar a ${usuario.nombre}? Podrá iniciar sesión nuevamente.`;
    this.isConfirmToggleOpen = true;
  }

  confirmToggle() {
    if (this.usuarioIdToToggle !== null) {
      this.adminService.toggleUsuarioEstado(this.usuarioIdToToggle).subscribe({
        next: () => {
          this.cargarUsuarios();
          this.isConfirmToggleOpen = false;
          this.usuarioIdToToggle = null;
          this.errorMsg = '';
          this.notificationService.showSuccess('Estado de usuario actualizado correctamente');
        },
        error: (err) => {
          this.errorMsg = typeof err.error === 'string' ? err.error : (err.error?.error || 'Error al cambiar estado');
          this.notificationService.showError(this.errorMsg);
          this.isConfirmToggleOpen = false;
          this.usuarioIdToToggle = null;
        }
      });
    }
  }

  // --- Cambiar Rol ---
  openRolConfirmation(usuario: UsuarioDTO) {
    this.usuarioIdRol = usuario.id;
    const nuevoRol = usuario.rol === 'Administrador' ? 'Cliente' : 'Administrador';
    this.confirmRolMessage = `¿Estás seguro de cambiar el rol de ${usuario.nombre} de ${usuario.rol} a ${nuevoRol}? Esto cambiará sus permisos en el sistema.`;
    this.isConfirmRolOpen = true;
  }

  confirmCambioRol() {
    if (this.usuarioIdRol !== null) {
      this.adminService.cambiarRolUsuario(this.usuarioIdRol).subscribe({
        next: () => {
          this.cargarUsuarios();
          this.isConfirmRolOpen = false;
          this.usuarioIdRol = null;
          this.errorMsg = '';
          this.notificationService.showSuccess('Rol de usuario actualizado correctamente');
        },
        error: (err) => {
          this.errorMsg = typeof err.error === 'string' ? err.error : (err.error?.error || 'Error al cambiar rol');
          this.notificationService.showError(this.errorMsg);
          this.isConfirmRolOpen = false;
          this.usuarioIdRol = null;
        }
      });
    }
  }

  // --- Eliminar Usuario ---
  openDeleteConfirmation(usuario: UsuarioDTO) {
    this.usuarioIdToDelete = usuario.id;
    this.confirmDeleteMessage = `¿Estás completamente seguro de que deseas eliminar permanentemente al usuario ${usuario.nombre}? Esta acción eliminará su cuenta y todo su historial de compras, pedidos y reseñas de forma definitiva. Esta acción no se puede deshacer.`;
    this.isConfirmDeleteOpen = true;
  }

  confirmDelete() {
    if (this.usuarioIdToDelete !== null) {
      this.adminService.eliminarUsuario(this.usuarioIdToDelete).subscribe({
        next: () => {
          this.cargarUsuarios();
          this.isConfirmDeleteOpen = false;
          this.usuarioIdToDelete = null;
          this.errorMsg = '';
          this.notificationService.showSuccess('Usuario y cuenta eliminados correctamente');
        },
        error: (err) => {
          this.errorMsg = typeof err.error === 'string' ? err.error : (err.error?.error || 'Error al eliminar usuario');
          this.notificationService.showError(this.errorMsg);
          this.isConfirmDeleteOpen = false;
          this.usuarioIdToDelete = null;
        }
      });
    }
  }
}
