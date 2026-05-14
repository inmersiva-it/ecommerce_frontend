import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CategoriaService } from '../../services/categoria.service';
import { Categoria } from '../../models/categoria.model';

@Component({
  selector: 'app-categoria-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="modal-overlay">
      <div class="modal-card">
        <div class="modal-header">
          <h3>{{ categoria ? 'Editar Categoría' : 'Nueva Categoría' }}</h3>
          <button class="close-btn" (click)="close()"><i class="ph ph-x"></i></button>
        </div>

        <form [formGroup]="categoriaForm" (ngSubmit)="save()" class="modal-body">
          <div class="form-group">
            <label>Nombre de la Categoría</label>
            <input type="text" formControlName="nombre" placeholder="Ej: Hardware, Laptops, etc." [class.error]="categoriaForm.get('nombre')?.touched && categoriaForm.get('nombre')?.invalid">
            <small class="error-msg" *ngIf="categoriaForm.get('nombre')?.touched && categoriaForm.get('nombre')?.invalid">El nombre es requerido</small>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn-cancel" (click)="close()">Cancelar</button>
            <button type="submit" class="btn-save" [disabled]="categoriaForm.invalid">
              {{ categoria ? 'Actualizar' : 'Guardar' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styleUrls: ['./categoria-form.css']
})
export class CategoriaForm implements OnInit {
  @Input() categoria: Categoria | null = null;
  @Output() onClose = new EventEmitter<void>();
  @Output() onSave = new EventEmitter<void>();

  categoriaForm: FormGroup;

  constructor(private fb: FormBuilder, private categoriaService: CategoriaService) {
    this.categoriaForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]]
    });
  }

  ngOnInit(): void {
    if (this.categoria) {
      this.categoriaForm.patchValue({
        nombre: this.categoria.nombre
      });
    }
  }

  save(): void {
    if (this.categoriaForm.invalid) return;

    if (this.categoria && this.categoria.id) {
      this.categoriaService.update(this.categoria.id, this.categoriaForm.value).subscribe(() => this.onSave.emit());
    } else {
      this.categoriaService.create(this.categoriaForm.value).subscribe(() => this.onSave.emit());
    }
  }

  close(): void {
    this.onClose.emit();
  }
}
