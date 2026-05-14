import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Producto } from '../../features/productos/models/producto.model';

export interface CartItem {
  producto: Producto;
  cantidad: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private itemsSubject = new BehaviorSubject<CartItem[]>([]);
  items$ = this.itemsSubject.asObservable();

  addToCart(producto: Producto) {
    const currentItems = this.itemsSubject.value;
    const existingItem = currentItems.find(item => item.producto.id === producto.id);

    if (existingItem) {
      existingItem.cantidad += 1;
      this.itemsSubject.next([...currentItems]);
    } else {
      this.itemsSubject.next([...currentItems, { producto, cantidad: 1 }]);
    }
  }

  updateQuantity(productoId: number | undefined, delta: number) {
    if (!productoId) return;
    const currentItems = this.itemsSubject.value;
    const item = currentItems.find(i => i.producto.id === productoId);

    if (item) {
      item.cantidad += delta;
      if (item.cantidad <= 0) {
        this.removeFromCart(productoId);
      } else {
        this.itemsSubject.next([...currentItems]);
      }
    }
  }

  removeFromCart(productoId: number | undefined) {
    const currentItems = this.itemsSubject.value.filter(item => item.producto.id !== productoId);
    this.itemsSubject.next(currentItems);
  }

  clearCart() {
    this.itemsSubject.next([]);
  }

  getTotal() {
    return this.itemsSubject.value.reduce((total, item) => total + (item.producto.precio || 0) * item.cantidad, 0);
  }

  getItemCount() {
    return this.itemsSubject.value.reduce((count, item) => count + item.cantidad, 0);
  }
}
