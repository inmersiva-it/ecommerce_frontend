import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CartService, CartItem } from '../../../../core/services/cart.service';
import { HttpClient } from '@angular/common/http';
import { NotificationService } from '../../../../core/services/notification.service';
import { AdminService } from '../../../../core/services/admin.service';
import { PedidoService } from '../../../../core/services/pedido.service';

@Component({
  selector: 'app-cart-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cart-panel.html',
  styleUrls: ['./cart-panel.css']
})
export class CartPanelComponent {
  @Input() isOpen = false;
  @Output() onClose = new EventEmitter<void>();
  @Output() onCheckout = new EventEmitter<void>();

  codigoCupon = '';
  descuentoPorcentaje = 0;
  cuponMsg = '';

  isCheckoutModalOpen = false;
  selectedPaymentMethod = 'tarjeta';
  cardHolder = '';
  cardNumber = '';
  cardExpiry = '';
  cardCvv = '';

  constructor(
    public cartService: CartService,
    private http: HttpClient,
    private notificationService: NotificationService,
    private adminService: AdminService,
    private pedidoService: PedidoService
  ) {}

  close() {
    this.onClose.emit();
  }

  getProductImage(product: any): string {
    if (product.imagenes && product.imagenes.length > 0) {
      const url = product.imagenes[0];
      if (url.startsWith('http')) {
        return url;
      }
      return `http://localhost:8080${url}`;
    }
    if (product.imagenUrl) {
      if (product.imagenUrl.startsWith('http')) {
        return product.imagenUrl;
      }
      return `http://localhost:8080${product.imagenUrl}`;
    }
    return 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100%" height="100%" fill="%23f1f5f9"/><path d="M45,40 C45,37.24 47.24,35 50,35 C52.76,35 55,37.24 55,40 C55,42.76 52.76,45 50,45 C47.24,45 45,42.76 45,40 Z M60,55 L40,55 L30,70 L70,70 Z" fill="%2394a3b8"/></svg>';
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

  openCheckoutModal() {
    if (this.cartService.getItemCount() > 0) {
      this.isCheckoutModalOpen = true;
      this.close();
    }
  }

  formatCardNumber(event: any) {
    let value = event.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    let parts = [];
    for (let i = 0, len = value.length; i < len; i += 4) {
      parts.push(value.substring(i, i + 4));
    }
    this.cardNumber = parts.join(' ').substring(0, 19);
  }

  formatCardExpiry(event: any) {
    let value = event.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (value.length >= 2) {
      this.cardExpiry = value.substring(0, 2) + '/' + value.substring(2, 4);
    } else {
      this.cardExpiry = value;
    }
    this.cardExpiry = this.cardExpiry.substring(0, 5);
  }

  formatCardCvv(event: any) {
    this.cardCvv = event.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '').substring(0, 4);
  }

  isPaymentFormValid(): boolean {
    if (this.selectedPaymentMethod === 'tarjeta') {
      return !!(this.cardHolder.trim() && this.cardNumber.length >= 15 && this.cardExpiry.length === 5 && this.cardCvv.length >= 3);
    }
    return true;
  }

  confirmCheckout() {
    if (!this.isPaymentFormValid()) {
      this.notificationService.showError('Por favor, complete los datos de pago válidos.');
      return;
    }

    const items = this.getCartItemsSnapshot();
    let metodoPagoId = 1;
    if (this.selectedPaymentMethod === 'transferencia') {
      metodoPagoId = 2;
    } else if (this.selectedPaymentMethod === 'efectivo') {
      metodoPagoId = 3;
    }

    const payload: any = {
      metodoPagoId: metodoPagoId,
      items: items.map(i => ({ productoId: i.producto.id, cantidad: i.cantidad }))
    };

    if (this.codigoCupon.trim() && this.descuentoPorcentaje > 0) {
      payload.codigoPromocion = this.codigoCupon.trim().toUpperCase();
    }

    this.pedidoService.crearPedido(payload).subscribe({
      next: () => {
        this.notificationService.showSuccess('¡Pago procesado y pedido realizado con éxito!');
        this.cartService.clearCart();
        this.quitarCupon();
        this.resetPaymentForm();
        this.isCheckoutModalOpen = false;
        this.onCheckout.emit();
      },
      error: (err) => {
        const errorMsg = err.error && typeof err.error === 'string' ? err.error : (err.error?.message || 'Error al procesar el pedido');
        this.notificationService.showError(errorMsg);
      }
    });
  }

  resetPaymentForm() {
    this.cardHolder = '';
    this.cardNumber = '';
    this.cardExpiry = '';
    this.cardCvv = '';
    this.selectedPaymentMethod = 'tarjeta';
  }

  private getCartItemsSnapshot(): CartItem[] {
    let items: CartItem[] = [];
    this.cartService.items$.subscribe(i => items = i).unsubscribe();
    return items;
  }
}
