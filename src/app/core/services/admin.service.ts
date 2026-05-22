import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface UsuarioDTO {
  id: number;
  nombre: string;
  email: string;
  rol: string;
  activo: boolean;
}

export interface PromocionDTO {
  id?: number;
  codigo: string;
  porcentajeDescuento: number;
  fechaVencimiento: string;
  activo: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private BASE = 'http://localhost:8080';

  constructor(private http: HttpClient) {}

  // --- Usuarios ---
  getUsuarios(): Observable<UsuarioDTO[]> {
    return this.http.get<UsuarioDTO[]>(`${this.BASE}/usuarios`);
  }

  toggleUsuarioEstado(id: number): Observable<UsuarioDTO> {
    return this.http.put<UsuarioDTO>(`${this.BASE}/usuarios/${id}/estado`, {});
  }

  cambiarRolUsuario(id: number): Observable<UsuarioDTO> {
    return this.http.put<UsuarioDTO>(`${this.BASE}/usuarios/${id}/rol`, {});
  }

  eliminarUsuario(id: number): Observable<any> {
    return this.http.delete<any>(`${this.BASE}/usuarios/${id}`);
  }

  // --- Promociones ---
  getPromociones(): Observable<PromocionDTO[]> {
    return this.http.get<PromocionDTO[]>(`${this.BASE}/promociones`);
  }

  crearPromocion(dto: PromocionDTO): Observable<PromocionDTO> {
    return this.http.post<PromocionDTO>(`${this.BASE}/promociones`, dto);
  }

  eliminarPromocion(id: number): Observable<any> {
    return this.http.delete(`${this.BASE}/promociones/${id}`, { responseType: 'text' });
  }

  togglePromocionEstado(id: number): Observable<PromocionDTO> {
    return this.http.put<PromocionDTO>(`${this.BASE}/promociones/${id}/estado`, {});
  }

  validarCupon(codigo: string): Observable<number> {
    return this.http.get<number>(`${this.BASE}/promociones/validar/${codigo}`);
  }
}
