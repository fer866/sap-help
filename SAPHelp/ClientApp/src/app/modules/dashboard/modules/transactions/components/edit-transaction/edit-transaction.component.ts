import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { EMPTY, Observable } from 'rxjs';
import { take } from 'rxjs/operators';
import { CategoryApiService } from 'src/app/api-services/category-api.service';
import { TransactionApiService } from 'src/app/api-services/transaction-api.service';
import { Category } from 'src/app/entities/category';
import { Transaction } from 'src/app/entities/transaction';

@Component({
  selector: 'cjf-edit-transaction',
  templateUrl: './edit-transaction.component.html',
  styleUrls: ['./edit-transaction.component.scss']
})
export class EditTransactionComponent implements OnInit {
  transaction = new FormGroup({
    idCat: new FormControl(null, Validators.required),
    transactionTxt: new FormControl(null, [Validators.required, Validators.minLength(3), Validators.maxLength(25)]),
    description: new FormControl(null, [Validators.required, Validators.minLength(5), Validators.maxLength(255)])
  });
  categories: Observable<Category[]> = EMPTY;

  constructor(
    private service: TransactionApiService,
    private catService: CategoryApiService,
    @Inject(MAT_DIALOG_DATA) public data: TransactionDialog,
    private dialogRef: MatDialogRef<EditTransactionComponent>
  ) { }

  ngOnInit(): void {
    this.categories = this.catService.getCategories();
    if (this.data.transaction) {
      this.transaction.patchValue(this.data.transaction);
    }
  }

  onSubmit(): void {
    if (this.transaction.invalid) {
      this.transaction.markAsTouched();
      this.transaction.markAsDirty();
      return;
    }
    const value = this.transaction.value;
    if (this.data.transaction) {
      value.idTransaction = this.data.transaction.idTransaction;
      this.service.updateTransaction(value).pipe(take(1)).subscribe(u => this.onCloseDialog('ok'));
    } else {
      this.service.addTransaction(value).pipe(take(1)).subscribe(a => this.onCloseDialog('ok'));
    }
  }

  onCloseDialog(action: 'ok' | 'cancel' | 'error'): void {
    this.transaction.reset();
    this.dialogRef.close({ action: action } as TransactionDialog);
  }

}

export class TransactionDialog {
  action: 'ok' | 'cancel' | 'error' | undefined;
  transaction?: Transaction;
}