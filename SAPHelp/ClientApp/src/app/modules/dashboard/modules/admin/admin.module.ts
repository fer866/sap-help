import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from "@angular/forms";

import { AdminRoutingModule } from './admin-routing.module';
import { AdminComponent } from './admin.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from "@angular/material/sort";
import { ConfirmDialogModule } from 'src/app/modules/confirm-dialog/confirm-dialog.module';
import { SearchPipe } from './pipes/search.pipe';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from "@angular/material/badge";
import { BinnacleComponent } from './components/binnacle/binnacle.component';
import { MatDialogModule } from '@angular/material/dialog';
import { CustomDateModule } from 'src/app/modules/custom-date/custom-date.module';
import { FilterModule } from 'src/app/modules/filter/filter.module';


@NgModule({
  declarations: [
    AdminComponent,
    SearchPipe,
    BinnacleComponent
  ],
  imports: [
    CommonModule,
    AdminRoutingModule,
    ReactiveFormsModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatTooltipModule,
    MatPaginatorModule,
    ConfirmDialogModule,
    MatSortModule,
    MatMenuModule,
    MatBadgeModule,
    MatDialogModule,
    CustomDateModule,
    FilterModule
  ]
})
export class AdminModule { }
