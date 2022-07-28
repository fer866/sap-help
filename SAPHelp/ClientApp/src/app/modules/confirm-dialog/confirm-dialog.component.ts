import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'cjf-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.scss']
})
export class ConfirmDialogComponent implements OnInit {

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: ConfirmData,
    public dialogRef: MatDialogRef<ConfirmDialogComponent>
  ) { }

  ngOnInit(): void {
  }

  onAction(action: 'confirm' | 'cancel'): void {
    this.data.action = action;
    this.dialogRef.close(this.data);
  }

}

export class ConfirmData {
  constructor (title: string, message: string) {
    this.title = title;
    this.message = message;
  }
  title?: string;
  message?: string;
  action?: 'confirm' | 'cancel';
}