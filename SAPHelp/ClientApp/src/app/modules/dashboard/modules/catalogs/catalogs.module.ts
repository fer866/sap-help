import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from "@angular/forms";

import { CatalogsRoutingModule } from './catalogs-routing.module';
import { CatalogsComponent } from './catalogs.component';
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatPaginatorModule } from "@angular/material/paginator";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatDialogModule } from "@angular/material/dialog";
import { ConfirmDialogModule } from 'src/app/modules/confirm-dialog/confirm-dialog.module';
import { SearchPipe } from './pipes/search.pipe';
import { EditCatalogModule } from 'src/app/modules/edit-catalog/edit-catalog.module';


@NgModule({
  declarations: [
    CatalogsComponent,
    SearchPipe
  ],
  imports: [
    CommonModule,
    CatalogsRoutingModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatPaginatorModule,
    MatTooltipModule,
    MatDialogModule,
    ConfirmDialogModule,
    EditCatalogModule
  ]
})
export class CatalogsModule { }
