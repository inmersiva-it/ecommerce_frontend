import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../productos/services/product.service';
import { CommonService } from '../../../productos/services/common.service';
import { CartService } from '../../../../core/services/cart.service';
import { Producto, Categoria } from '../../../productos/models/producto.model';
import { CartPanelComponent } from '../../components/cart-panel/cart-panel';
import { NotificationService } from '../../../../core/services/notification.service';
import { Auth } from '../../../auth/services/auth';
import { HostListener, ElementRef } from '@angular/core';

import { Router } from '@angular/router';

@Component({
  selector: 'app-store',
  standalone: true,
  imports: [CommonModule, FormsModule, CartPanelComponent],
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
  searchTerm: string = '';

  selectedProduct: Producto | null = null;
  reviews: any[] = [];
  activeImageIndex: number = 0;
  newRating: number = 5;
  newComment: string = '';
  submittingReview: boolean = false;

  sortOption: string = 'popular';

  get filteredProducts(): Producto[] {
    let result = [...this.products];
    
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(p => 
        p.nombre.toLowerCase().includes(term) || 
        (p.marca && p.marca.nombre.toLowerCase().includes(term))
      );
    }

    if (this.sortOption === 'price_asc') {
      result.sort((a, b) => (a.precio || 0) - (b.precio || 0));
    } else if (this.sortOption === 'price_desc') {
      result.sort((a, b) => (b.precio || 0) - (a.precio || 0));
    } else if (this.sortOption === 'popular') {
      result.sort((a, b) => (b.promedioCalificaciones || 0) - (a.promedioCalificaciones || 0));
    }

    return result;
  }

  constructor(
    private productService: ProductService,
    private commonService: CommonService,
    public cartService: CartService,
    private notificationService: NotificationService,
    private authService: Auth,
    private eRef: ElementRef,
    private router: Router
  ) {}

  goToMisCompras() {
    this.router.navigate(['/mis-compras']);
    this.isUserMenuOpen = false;
  }

  ngOnInit(): void {
    this.loadProducts();
    this.loadCategories();
    this.loadUserProfile();
  }

  getProductImage(product: Producto): string {
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
    return 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="100%" height="100%" fill="%23f1f5f9"/><path d="M190,130 C190,124.477 194.477,120 200,120 C205.523,120 210,124.477 210,130 C210,135.523 205.523,140 200,140 C194.477,140 190,135.523 190,130 Z M220,160 L180,160 L160,190 L240,190 Z" fill="%2394a3b8"/><text x="50%" y="75%" dominant-baseline="middle" text-anchor="middle" font-family="system-ui, sans-serif" font-size="14" fill="%2364748b" font-weight="500">Sin Imagen Disponible</text></svg>';
  }

  hasImage(product: Producto): boolean {
    return !!((product.imagenes && product.imagenes.length > 0) || product.imagenUrl);
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

  openProductDetail(product: Producto): void {
    this.selectedProduct = product;
    this.activeImageIndex = 0;
    this.newRating = 5;
    this.newComment = '';
    this.reviews = [];
    if (product.id) {
      this.productService.getReviews(product.id).subscribe({
        next: (res) => {
          this.reviews = res;
        },
        error: (err) => {
          console.error('Error fetching reviews', err);
        }
      });
    }
  }

  closeProductDetail(): void {
    this.selectedProduct = null;
  }

  selectImageIndex(index: number): void {
    this.activeImageIndex = index;
  }

  resolveImageUrl(url: string | undefined): string {
    if (!url) {
      return 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="100%" height="100%" fill="%23f1f5f9"/><path d="M190,130 C190,124.477 194.477,120 200,120 C205.523,120 210,124.477 210,130 C210,135.523 205.523,140 200,140 C194.477,140 190,135.523 190,130 Z M220,160 L180,160 L160,190 L240,190 Z" fill="%2394a3b8"/><text x="50%" y="75%" dominant-baseline="middle" text-anchor="middle" font-family="system-ui, sans-serif" font-size="14" fill="%2364748b" font-weight="500">Sin Imagen Disponible</text></svg>';
    }
    if (url.startsWith('http') || url.startsWith('data:')) {
      return url;
    }
    return `http://localhost:8080${url}`;
  }

  getStars(rating: number | undefined): number[] {
    return [1, 2, 3, 4, 5];
  }

  submitReview(): void {
    if (!this.selectedProduct || !this.selectedProduct.id) return;
    if (!this.newComment.trim()) {
      this.notificationService.showError('Por favor, escribe un comentario.');
      return;
    }
    this.submittingReview = true;
    this.productService.createReview(this.selectedProduct.id, {
      calificacion: this.newRating,
      comentario: this.newComment.trim()
    }).subscribe({
      next: (savedReview) => {
        this.notificationService.showSuccess('¡Reseña publicada con éxito!');
        this.newComment = '';
        this.newRating = 5;
        this.submittingReview = false;
        
        // Reload reviews list
        if (this.selectedProduct && this.selectedProduct.id) {
          this.productService.getReviews(this.selectedProduct.id).subscribe({
            next: (res) => {
              this.reviews = res;
            }
          });
          // Reload product details to update average rating and anything else
          this.productService.getById(this.selectedProduct.id).subscribe({
            next: (updatedProd) => {
              if (this.selectedProduct) {
                this.selectedProduct.promedioCalificaciones = updatedProd.promedioCalificaciones;
                this.selectedProduct.imagenes = updatedProd.imagenes;
                
                // Update in the main list so it updates on the store grid as well!
                const idx = this.products.findIndex(p => p.id === updatedProd.id);
                if (idx !== -1) {
                  this.products[idx] = updatedProd;
                }
              }
            }
          });
        }
      },
      error: (err) => {
        const errorMsg = typeof err.error === 'string' ? err.error : 'Error al publicar la reseña';
        this.notificationService.showError(errorMsg);
        this.submittingReview = false;
      }
    });
  }

  @HostListener('document:click', ['$event'])
  clickout(event: any) {
    if (!this.eRef.nativeElement.contains(event.target)) {
      this.isUserMenuOpen = false;
    }
  }
}
