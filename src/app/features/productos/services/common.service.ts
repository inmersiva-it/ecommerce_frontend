import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Categoria, Marca } from '../models/producto.model';

@Injectable({
  providedIn: 'root'
})
export class CommonService {
  private categoryUrl = 'http://localhost:8080/categorias';
  private brandUrl = 'http://localhost:8080/marcas';

  constructor(private http: HttpClient) { }

  getCategories(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(this.categoryUrl);
  }

  getBrands(): Observable<Marca[]> {
    return this.http.get<Marca[]>(this.brandUrl);
  }
}
