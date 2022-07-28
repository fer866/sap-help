import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminComponent } from './admin.component';

const routes: Routes = [
  { path: '', component: AdminComponent },
  {
    path: 'user',
    loadChildren: () => import('../admin-user/admin-user.module').then(m => m.AdminUserModule),
    data: { c: 'user' }
  },
  {
    path: 'user/:username',
    loadChildren: () => import('../admin-user/admin-user.module').then(m => m.AdminUserModule),
    data: { c: 'user/:username' }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
