import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-configuracion',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="config-container">
      <div class="title-group">
        <h1>Configuración</h1>
        <p>Gestiona los detalles de tu cuenta</p>
      </div>

      <div class="profile-card">
        <div class="profile-header">
          <div class="profile-avatar">{{ (firstName || 'U').charAt(0) }}</div>
          <div class="profile-main-info">
            <h2>{{ fullName }}</h2>
            <span class="role-badge">{{ userRole }}</span>
          </div>
        </div>

        <div class="profile-details">
          <div class="detail-item">
            <label><i class="ph ph-envelope"></i> Email</label>
            <p>{{ email }}</p>
          </div>
          <div class="detail-item">
            <label><i class="ph ph-user"></i> Nombre Completo</label>
            <p>{{ fullName }}</p>
          </div>
          <div class="detail-item">
            <label><i class="ph ph-shield-check"></i> Rol de Acceso</label>
            <p>{{ userRole }}</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./configuracion.css']
})
export class Configuracion implements OnInit {
  firstName: string = '';
  lastName: string = '';
  email: string = '';
  userRole: string = 'Administrador';

  ngOnInit(): void {
    this.firstName = localStorage.getItem('firstName') || 'Usuario';
    this.email = localStorage.getItem('userEmail') || 'usuario@ejemplo.com';
  }

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`.trim();
  }
}
