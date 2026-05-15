import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CompraService, CompraDTO } from '../../../../core/services/compra.service';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-mis-compras',
  standalone: true,
  imports: [CommonModule, ConfirmDialogComponent],
  templateUrl: './mis-compras.html',
  styleUrls: ['./mis-compras.css']
})
export class MisComprasComponent implements OnInit {
  compras: CompraDTO[] = [];
  isLoading = true;
  
  isConfirmDeleteOpen = false;
  compraIdToDelete: number | null = null;

  constructor(private compraService: CompraService, private router: Router) {}

  goBack() {
    this.router.navigate(['/tienda']);
  }

  ngOnInit(): void {
    this.cargarCompras();
  }

  cargarCompras() {
    this.isLoading = true;
    this.compraService.getMisCompras().subscribe({
      next: (data) => {
        this.compras = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching mis compras', err);
        this.isLoading = false;
      }
    });
  }

  openDeleteConfirmation(id: number) {
    this.compraIdToDelete = id;
    this.isConfirmDeleteOpen = true;
  }

  confirmDelete() {
    if (this.compraIdToDelete !== null) {
      this.compraService.deleteCompra(this.compraIdToDelete).subscribe({
        next: () => {
          this.cargarCompras();
          this.isConfirmDeleteOpen = false;
          this.compraIdToDelete = null;
        },
        error: (err) => {
          console.error('Error al eliminar compra', err);
          alert('Hubo un error al eliminar el historial.');
          this.isConfirmDeleteOpen = false;
          this.compraIdToDelete = null;
        }
      });
    }
  }
}
