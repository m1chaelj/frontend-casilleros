import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { EstadoSolicitudComponent } from './estado-solicitud/estado-solicitud.component';
import { PanelCoordinadorComponent } from './panel-coordinador/panel-coordinador.component';
import { authGuard } from './guards/auth.guard';
import { roleGuard } from './guards/role.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { 
    path: 'estado-solicitud', 
    component: EstadoSolicitudComponent,
    canActivate: [authGuard] 
  },
  { 
    path: 'coordinador', 
    component: PanelCoordinadorComponent,
    canActivate: [authGuard, roleGuard],
    data: { role: 'coordinador' }
  },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' }
];