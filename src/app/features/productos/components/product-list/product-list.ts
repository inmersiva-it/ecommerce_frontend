import { Component, OnInit, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { Producto, Categoria, Marca } from '../../models/producto.model';
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
  brands: Marca[] = [];
  selectedCategoryId: string = '';
  selectedBrandId: string = '';
  selectedStockStatus: string = '';
  searchQuery: string = '';
  isFormOpen = false;
  selectedProduct: Producto | null = null;
  isFilterInputFocused = false;

  // Confirmation Dialog
  isConfirmOpen = false;
  productIdToDelete: number | undefined = undefined;

  // Dynamic columns
  columns: { key: string; label: string; filter: string; showFilter: boolean; noFilter?: boolean; noDrag?: boolean; }[] = [
    { key: 'id', label: 'ID', filter: '', showFilter: false },
    { key: 'nombre', label: 'Nombre', filter: '', showFilter: false },
    { key: 'categoria', label: 'Categoría', filter: '', showFilter: false },
    { key: 'marca', label: 'Marca', filter: '', showFilter: false },
    { key: 'precio', label: 'Precio', filter: '', showFilter: false },
    { key: 'stock', label: 'Stock', filter: '', showFilter: false },
    { key: 'acciones', label: 'Acciones', filter: '', showFilter: false, noFilter: true }
  ];

  // Drag and Drop state
  draggedColumnIndex: number | null = null;
  dragOverIndex: number | null = null;

  constructor(
    private productService: ProductService,
    private commonService: CommonService,
    private notificationService: NotificationService,
    private elementRef: ElementRef
  ) {}

  ngOnInit(): void {
    this.loadProducts();
    this.loadCategories();
    this.loadBrands();
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

  loadBrands(): void {
    this.commonService.getBrands().subscribe({
      next: (data) => {
        this.brands = data;
      },
      error: (err) => console.error('Error fetching brands:', err)
    });
  }

  applyFilter(): void {
    this.filteredProducts = this.products.filter(product => {
      // 1. Global Category Filter
      const matchesCategory = !this.selectedCategoryId || product.categoria?.id === Number(this.selectedCategoryId);
      
      // 2. Global Brand Filter
      const matchesBrand = !this.selectedBrandId || product.marca?.id === Number(this.selectedBrandId);
      
      // 3. Global Search Query (Nombre, Descripción, Marca, Categoria)
      const matchesSearch = !this.searchQuery || 
        product.nombre.toLowerCase().includes(this.searchQuery.toLowerCase()) || 
        product.descripcion.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        product.marca?.nombre?.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        product.categoria?.nombre?.toLowerCase().includes(this.searchQuery.toLowerCase());

      // 4. Global Stock Status Filter
      let matchesStockStatus = true;
      if (this.selectedStockStatus === 'low') {
        matchesStockStatus = product.stock > 0 && product.stock < 10;
      } else if (this.selectedStockStatus === 'out') {
        matchesStockStatus = product.stock === 0;
      } else if (this.selectedStockStatus === 'ok') {
        matchesStockStatus = product.stock >= 10;
      }

      // 5. Per-column local filter
      const matchesColumns = this.columns.every(col => {
        if (!col.filter || col.noFilter) return true;
        
        const value = this.getNestedValue(product, col.key)?.toString().toLowerCase() || '';
        return value.includes(col.filter.toLowerCase());
      });

      return matchesCategory && matchesBrand && matchesSearch && matchesStockStatus && matchesColumns;
    });
  }

  clearAllFilters(): void {
    this.selectedCategoryId = '';
    this.selectedBrandId = '';
    this.selectedStockStatus = '';
    this.searchQuery = '';
    this.columns.forEach(col => {
      col.filter = '';
      col.showFilter = false;
    });
    this.applyFilter();
  }

  getNestedValue(obj: any, key: string): any {
    if (key === 'categoria') return obj.categoria?.nombre;
    if (key === 'marca') return obj.marca?.nombre;
    return obj[key];
  }

  toggleFilter(column: any): void {
    column.showFilter = !column.showFilter;
    if (column.showFilter) {
      this.columns.forEach(col => {
        if (col !== column) {
          col.showFilter = false;
        }
      });
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const isHeaderClick = target.closest('.header-content');
    if (!isHeaderClick) {
      this.columns.forEach(col => col.showFilter = false);
    }
  }

  hasActiveFilters(): boolean {
    return !!(
      this.searchQuery ||
      this.selectedCategoryId ||
      this.selectedBrandId ||
      this.selectedStockStatus ||
      this.columns.some(col => col.filter)
    );
  }

  // Drag and Drop Handlers
  onDragStart(index: number): void {
    if (this.columns[index].noDrag || this.isFilterInputFocused) return;
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
