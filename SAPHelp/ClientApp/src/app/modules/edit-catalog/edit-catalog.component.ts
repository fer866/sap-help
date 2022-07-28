import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { take } from 'rxjs/operators';
import { CategoryApiService } from 'src/app/api-services/category-api.service';
import { Category } from 'src/app/entities/category';

@Component({
  selector: 'cjf-edit-catalog',
  templateUrl: './edit-catalog.component.html',
  styleUrls: ['./edit-catalog.component.scss']
})
export class EditCatalogComponent implements OnInit {
  category = new FormGroup({
    category: new FormControl(null, [Validators.required, Validators.minLength(5), Validators.maxLength(60)])
  });

  constructor(
    private service: CategoryApiService,
    @Inject(MAT_DIALOG_DATA) public data: CategoryDialogData,
    private dialogRef: MatDialogRef<EditCatalogComponent>
  ) { }

  ngOnInit(): void {
    if (this.data.category) {
      this.category.setValue({ category: this.data.category.category });
    }
  }

  onSubmit(): void {
    if (this.category.invalid) {
      this.category.markAsDirty();
      this.category.markAsTouched();
      return;
    }
    const value = this.category.value;
    if (this.data.category) {
      value.idCat = this.data.category.idCat;
      this.service.updateCategory(value).pipe(take(1)).subscribe(c => this.onClose('ok'));
    } else {
      this.service.addCategory(value).pipe(take(1)).subscribe(c => this.onClose('ok'));
    }
  }

  onClose(action: 'ok' | 'cancel' | 'error'): void {
    this.category.reset();
    this.dialogRef.close({ action: action } as CategoryDialogData);
  }

}

export class CategoryDialogData {
  action: 'ok' | 'cancel' | 'error' | undefined;
  category?: Category;
}