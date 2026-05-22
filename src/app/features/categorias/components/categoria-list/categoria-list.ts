import { Component, OnInit, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CategoriaService } from '../../services/categoria.service';
import { Categoria } from '../../models/categoria.model';
import { CategoriaForm } from '../categoria-form/categoria-form';
import { FormsModule } from '@angular/forms';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-categoria-list',
  standalone: true,
  imports: [CommonModule, CategoriaForm, FormsModule, ConfirmDialogComponent],
  template: `
    <div class="product-list-container">
      <div class="header-section">
        <div class="title-group">
          <h1>Gestión de Categorías</h1>
          <p>Organiza tus productos por tipos</p>
        </div>
        <button class="btn-primary" (click)="openCreateForm()">
          <i class="ph ph-plus"></i>
          <span>Nueva Categoría</span>
        </button>
      </div>

      <div class="table-card">
        <table class="modern-table">
          <thead>
            <tr>
              <th *ngFor="let col of columns; let i = index"
                  [draggable]="!col.noDrag && !isFilterInputFocused"
                  (dragstart)="onDragStart(i)"
                  (dragover)="onDragOver($event, i)"
                  (drop)="onDrop($event, i)"
                  (dragend)="onDragEnd()"
                  [class.dragging]="draggedColumnIndex === i"
                  [class.drop-target]="dragOverIndex === i"
                  [class.text-center]="col.key === 'acciones'"
                  [ngClass]="'col-' + col.key">
                
                <div class="header-content">
                  <span class="header-label">{{ col.label }}</span>
                  
                  <i *ngIf="!col.noFilter"
                     class="ph filter-icon" 
                     [ngClass]="col.filter ? 'ph-funnel-fill' : 'ph-funnel'"
                     [class.active]="col.filter || col.showFilter"
                     (click)="toggleFilter(col); $event.stopPropagation()"></i>

                  <!-- Absolute positioned filter popover -->
                  <div class="filter-popover" 
                       *ngIf="col.showFilter" 
                       (click)="$event.stopPropagation()">
                    <input type="text" 
                           class="filter-popover-input" 
                           [(ngModel)]="col.filter"
                           (keyup)="applyFilter()"
                           (focus)="isFilterInputFocused = true"
                           (blur)="isFilterInputFocused = false"
                           placeholder="Buscar..."
                           (keydown.enter)="col.showFilter = false"
                           (keydown.escape)="col.showFilter = false">
                    <button class="clear-filter-btn" *ngIf="col.filter" (click)="col.filter = ''; applyFilter(); col.showFilter = false">
                      <i class="ph ph-x"></i>
                    </button>
                  </div>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let cat of filteredCategories" class="table-row">
              <ng-container *ngFor="let col of columns">
                <td [ngSwitch]="col.key" 
                    [class.text-center]="col.key === 'acciones'" 
                    [ngClass]="'col-' + col.key">
                  
                  <!-- ID Column -->
                  <span *ngSwitchCase="'id'" class="id-badge">#{{ cat.id }}</span>
                  
                  <!-- Nombre Column -->
                  <span *ngSwitchCase="'nombre'" class="product-name">{{ cat.nombre }}</span>
                  
                  <!-- Acciones Column -->
                  <div *ngSwitchCase="'acciones'" class="actions-cell">
                    <button class="action-btn edit" (click)="openEditForm(cat)" title="Editar Categoría">
                      <i class="ph ph-pencil-simple"></i>
                    </button>
                    <button class="action-btn delete" (click)="confirmDelete(cat.id)" title="Eliminar Categoría">
                      <i class="ph ph-trash"></i>
                    </button>
                  </div>
                  
                  <!-- Default Column -->
                  <span *ngSwitchDefault>{{ getNestedValue(cat, col.key) }}</span>
                  
                </td>
              </ng-container>
            </tr>
            <tr *ngIf="filteredCategories.length === 0">
              <td [attr.colspan]="columns.length" class="empty-state">
                <i class="ph ph-squares-four"></i>
                <p>No se encontraron categorías con los filtros aplicados</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <app-categoria-form 
      *ngIf="isFormOpen" 
      [categoria]="selectedCategory" 
      (onClose)="closeForm()" 
      (onSave)="onFormSaved()">
    </app-categoria-form>

    <!-- Confirmation Dialog -->
    <app-confirm-dialog
      [isOpen]="isConfirmOpen"
      title="¿Eliminar categoría?"
      message="¿Estás seguro que deseas eliminar esta categoría? Esta acción no se puede deshacer."
      (onConfirm)="executeDelete()"
      (onCancel)="cancelDelete()">
    </app-confirm-dialog>
  `,
  styleUrls: ['./categoria-list.css']
})
export class CategoriaList implements OnInit {
  categories: Categoria[] = [];
  filteredCategories: Categoria[] = [];
  isFormOpen = false;
  selectedCategory: Categoria | null = null;
  isFilterInputFocused = false;

