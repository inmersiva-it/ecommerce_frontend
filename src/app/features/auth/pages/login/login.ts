import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Auth } from '../../services/auth';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  templateUrl: './login.html',
  styleUrl: './login.css',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule]
})
export class LoginComponent {

  isLoginMode = true;
  firstName: string = '';
  lastName: string = '';
  email: string = '';
  password: string = '';
  showPassword = false;

  // Notificación en pantalla
  notification: { message: string; type: 'error' | 'success' | 'warning' } | null = null;

  constructor(private auth: Auth, private router: Router) {}

  showNotification(message: string, type: 'error' | 'success' | 'warning' = 'error') {
    this.notification = { message, type };
    setTimeout(() => this.notification = null, 5000);
  }

  toggleMode() {
    this.isLoginMode = !this.isLoginMode;
    this.notification = null;
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  login() {
    this.notification = null;
    const data = { email: this.email, password: this.password };
    this.auth.login(data).subscribe({
      next: (res: any) => {
        localStorage.setItem('token', res.token);
        localStorage.setItem('firstName', res.nombre || 'Usuario');
        localStorage.setItem('userEmail', res.email);
        localStorage.setItem('userRole', res.rol);

        if (res.rol === 'Administrador') {
          this.router.navigate(['/dashboard']);
        } else {
          this.router.navigate(['/tienda']);
        }
      },
      error: (err) => {
        const msg = typeof err.error === 'string' ? err.error : 'Credenciales incorrectas';
        const type = err.status === 403 ? 'warning' : 'error';
        this.showNotification(msg, type);
      }
    });
  }

  register() {
    this.notification = null;
    const data = {
      nombres: this.firstName,
      apellidos: this.lastName,
      email: this.email,
      password: this.password
    };
    this.auth.register(data).subscribe({
      next: (res: any) => {
        localStorage.setItem('token', res.token);
        localStorage.setItem('firstName', res.nombre || 'Usuario');
        localStorage.setItem('userEmail', res.email);
        localStorage.setItem('userRole', res.rol);

        if (res.rol === 'Administrador') {
          this.router.navigate(['/dashboard']);
        } else {
          this.router.navigate(['/tienda']);
        }
      },
      error: (err) => {
        const msg = typeof err.error === 'string' ? err.error : 'Datos inválidos. Intenta de nuevo.';
        this.showNotification(msg, 'error');
      }
    });
  }

  socialLogin(provider: string) {
    this.showNotification(`Inicio de sesión con ${provider} está en desarrollo.`, 'warning');
  }
}
