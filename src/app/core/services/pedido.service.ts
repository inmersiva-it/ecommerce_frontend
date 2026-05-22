import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface DetallePedidoDTO {
  id: number;
  productoId: number;
  productoNombre: string;
  cantidad: number;
  precioUnitario: number;
}

export interface PedidoDTO {
  id: number;
  usuarioNombre: string;
  usuarioEmail: string;
  metodoPagoNombre: string;
  estado: string;
  total: number;
  descuentoAplicado: number;
  codigoUsado: string | null;
  fechaPedido: string;
  detalles: DetallePedidoDTO[];
}

@Injectable({
  providedIn: 'root'
})
export class PedidoService {
  private API = 'http://localhost:8080/pedidos';

  constructor(private http: HttpClient) {}

  getTodosLosPedidos(): Observable<PedidoDTO[]> {
    return this.http.get<PedidoDTO[]>(this.API);
  }

  getMisPedidos(): Observable<PedidoDTO[]> {
    return this.http.get<PedidoDTO[]>(`${this.API}/mis-pedidos`);
  }

  crearPedido(dto: any): Observable<PedidoDTO> {
    return this.http.post<PedidoDTO>(this.API, dto);
  }

  actualizarEstado(id: number, estado: string): Observable<PedidoDTO> {
    return this.http.put<PedidoDTO>(`${this.API}/${id}/estado?estado=${estado}`, {});
  }

  eliminarPedido(id: number): Observable<any> {
    return this.http.delete(`${this.API}/${id}`);
  }
}
