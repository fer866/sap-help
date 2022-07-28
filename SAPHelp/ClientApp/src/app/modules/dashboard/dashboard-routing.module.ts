import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from 'src/app/guards/auth.guard';
import { DashboardComponent } from './dashboard.component';

const routes: Routes = [
  {
    path: '',
    component: DashboardComponent,
    children: [
      {
        path: 'guides',
        loadChildren: () => import('./modules/guides/guides.module').then(m => m.GuidesModule),
        data: { b: 'guides' }
      },
      { 
        path: 'guides/:id',
        loadChildren: () => import('./modules/guide/guide.module').then(m => m.GuideModule),
        data: { b: 'guides/:id' },
        canDeactivate: [AuthGuard]
      },
      {
        path: 'transactions',
        loadChildren: () => import('./modules/transactions/transactions.module').then(m => m.TransactionsModule),
        data: { b: 'transactions' }
      },
      {
        path: 'tables',
        loadChildren: () => import('./modules/tables/tables.module').then(m => m.TablesModule),
        data: { b: 'tables' }
      },
      {
        path: 'catalogs',
        loadChildren: () => import('./modules/catalogs/catalogs.module').then(m => m.CatalogsModule),
        data: { b: 'catalogs' }
      },
      {
        path: 'admin',
        loadChildren: () => import('./modules/admin/admin.module').then(m => m.AdminModule),
        data: { b: 'admin' }
      },
      { path: '', redirectTo: '/dashboard/guides', pathMatch: 'full' }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule { }
