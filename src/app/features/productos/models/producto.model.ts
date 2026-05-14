export interface Categoria {
  id?: number;
  nombre: string;
}

export interface Marca {
  id?: number;
  nombre: string;
}

export interface Producto {
  id?: number;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  marca?: Marca;
  categoria?: Categoria;
}
