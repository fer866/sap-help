import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, startWith, switchMap, take, takeUntil, tap } from 'rxjs/operators';
import { TransactionApiService } from 'src/app/api-services/transaction-api.service';
import { GroupTransactions, Transaction } from 'src/app/entities/transaction';
import { slideFromRight } from "src/app/animations";
import { EditTransactionComponent, TransactionDialog } from './components/edit-transaction/edit-transaction.component';
import { ConfirmData, ConfirmDialogComponent } from 'src/app/modules/confirm-dialog/confirm-dialog.component';
import { Title } from '@angular/platform-browser';
import { Clipboard } from '@angular/cdk/clipboard';
import { SnackbarService } from 'src/app/services/snackbar.service';

@Component({
  selector: 'cjf-transactions',
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.scss'],
  animations: [slideFromRight]
})
export class TransactionsComponent implements OnInit, OnDestroy {
  private unsubscribe$ = new Subject();
  search = new FormControl(null, Validators.minLength(2));
  transactions: GroupTransactions[] = [];
  noResults: boolean = false;
  edit: boolean = false;
  forceSearch: boolean = false;

  constructor(
    private service: TransactionApiService,
    private dialog: MatDialog,
    private title: Title,
    private clip: Clipboard,
    private snack: SnackbarService
  ) { }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  ngOnInit(): void {
    this.title.setTitle('Transacciones | SAP Help');
    this.search.valueChanges.pipe(
      distinctUntilChanged((x: string, y: string) => this.forceSearch ? false : x === y),
      debounceTime(1000),
      startWith(null),
      switchMap(s => {
        this.noResults = this.forceSearch = false;
        if (s && this.search.valid) {
          return this.service.getTransactions(s).pipe(tap(t => this.evalResult(t.length), e=> this.evalResult()));
        } else {
          return this.service.getRecentTransactions().pipe(tap(t => this.evalResult(t.length), e => this.evalResult()));
        }
      }),
      takeUntil(this.unsubscribe$)
    ).subscribe(t => this.transactions = t);
  }

  private evalResult(length?: number): void {
    this.noResults = length ? false : true;
  }

  onNewTransaction(): void {
    const dialogRef = this.dialog.open(EditTransactionComponent, {
      data: {} as TransactionDialog, disableClose: true
    });
    dialogRef.afterClosed().pipe(take(1)).subscribe((t: TransactionDialog) => {
      if (t.action === 'ok') {
        this.forceSearch = true;
        this.search.updateValueAndValidity({ emitEvent: true });
      }
    });
  }

  onEditTransaction(tx: Transaction): void {
    const dialogRef = this.dialog.open(EditTransactionComponent, {
      data: { transaction: tx } as TransactionDialog, disableClose: true
    });
    dialogRef.afterClosed().pipe(take(1)).subscribe((t: TransactionDialog) => {
      if (t.action === 'ok') {
        this.forceSearch = true;
        this.search.updateValueAndValidity({ emitEvent: true });
      }
    });
  }

  onDeleteTransaction(tx: Transaction): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Eliminar transacción',
        message: `¿Está seguro de eliminar la transacción ${tx.transactionTxt}?`
      } as ConfirmData
    });
    dialogRef.afterClosed().pipe(take(1)).subscribe((c: ConfirmData) => {
      if (c.action === 'confirm') {
        this.service.deleteTransaction(tx.idTransaction || 0).pipe(take(1)).subscribe(t => {
          this.forceSearch = true;
        this.search.updateValueAndValidity({ emitEvent: true });
        });
      }
    });
  }

  copyContent(text: string | undefined): void {
    if (text) {
      this.clip.copy(text);
      this.snack.open('Copiado al portapapeles', '👍', undefined, 2500);
    }
  }

}
