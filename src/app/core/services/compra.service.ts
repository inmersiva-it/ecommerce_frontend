import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface DetalleCompraDTO {
  id: number;
  productoNombre: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface CompraDTO {
  id: number;
  usuarioNombre: string;
  usuarioEmail: string;
  fecha: string;
  total: number;
  descuentoAplicado: number;
  codigoUsado: string | null;
  detalles: DetalleCompraDTO[];
}

@Injectable({
  providedIn: 'root'
})
export class CompraService {
  private API = 'http://localhost:8080/compras';

  constructor(private http: HttpClient) {}

  getTodasLasCompras(): Observable<CompraDTO[]> {
    return this.http.get<CompraDTO[]>(this.API);
  }

  getMisCompras(): Observable<CompraDTO[]> {
    return this.http.get<CompraDTO[]>(`${this.API}/mis-compras`);
  }

  deleteCompra(id: number): Observable<any> {
    return this.http.delete(`${this.API}/${id}`, { responseType: 'text' });
  }
}
