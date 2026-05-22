import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule, Validators } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { CommonService } from '../../services/common.service';
import { Producto, Categoria, Marca } from '../../models/producto.model';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
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

  showAddBrandForm = false;
  newBrandName = '';

  imagenes: any[] = [];
  selectedFile: File | null = null;
  uploading = false;

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
      if (this.product.id) {
        this.loadImages();
      }
    }
  }

  loadCommonData(): void {
    this.commonService.getCategories().subscribe(data => this.categories = data);
    this.commonService.getBrands().subscribe(data => this.brands = data);
  }

  toggleAddBrandForm(): void {
    this.showAddBrandForm = !this.showAddBrandForm;
    this.newBrandName = '';
  }

  saveNewBrand(): void {
    if (!this.newBrandName.trim()) return;

    this.commonService.createBrand({ nombre: this.newBrandName.trim() }).subscribe({
      next: (newBrand) => {
        this.brands.push(newBrand);
        this.productForm.patchValue({
          marcaId: newBrand.id
        });
        this.notificationService.showSuccess(`Marca '${newBrand.nombre}' creada e ingresada con éxito.`);
        this.toggleAddBrandForm();
      },
      error: (err) => {
        console.error('Error al crear la marca', err);
        this.notificationService.showError('Error al crear la marca. Intente nuevamente.');
      }
    });
  }

  loadImages(): void {
    if (this.product && this.product.id) {
      this.productService.getImages(this.product.id).subscribe({
        next: (data) => {
          this.imagenes = data;
        },
        error: (err) => {
          console.error('Error al cargar las imágenes', err);
        }
      });
    }
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  uploadImage(): void {
    if (!this.selectedFile || !this.product || !this.product.id) return;
    this.uploading = true;
    this.productService.uploadImage(this.product.id, this.selectedFile).subscribe({
      next: () => {
        this.notificationService.showSuccess('Imagen subida correctamente');
        this.selectedFile = null;
        this.uploading = false;
        const fileInput = document.getElementById('imageFileInput') as HTMLInputElement;
        if (fileInput) {
          fileInput.value = '';
        }
        this.loadImages();
      },
      error: (err) => {
        console.error('Error al subir la imagen', err);
        this.notificationService.showError('Error al subir la imagen');
        this.uploading = false;
      }
    });
  }

  deleteImage(imageId: number): void {
    if (confirm('¿Estás seguro de que deseas eliminar esta imagen?')) {
      this.productService.deleteImage(imageId).subscribe({
        next: () => {
          this.notificationService.showSuccess('Imagen eliminada correctamente');
          this.loadImages();
        },
        error: (err) => {
          console.error('Error al eliminar la imagen', err);
          this.notificationService.showError('Error al eliminar la imagen');
        }
      });
    }
  }

  getImageUrl(url: string): string {
    if (url.startsWith('http')) {
      return url;
    }
    return `http://localhost:8080${url}`;
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
