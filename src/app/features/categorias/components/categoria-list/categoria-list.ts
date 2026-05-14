import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CategoriaService } from '../../services/categoria.service';
import { Categoria } from '../../models/categoria.model';
import { CategoriaForm } from '../categoria-form/categoria-form';

@Component({
  selector: 'app-categoria-list',
  standalone: true,
  imports: [CommonModule, CategoriaForm],
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
              <th>ID</th>
              <th>Nombre</th>
              <th class="text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let cat of categories" class="table-row">
              <td><span class="id-badge">#{{ cat.id }}</span></td>
              <td><span class="product-name">{{ cat.nombre }}</span></td>
              <td class="actions-cell">
                <button class="action-btn edit" (click)="openEditForm(cat)" title="Editar">
                  <i class="ph ph-pencil-simple"></i>
                </button>
                <button class="action-btn delete" (click)="deleteCategory(cat.id)" title="Eliminar">
                  <i class="ph ph-trash"></i>
                </button>
              </td>
            </tr>
            <tr *ngIf="categories.length === 0">
              <td colspan="3" class="empty-state">
                <i class="ph ph-squares-four"></i>
                <p>No hay categorías registradas</p>
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
  `,
  styleUrls: ['./categoria-list.css']
})
export class CategoriaList implements OnInit {
  categories: Categoria[] = [];
  isFormOpen = false;
  selectedCategory: Categoria | null = null;

  constructor(private categoriaService: CategoriaService) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.categoriaService.getAll().subscribe(data => this.categories = data);
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

  deleteCategory(id: number | undefined): void {
    if (id && confirm('¿Estás seguro de eliminar esta categoría?')) {
      this.categoriaService.delete(id).subscribe(() => this.loadCategories());
    }
  }
}
