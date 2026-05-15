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

  isConfirmOpen = false;
  usuarioIdToToggle: number | null = null;
  confirmMessage = '';

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  cargarUsuarios() {
    this.isLoading = true;
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

  openToggleConfirmation(usuario: UsuarioDTO) {
    this.usuarioIdToToggle = usuario.id;
    this.confirmMessage = usuario.activo
      ? `¿Deseas bloquear a ${usuario.nombre}? No podrá iniciar sesión.`
      : `¿Deseas activar a ${usuario.nombre}? Podrá iniciar sesión nuevamente.`;
    this.isConfirmOpen = true;
  }

  confirmToggle() {
    if (this.usuarioIdToToggle !== null) {
      this.adminService.toggleUsuarioEstado(this.usuarioIdToToggle).subscribe({
        next: () => {
          this.cargarUsuarios();
          this.isConfirmOpen = false;
          this.usuarioIdToToggle = null;
        },
        error: (err) => {
          console.error('Error al cambiar estado', err);
          this.isConfirmOpen = false;
        }
      });
    }
  }
}
