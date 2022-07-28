import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from "@angular/forms";

import { TablesRoutingModule } from './tables-routing.module';
import { TablesComponent } from './tables.component';
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatCardModule } from "@angular/material/card";
import { MatDividerModule } from "@angular/material/divider";
import { MatDialogModule } from "@angular/material/dialog";
import { ConfirmDialogModule } from 'src/app/modules/confirm-dialog/confirm-dialog.module';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from "@angular/material/select";
import { EditTableComponent } from './components/edit-table/edit-table.component';
import { ClipboardModule } from '@angular/cdk/clipboard';


@NgModule({
  declarations: [
    TablesComponent,
    EditTableComponent
  ],
  imports: [
    CommonModule,
    TablesRoutingModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatCardModule,
    MatDividerModule,
    MatDialogModule,
    ConfirmDialogModule,
    MatTooltipModule,
    MatSelectModule,
    ClipboardModule
  ]
})
export class TablesModule { }
