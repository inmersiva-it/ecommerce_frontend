import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CartService, CartItem } from '../../../../core/services/cart.service';
import { HttpClient } from '@angular/common/http';
import { NotificationService } from '../../../../core/services/notification.service';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog';
import { AdminService } from '../../../../core/services/admin.service';

@Component({
  selector: 'app-cart-panel',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmDialogComponent],
  templateUrl: './cart-panel.html',
  styleUrls: ['./cart-panel.css']
})
export class CartPanelComponent {
  @Input() isOpen = false;
  @Output() onClose = new EventEmitter<void>();
  @Output() onCheckout = new EventEmitter<void>();

  isConfirmOpen = false;
  codigoCupon = '';
  descuentoPorcentaje = 0;
  cuponMsg = '';

  constructor(
    public cartService: CartService,
    private http: HttpClient,
    private notificationService: NotificationService,
    private adminService: AdminService
  ) {}

  close() {
    this.onClose.emit();
  }

  updateQuantity(productoId: number | undefined, delta: number) {
    this.cartService.updateQuantity(productoId, delta);
  }

  removeItem(productoId: number | undefined) {
    this.cartService.removeFromCart(productoId);
  }

  aplicarCupon() {
    if (!this.codigoCupon.trim()) return;
    this.adminService.validarCupon(this.codigoCupon.trim()).subscribe({
      next: (porcentaje) => {
        this.descuentoPorcentaje = porcentaje;
        this.cuponMsg = `¡Cupón aplicado! ${porcentaje}% de descuento`;
      },
      error: (err) => {
        this.descuentoPorcentaje = 0;
        this.cuponMsg = typeof err.error === 'string' ? err.error : 'Cupón inválido';
      }
    });
  }

  quitarCupon() {
    this.codigoCupon = '';
    this.descuentoPorcentaje = 0;
    this.cuponMsg = '';
  }

  getDescuento(): number {
    return this.cartService.getTotal() * this.descuentoPorcentaje / 100;
  }

  getTotalConDescuento(): number {
    return this.cartService.getTotal() - this.getDescuento();
  }

  openCheckoutConfirmation() {
    if (this.cartService.getItemCount() > 0) {
      this.isConfirmOpen = true;
      this.close();
    }
  }

  confirmCheckout() {
    this.isConfirmOpen = false;
    const items = this.getCartItemsSnapshot();
    
    const payload: any = {
      items: items.map(i => ({ productoId: i.producto.id, cantidad: i.cantidad }))
    };

    if (this.codigoCupon.trim() && this.descuentoPorcentaje > 0) {
      payload.codigoPromocion = this.codigoCupon.trim().toUpperCase();
    }

    this.http.post('http://localhost:8080/compras', payload, { responseType: 'text' }).subscribe({
      next: () => {
        this.notificationService.showSuccess('Se realizó la compra');
        this.cartService.clearCart();
        this.quitarCupon();
        this.onCheckout.emit();
      },
      error: (err) => {
        const errorMsg = typeof err.error === 'string' ? err.error : 'Error al procesar la compra';
        this.notificationService.showError(errorMsg);
      }
    });
  }

  private getCartItemsSnapshot(): CartItem[] {
    let items: CartItem[] = [];
    this.cartService.items$.subscribe(i => items = i).unsubscribe();
    return items;
  }
}
