import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../../productos/services/product.service';
import { CommonService } from '../../../productos/services/common.service';
import { CartService } from '../../../../core/services/cart.service';
import { Producto, Categoria } from '../../../productos/models/producto.model';
import { CartPanelComponent } from '../../components/cart-panel/cart-panel';
import { NotificationService } from '../../../../core/services/notification.service';
import { Auth } from '../../../auth/services/auth';
import { HostListener, ElementRef } from '@angular/core';

@Component({
  selector: 'app-store',
  standalone: true,
  imports: [CommonModule, CartPanelComponent],
  templateUrl: './store.html',
  styleUrls: ['./store.css']
})
export class StoreComponent implements OnInit {
  products: Producto[] = [];
  categories: Categoria[] = [];
  selectedCategoryId: number | null = null;
  isCartOpen = false;
  isUserMenuOpen = false;
  currentUser: any = null;

  constructor(
    private productService: ProductService,
    private commonService: CommonService,
    public cartService: CartService,
    private notificationService: NotificationService,
    private authService: Auth,
    private eRef: ElementRef
  ) {}

  ngOnInit(): void {
    this.loadProducts();
    this.loadCategories();
    this.loadUserProfile();
  }

  loadProducts(): void {
    this.productService.getAll().subscribe((data: Producto[]) => this.products = data);
  }

  loadCategories(): void {
    this.commonService.getCategories().subscribe((data: Categoria[]) => this.categories = data);
  }

  selectCategory(categoryId: number | null): void {
    this.selectedCategoryId = categoryId;
    if (categoryId === null) {
      this.loadProducts();
    } else {
      this.productService.getByCategory(categoryId).subscribe((data: Producto[]) => this.products = data);
    }
  }

  addToCart(product: Producto): void {
    if (product.stock && product.stock > 0) {
      this.cartService.addToCart(product);
      this.notificationService.showInfo(`Añadido: ${product.nombre}`);
    }
  }

  toggleCart(): void {
    this.isCartOpen = !this.isCartOpen;
  }

  loadUserProfile(): void {
    this.authService.getProfile().subscribe({
      next: (user: any) => {
        this.currentUser = user;
      },
      error: () => {
        this.currentUser = null;
      }
    });
  }

  toggleUserMenu(event: Event): void {
    event.stopPropagation();
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }

  logout(): void {
    this.authService.logout();
  }

  @HostListener('document:click', ['$event'])
  clickout(event: any) {
    if (!this.eRef.nativeElement.contains(event.target)) {
      this.isUserMenuOpen = false;
    }
  }
}
