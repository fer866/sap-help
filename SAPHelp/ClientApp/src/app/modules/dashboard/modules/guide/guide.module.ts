import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from "@angular/forms";

import { GuideRoutingModule } from './guide-routing.module';
import { GuideComponent } from './guide.component';
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatExpansionModule } from "@angular/material/expansion";
import { MatCardModule } from "@angular/material/card";
import { MatChipsModule } from "@angular/material/chips";
import { MatSelectModule } from "@angular/material/select";
import { MatDialogModule } from "@angular/material/dialog";
import { DragDropModule } from "@angular/cdk/drag-drop";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatRippleModule } from "@angular/material/core";
import { ConfirmDialogModule } from 'src/app/modules/confirm-dialog/confirm-dialog.module';
import { StepEditComponent } from './components/step-edit/step-edit.component';
import { ClipboardModule } from "@angular/cdk/clipboard";


@NgModule({
  declarations: [
    GuideComponent,
    StepEditComponent
  ],
  imports: [
    CommonModule,
    GuideRoutingModule,
    ReactiveFormsModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatExpansionModule,
    MatCardModule,
    MatChipsModule,
    MatSelectModule,
    MatDialogModule,
    DragDropModule,
    MatTooltipModule,
    MatRippleModule,
    ConfirmDialogModule,
    ClipboardModule
  ]
})
export class GuideModule { }
