import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from "@angular/forms";

import { TransactionsRoutingModule } from './transactions-routing.module';
import { TransactionsComponent } from './transactions.component';
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatListModule } from "@angular/material/list";
import { MatDividerModule } from "@angular/material/divider";
import { MatDialogModule } from "@angular/material/dialog";
import { ConfirmDialogModule } from 'src/app/modules/confirm-dialog/confirm-dialog.module';
import { MatTooltipModule } from '@angular/material/tooltip';
import { EditTransactionComponent } from './components/edit-transaction/edit-transaction.component';
import { MatSelectModule } from '@angular/material/select';
import { ClipboardModule } from '@angular/cdk/clipboard';


@NgModule({
  declarations: [
    TransactionsComponent,
    EditTransactionComponent
  ],
  imports: [
    CommonModule,
    TransactionsRoutingModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatListModule,
    MatDividerModule,
    MatDialogModule,
    ConfirmDialogModule,
    MatTooltipModule,
    MatSelectModule,
    ClipboardModule
  ]
})
export class TransactionsModule { }
