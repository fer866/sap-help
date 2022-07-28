import { Clipboard } from '@angular/cdk/clipboard';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { EMPTY, Observable, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, startWith, switchMap, take, takeUntil, tap } from 'rxjs/operators';
import { slideToTop } from 'src/app/animations';
import { TableApiService } from 'src/app/api-services/table-api.service';
import { GroupTables, Table } from 'src/app/entities/table';
import { ConfirmData, ConfirmDialogComponent } from 'src/app/modules/confirm-dialog/confirm-dialog.component';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { EditTableComponent, TableDialogData } from './components/edit-table/edit-table.component';

@Component({
  selector: 'cjf-tables',
  templateUrl: './tables.component.html',
  styleUrls: ['./tables.component.scss'],
  animations: [slideToTop]
})
export class TablesComponent implements OnInit, OnDestroy {
  private unsubscribe$ = new Subject();
  search = new FormControl(null, Validators.minLength(2));
  edit: boolean = false;
  tables: GroupTables[] = [];
  noResults: boolean = false;
  forceSearch: boolean = false;

  constructor(
    private service: TableApiService,
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
    this.title.setTitle('Tablas | SAP Help');
    this.search.valueChanges.pipe(
      distinctUntilChanged((x: string, y:string) => this.forceSearch ? false : x === y),
      debounceTime(1000),
      startWith(null),
      switchMap(v => {
        this.noResults = this.forceSearch = false;
        if (v && this.search.valid) {
          return this.service.getTables(v).pipe(tap(t => this.evalResult(t.length), e => this.evalResult()));
        } else {
          return this.service.getRecentTables().pipe(tap(t => this.evalResult(t.length), e => this.evalResult()));
        }
      }),
      takeUntil(this.unsubscribe$)
    ).subscribe(t => this.tables = t);
  }

  private evalResult(length?: number): void {
    this.noResults = length ? false : true;
  }

  onNewTable(): void {
    const dialogRef = this.dialog.open(EditTableComponent, {
      data: {} as TableDialogData, disableClose: true
    });
    dialogRef.afterClosed().pipe(take(1)).subscribe((t: TableDialogData) => {
      if (t.action === 'ok') {
        this.forceSearch = true;
        this.search.updateValueAndValidity({ emitEvent: true });
      }
    });
  }

  onEditTable(table: Table): void {
    const dialogRef = this.dialog.open(EditTableComponent, {
      data: { table: table } as TableDialogData, disableClose: true
    });
    dialogRef.afterClosed().pipe(take(1)).subscribe((t: TableDialogData) => {
      if (t.action === 'ok') {
        this.forceSearch = true;
        this.search.updateValueAndValidity({ emitEvent: true });
      }
    });
  }

  onDeleteTable(table: Table): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: `Eliminar ${table.tableTxt}`,
        message: '¿Está seguro de eliminar la tabla?'
      } as ConfirmData
    });
    dialogRef.afterClosed().pipe(take(1)).subscribe((c: ConfirmData) => {
      if (c.action === 'confirm') {
        this.service.deleteTable(table.idTable || 0).pipe(take(1)).subscribe(t => {
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
