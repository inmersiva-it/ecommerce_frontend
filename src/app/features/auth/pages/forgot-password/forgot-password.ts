import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Auth } from '../../services/auth';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.css',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule]
})
export class ForgotPasswordComponent {
  email: string = '';
  newPassword: string = '';
  confirmPassword: string = '';
  
  step: number = 1; // 1: Check Email, 2: Reset Password
  isLoading: boolean = false;
  message: string = '';
  isError: boolean = false;

  constructor(private auth: Auth, private router: Router) {}

  checkEmail() {
    if (!this.email) {
      this.showMessage('Por favor, ingresa tu correo electrónico.', true);
      return;
    }

    this.isLoading = true;
    this.message = '';
    
    this.auth.checkEmail(this.email).subscribe({
      next: () => {
        this.isLoading = false;
        this.step = 2;
        this.showMessage('Correo verificado. Ahora puedes cambiar tu contraseña.', false);
      },
      error: (err) => {
        this.isLoading = false;
        this.showMessage(err.error || 'El correo no existe en nuestra base de datos.', true);
      }
    });
  }

  resetPassword() {
    if (!this.newPassword || !this.confirmPassword) {
      this.showMessage('Por favor, completa todos los campos.', true);
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.showMessage('Las contraseñas no coinciden.', true);
      return;
    }

    this.isLoading = true;
    this.auth.resetPassword(this.email, this.newPassword).subscribe({
      next: (res: string) => {
        this.isLoading = false;
        this.showMessage('Contraseña actualizada con éxito. Redirigiendo al login...', false);
        setTimeout(() => this.router.navigate(['/login']), 3000);
      },
      error: (err) => {
        this.isLoading = false;
        this.showMessage(err.error || 'Error al actualizar la contraseña.', true);
      }
    });
  }

  private showMessage(msg: string, isError: boolean) {
    this.message = msg;
    this.isError = isError;
  }
}
