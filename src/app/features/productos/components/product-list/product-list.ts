import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { Producto, Categoria } from '../../models/producto.model';
import { ProductForm } from '../product-form/product-form';
import { CommonService } from '../../services/common.service';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../../../../core/services/notification.service';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterModule, ProductForm, FormsModule, ConfirmDialogComponent],
  templateUrl: './product-list.html',
  styleUrls: ['./product-list.css']
})
export class ProductList implements OnInit {
  products: Producto[] = [];
  filteredProducts: Producto[] = [];
  categories: Categoria[] = [];
  selectedCategoryId: string = '';
  isFormOpen = false;
  selectedProduct: Producto | null = null;

  // Confirmation Dialog
  isConfirmOpen = false;
  productIdToDelete: number | undefined = undefined;

  // Dynamic columns
  columns = [
    { key: 'id', label: 'ID', filter: '', showFilter: false },
    { key: 'nombre', label: 'Nombre', filter: '', showFilter: false },
    { key: 'categoria', label: 'Categoría', filter: '', showFilter: false },
    { key: 'marca', label: 'Marca', filter: '', showFilter: false },
    { key: 'precio', label: 'Precio', filter: '', showFilter: false },
    { key: 'stock', label: 'Stock', filter: '', showFilter: false },
    { key: 'acciones', label: 'Acciones', filter: '', showFilter: false, noFilter: true, noDrag: true }
  ];

  // Drag and Drop state
  draggedColumnIndex: number | null = null;
  dragOverIndex: number | null = null;

  constructor(
    private productService: ProductService,
    private commonService: CommonService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadProducts();
    this.loadCategories();
  }

  loadProducts(): void {
    this.productService.getAll().subscribe({
      next: (data) => {
        this.products = data;
        this.applyFilter();
      },
      error: (err) => {
        console.error('Error fetching products:', err);
        this.notificationService.showError('Error al cargar los productos');
      }
    });
  }

  loadCategories(): void {
    this.commonService.getCategories().subscribe({
      next: (data) => {
        this.categories = data;
      },
      error: (err) => console.error('Error fetching categories:', err)
    });
  }

  applyFilter(): void {
    this.filteredProducts = this.products.filter(product => {
      // 1. Global Category Filter
      const matchesCategory = !this.selectedCategoryId || product.categoria?.id === Number(this.selectedCategoryId);
      
      // 2. Per-column local filter
      const matchesColumns = this.columns.every(col => {
        if (!col.filter || col.noFilter) return true;
        
        const value = this.getNestedValue(product, col.key)?.toString().toLowerCase() || '';
        return value.includes(col.filter.toLowerCase());
      });

      return matchesCategory && matchesColumns;
    });
  }

  getNestedValue(obj: any, key: string): any {
    if (key === 'categoria') return obj.categoria?.nombre;
    if (key === 'marca') return obj.marca?.nombre;
    return obj[key];
  }

  toggleFilter(column: any): void {
    column.showFilter = !column.showFilter;
    if (!column.showFilter) {
      column.filter = '';
      this.applyFilter();
    }
  }

  // Drag and Drop Handlers
  onDragStart(index: number): void {
    if (this.columns[index].noDrag) return;
    this.draggedColumnIndex = index;
  }

  onDragOver(event: DragEvent, index: number): void {
    event.preventDefault();
    if (this.columns[index].noDrag) return;
    this.dragOverIndex = index;
  }

  onDragEnd(): void {
    this.draggedColumnIndex = null;
    this.dragOverIndex = null;
  }

  onDrop(event: DragEvent, index: number): void {
    event.preventDefault();
    if (this.draggedColumnIndex === null || this.columns[index].noDrag) return;

    if (this.draggedColumnIndex !== index) {
      const movedColumn = this.columns.splice(this.draggedColumnIndex, 1)[0];
      this.columns.splice(index, 0, movedColumn);
    }

    this.draggedColumnIndex = null;
    this.dragOverIndex = null;
  }

  openCreateForm(): void {
    this.selectedProduct = null;
    this.isFormOpen = true;
  }

  openEditForm(product: Producto): void {
    this.selectedProduct = product;
    this.isFormOpen = true;
  }

  closeForm(): void {
    this.isFormOpen = false;
    this.selectedProduct = null;
  }

  onFormSaved(): void {
    this.closeForm();
    this.loadProducts();
    // Notification will be triggered by ProductForm internally or here
    // Let's do it in the form for Create/Edit
  }

  confirmDelete(id: number | undefined): void {
    if (id) {
      this.productIdToDelete = id;
      this.isConfirmOpen = true;
    }
  }

  executeDelete(): void {
    if (this.productIdToDelete) {
      this.productService.delete(this.productIdToDelete).subscribe({
        next: () => {
          this.loadProducts();
          this.notificationService.showSuccess('Eliminado correctamente');
          this.cancelDelete();
        },
        error: (err) => {
          console.error('Error deleting product', err);
          this.notificationService.showError('Error al eliminar el producto');
        }
      });
    }
  }

  cancelDelete(): void {
    this.isConfirmOpen = false;
    this.productIdToDelete = undefined;
  }
}
