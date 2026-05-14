import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService, CartItem } from '../../../../core/services/cart.service';
import { HttpClient } from '@angular/common/http';
import { NotificationService } from '../../../../core/services/notification.service';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-cart-panel',
  standalone: true,
  imports: [CommonModule, ConfirmDialogComponent],
  templateUrl: './cart-panel.html',
  styleUrls: ['./cart-panel.css']
})
export class CartPanelComponent {
  @Input() isOpen = false;
  @Output() onClose = new EventEmitter<void>();
  @Output() onCheckout = new EventEmitter<void>();

  isConfirmOpen = false;

  constructor(
    public cartService: CartService,
    private http: HttpClient,
    private notificationService: NotificationService
  ) {}

  close() {
    this.onClose.emit();
  }

  updateQuantity(productoId: number | undefined, delta: number) {
    this.cartService.updateQuantity(productoId, delta);
  }

  openCheckoutConfirmation() {
    if (this.cartService.getItemCount() > 0) {
      this.isConfirmOpen = true;
    }
  }

  confirmCheckout() {
    this.isConfirmOpen = false;
    const items = this.getCartItemsSnapshot();
    
    const payload = {
      items: items.map(i => ({ productoId: i.producto.id, cantidad: i.cantidad }))
    };

    this.http.post('http://localhost:8080/productos/comprar', payload).subscribe({
      next: () => {
        this.notificationService.showSuccess('¡Compra realizada con éxito! Stock actualizado');
        this.cartService.clearCart();
        this.onCheckout.emit();
        this.close();
      },
      error: (err) => {
        this.notificationService.showError(err.error || 'Error al procesar la compra');
      }
    });
  }

  private getCartItemsSnapshot(): CartItem[] {
    let items: CartItem[] = [];
    this.cartService.items$.subscribe(i => items = i).unsubscribe();
    return items;
  }
}
