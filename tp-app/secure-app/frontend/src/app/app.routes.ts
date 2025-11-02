import { Routes } from '@angular/router';
import { LoginComponent } from './shared/auth/login/login';
import { HomeComponent } from './home/home';
import { AdminComponent } from './admin/admin/admin';
import { authGuard } from './shared/auth/auth-guard';
import { adminGuard } from './admin/admin-guard';

export const routes: Routes = [
 { path: 'login', component: LoginComponent },
 { path: 'home', component: HomeComponent, canActivate:[authGuard] },
 { path: 'admin', component: AdminComponent, canActivate:[authGuard, adminGuard] },
 { path: '', pathMatch: 'full', redirectTo: 'home' },
 { path: '**', redirectTo: 'home' },
]
