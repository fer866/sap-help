import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { EMPTY, Observable } from 'rxjs';
import { take } from 'rxjs/operators';
import { CategoryApiService } from 'src/app/api-services/category-api.service';
import { TableApiService } from 'src/app/api-services/table-api.service';
import { Category } from 'src/app/entities/category';
import { Table } from 'src/app/entities/table';

@Component({
  selector: 'cjf-edit-table',
  templateUrl: './edit-table.component.html',
  styleUrls: ['./edit-table.component.scss']
})
export class EditTableComponent implements OnInit {
  table = new FormGroup({
    idCat: new FormControl(null, Validators.required),
    tableTxt: new FormControl(null, [Validators.required, Validators.minLength(3), Validators.maxLength(20)]),
    description: new FormControl(null, [Validators.required, Validators.minLength(5), Validators.maxLength(255)])
  });
  categories: Observable<Category[]> = EMPTY;

  constructor(
    private service: TableApiService,
    @Inject(MAT_DIALOG_DATA) public data: TableDialogData,
    private dialogRef: MatDialogRef<EditTableComponent>,
    private catService: CategoryApiService
  ) { }

  ngOnInit(): void {
    this.categories = this.catService.getCategories();
    if (this.data.table) {
      this.table.patchValue(this.data.table);
    }
  }

  onSubmit(): void {
    if (this.table.invalid) {
      this.table.markAsTouched();
      this.table.markAsDirty();
      return;
    }
    const value = this.table.value;
    if (this.data.table) {
      value.idTable = this.data.table.idTable;
      this.service.updateTable(value).pipe(take(1)).subscribe(t => this.onClose('ok'));
    } else {
      this.service.addTable(value).pipe(take(1)).subscribe(t => this.onClose('ok'));
    }
  }

  onClose(action: 'ok' | 'cancel' | 'error'): void {
    this.table.reset();
    this.dialogRef.close({ action: action } as TableDialogData);
  }

}

export class TableDialogData {
  action: 'ok' | 'cancel' | 'error' | undefined;
  table?: Table;
}