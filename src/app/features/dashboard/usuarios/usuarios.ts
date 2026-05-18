import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService, UsuarioDTO } from '../../../core/services/admin.service';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, ConfirmDialogComponent],
  templateUrl: './usuarios.html',
  styleUrls: ['./usuarios.css']
})
export class UsuariosComponent implements OnInit {
  usuarios: UsuarioDTO[] = [];
  isLoading = true;
  errorMsg = '';

  // Confirm para bloquear/activar
  isConfirmToggleOpen = false;
  usuarioIdToToggle: number | null = null;
  confirmToggleMessage = '';

  // Confirm para cambiar rol
  isConfirmRolOpen = false;
  usuarioIdRol: number | null = null;
  confirmRolMessage = '';

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  cargarUsuarios() {
    this.isLoading = true;
    this.errorMsg = '';
    this.adminService.getUsuarios().subscribe({
      next: (data) => {
        this.usuarios = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error cargando usuarios', err);
        this.isLoading = false;
      }
    });
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
        },
        error: (err) => {
          this.errorMsg = typeof err.error === 'string' ? err.error : 'Error al cambiar estado';
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
        },
        error: (err) => {
          this.errorMsg = typeof err.error === 'string' ? err.error : 'Error al cambiar rol';
          this.isConfirmRolOpen = false;
          this.usuarioIdRol = null;
        }
      });
    }
  }
}
