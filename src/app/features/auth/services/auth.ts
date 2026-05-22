import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class Auth {

  private API = 'http://localhost:8080/auth';

  constructor(private http: HttpClient) {
    this.startTokenExpiryCheck();
  }

  private decodeToken(token: string): any {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      const base64Url = parts[1];
      let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      while (base64.length % 4) {
        base64 += '=';
      }
      const jsonPayload = decodeURIComponent(
        window.atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      return null;
    }
  }

  public isTokenExpired(token: string | null): boolean {
    if (!token) return true;
    const decoded = this.decodeToken(token);
    if (!decoded || !decoded.exp) return true;
    const expirationDate = decoded.exp * 1000;
    return Date.now() >= expirationDate;
  }

  private startTokenExpiryCheck() {
    // Verificar cada 5 segundos si el token ha expirado
    setInterval(() => {
      const token = localStorage.getItem('token');
      if (token && this.isTokenExpired(token)) {
        console.warn('El token ha expirado. Cerrando sesión automáticamente...');
        this.logout();
      }
    }, 5000);
  }

  login(data: any) {
    return this.http.post(`${this.API}/login`, data);
  }

  register(data: any) {
    return this.http.post(`${this.API}/register`, data);
  }

  checkEmail(email: string) {
    return this.http.post(`${this.API}/check-email`, { email });
  }

  resetPassword(email: string, password: string) {
    return this.http.post(`${this.API}/reset-password`, { email, password }, { responseType: 'text' });
  }

  getProfile() {
    const token = localStorage.getItem('token');
    return this.http.get(`${this.API}/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  updateProfile(firstName: string, lastName: string) {
    const token = localStorage.getItem('token');
    return this.http.post(`${this.API}/update-profile`, { firstName, lastName }, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('firstName');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userRole');
    window.location.href = '/login';
  }
}