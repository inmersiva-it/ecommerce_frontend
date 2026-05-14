import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/pages/login/login';
import { DashboardComponent } from './features/dashboard/dashboard';
import { Inventory } from './features/inventory/inventory';
import { Reports } from './features/reports/reports';
import { CategoriaList } from './features/categorias/components/categoria-list/categoria-list';
import { Configuracion } from './features/configuracion/configuracion';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { 
    path: 'dashboard', 
    component: DashboardComponent,
    children: [
      { path: 'inventory', component: Inventory },
      { path: 'reports', component: Reports },
      { path: 'productos', loadComponent: () => import('./features/productos/components/product-list/product-list').then(m => m.ProductList) },
      { path: 'categorias', component: CategoriaList },
      { path: 'configuracion', component: Configuracion },
      { path: '', redirectTo: 'productos', pathMatch: 'full' }
    ]
  },
  { 
    path: 'tienda', 
    loadComponent: () => import('./features/store/pages/store/store').then(m => m.StoreComponent) 
  },
  { path: '', redirectTo: 'login', pathMatch: 'full' }
];