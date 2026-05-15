import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/pages/login/login';
import { ForgotPasswordComponent } from './features/auth/pages/forgot-password/forgot-password';
import { DashboardComponent } from './features/dashboard/dashboard';
import { Inventory } from './features/inventory/inventory';
import { Reports } from './features/reports/reports';
import { CategoriaList } from './features/categorias/components/categoria-list/categoria-list';
import { Configuracion } from './features/configuracion/configuracion';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { 
    path: 'dashboard', 
    component: DashboardComponent,
    children: [
      { path: 'inventory', component: Inventory },
      { path: 'reports', component: Reports },
      { path: 'productos', loadComponent: () => import('./features/productos/components/product-list/product-list').then(m => m.ProductList) },
      { path: 'categorias', component: CategoriaList },
      { path: 'configuracion', component: Configuracion },
      { path: 'usuarios', loadComponent: () => import('./features/dashboard/usuarios/usuarios').then(m => m.UsuariosComponent) },
      { path: 'promociones', loadComponent: () => import('./features/dashboard/promociones/promociones').then(m => m.PromocionesComponent) },
      { path: '', redirectTo: 'productos', pathMatch: 'full' }
    ]
  },
  { 
    path: 'tienda', 
    loadComponent: () => import('./features/store/pages/store/store').then(m => m.StoreComponent) 
  },
  {
    path: 'mis-compras',
    loadComponent: () => import('./features/store/pages/mis-compras/mis-compras').then(m => m.MisComprasComponent)
  },
  { path: '', redirectTo: 'login', pathMatch: 'full' }
];