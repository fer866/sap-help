import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfirmDialogComponent } from './confirm-dialog.component';

import { MatButtonModule } from "@angular/material/button";
import { MatDialogModule } from "@angular/material/dialog";
import { UppercaseDirective } from './directives/uppercase.directive';

@NgModule({
  declarations: [
    ConfirmDialogComponent,
    UppercaseDirective
  ],
  imports: [
    CommonModule,
    MatButtonModule,
    MatDialogModule
  ],
  exports: [
    ConfirmDialogComponent,
    UppercaseDirective
  ]
})
export class ConfirmDialogModule { }
