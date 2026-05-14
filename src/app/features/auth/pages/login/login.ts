import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth } from '../../services/auth';

import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  templateUrl: './login.html',
  styleUrl: './login.css',
  standalone: true,
  imports: [FormsModule, CommonModule]
})
export class LoginComponent {

  isLoginMode = true;
  firstName: string = '';
  lastName: string = '';
  email: string = '';
  password: string = '';

  constructor(private auth: Auth, private router: Router) {}

  toggleMode() {
    this.isLoginMode = !this.isLoginMode;
  }

  login() {
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
      error: (err) => alert('Error al iniciar sesión: ' + (err.error || 'Credenciales incorrectas'))
    });
  }

  register() {
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
      error: (err) => alert('Error al registrar: ' + (err.error || 'Datos inválidos'))
    });
  }

  socialLogin(provider: string) {
    alert(`Iniciando sesión con ${provider} (Funcionalidad en desarrollo)`);
  }
}