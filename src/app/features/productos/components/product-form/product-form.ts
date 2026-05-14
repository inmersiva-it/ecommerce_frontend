import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { CommonService } from '../../services/common.service';
import { Producto, Categoria, Marca } from '../../models/producto.model';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './product-form.html',
  styleUrls: ['./product-form.css']
})
export class ProductForm implements OnInit {
  @Input() product: Producto | null = null;
  @Output() onClose = new EventEmitter<void>();
  @Output() onSave = new EventEmitter<void>();

  productForm: FormGroup;
  categories: Categoria[] = [];
  brands: Marca[] = [];

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private commonService: CommonService,
    private notificationService: NotificationService
  ) {
    this.productForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      descripcion: ['', [Validators.required]],
      precio: [0, [Validators.required, Validators.min(0.01)]],
      stock: [0, [Validators.required, Validators.min(0)]],
      categoriaId: ['', [Validators.required]],
      marcaId: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.loadCommonData();
    if (this.product) {
      this.productForm.patchValue({
        nombre: this.product.nombre,
        descripcion: this.product.descripcion,
        precio: this.product.precio,
        stock: this.product.stock,
        categoriaId: this.product.categoria?.id,
        marcaId: this.product.marca?.id
      });
    }
  }

  loadCommonData(): void {
    this.commonService.getCategories().subscribe(data => this.categories = data);
    this.commonService.getBrands().subscribe(data => this.brands = data);
  }

  save(): void {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }

    const formValue = this.productForm.value;
    const productoData: Producto = {
      nombre: formValue.nombre,
      descripcion: formValue.descripcion,
      precio: formValue.precio,
      stock: formValue.stock,
      categoria: { id: formValue.categoriaId, nombre: '' },
      marca: { id: formValue.marcaId, nombre: '' }
    };

    if (this.product && this.product.id) {
      this.productService.update(this.product.id, productoData).subscribe({
        next: () => {
          this.notificationService.showSuccess('Producto actualizado correctamente');
          this.onSave.emit();
        },
        error: (err) => {
          console.error('Error updating product', err);
          this.notificationService.showError('Error al actualizar el producto');
        }
      });
    } else {
      this.productService.create(productoData).subscribe({
        next: () => {
          this.notificationService.showSuccess('Producto creado correctamente');
          this.onSave.emit();
        },
        error: (err) => {
          console.error('Error creating product', err);
          this.notificationService.showError('Error al crear el producto');
        }
      });
    }
  }

  close(): void {
    this.onClose.emit();
  }
}