  // Confirmation Dialog
  isConfirmOpen = false;
  categoryIdToDelete: number | undefined = undefined;

  // Dynamic columns
  columns: { key: string; label: string; filter: string; showFilter: boolean; noFilter?: boolean; noDrag?: boolean; }[] = [
    { key: 'id', label: 'ID', filter: '', showFilter: false },
    { key: 'nombre', label: 'Nombre', filter: '', showFilter: false },
    { key: 'acciones', label: 'Acciones', filter: '', showFilter: false, noFilter: true }
  ];

  // Drag and Drop state
  draggedColumnIndex: number | null = null;
  dragOverIndex: number | null = null;

  constructor(
    private categoriaService: CategoriaService,
    private notificationService: NotificationService,
    private elementRef: ElementRef
  ) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.categoriaService.getAll().subscribe({
      next: (data) => {
        this.categories = data;
        this.applyFilter();
      },
      error: (err) => {
        console.error('Error fetching categories:', err);
        this.notificationService.showError('Error al cargar las categorías');
      }
    });
  }

  applyFilter(): void {
    this.filteredCategories = this.categories.filter(cat => {
      return this.columns.every(col => {
        if (!col.filter || col.noFilter) return true;
        const value = this.getNestedValue(cat, col.key)?.toString().toLowerCase() || '';
        return value.includes(col.filter.toLowerCase());
      });
    });
  }

  getNestedValue(cat: any, key: string): any {
    return cat[key];
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

  clearAllFilters(): void {
    this.columns.forEach(col => {
      col.filter = '';
      col.showFilter = false;
    });
    this.applyFilter();
  }

  hasActiveFilters(): boolean {
    return this.columns.some(col => col.filter);
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
    this.selectedCategory = null;
    this.isFormOpen = true;
  }

  openEditForm(cat: Categoria): void {
    this.selectedCategory = cat;
    this.isFormOpen = true;
  }

  closeForm(): void {
    this.isFormOpen = false;
    this.selectedCategory = null;
  }

  onFormSaved(): void {
    this.closeForm();
    this.loadCategories();
  }

  confirmDelete(id: number | undefined): void {
    if (id) {
      this.categoryIdToDelete = id;
      this.isConfirmOpen = true;
    }
  }

  executeDelete(): void {
    if (this.categoryIdToDelete) {
      this.categoriaService.delete(this.categoryIdToDelete).subscribe({
        next: () => {
          this.loadCategories();
          this.notificationService.showSuccess('Eliminado correctamente');
          this.cancelDelete();
        },
        error: (err) => {
          console.error('Error deleting category', err);
          this.notificationService.showError('Error al eliminar la categoría');
        }
      });
    }
  }

  cancelDelete(): void {
    this.isConfirmOpen = false;
    this.categoryIdToDelete = undefined;
  }
}
