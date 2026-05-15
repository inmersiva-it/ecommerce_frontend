import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class Auth {

  private API = 'http://localhost:8080/auth';

  constructor(private http: HttpClient) {}

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