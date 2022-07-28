import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { Title } from '@angular/platform-browser';
import { EMPTY, Observable } from 'rxjs';
import { shareReplay, take, tap } from 'rxjs/operators';
import { slideToTop } from 'src/app/animations';
import { CategoryApiService } from 'src/app/api-services/category-api.service';
import { Category } from 'src/app/entities/category';
import { ConfirmData, ConfirmDialogComponent } from 'src/app/modules/confirm-dialog/confirm-dialog.component';
import { CategoryDialogData, EditCatalogComponent } from 'src/app/modules/edit-catalog/edit-catalog.component';

@Component({
  selector: 'cjf-catalogs',
  templateUrl: './catalogs.component.html',
  styleUrls: ['./catalogs.component.scss'],
  animations: [slideToTop]
})
export class CatalogsComponent implements OnInit {
  search = new FormControl(null);
  categories: Observable<Category[]> = EMPTY;
  noResults: boolean = false;
  pageSizeOptions: number[] = [10,20,30];
  pageSize: number = this.pageSizeOptions[0];
  startIndex: number = 0;
  endIndex: number = this.pageSize;

  constructor(
    private service: CategoryApiService,
    private dialog: MatDialog,
    private title: Title
  ) { }

  ngOnInit(): void {
    this.title.setTitle('Catálogos | SAP Help');
    this.getCategories();
  }

  private getCategories(): void {
    this.categories = this.service.getCategories().pipe(
      shareReplay(1),
      tap(c => c.length ? this.noResults = false : this.noResults = true, e => this.noResults = false)
    );
  }

  onAddCatalog(): void {
    const dialogRef = this.dialog.open(EditCatalogComponent, {
      data: {} as CategoryDialogData, disableClose: true
    });
    dialogRef.afterClosed().pipe(take(1)).subscribe((c: CategoryDialogData) => {
      if (c.action === 'ok') {
        this.getCategories();
      }
    });
  }

  onEditCatalog(cat: Category): void {
    const dialogRef = this.dialog.open(EditCatalogComponent, {
      data: { category: cat } as CategoryDialogData, disableClose: true
    });
    dialogRef.afterClosed().pipe(take(1)).subscribe((c: CategoryDialogData) => {
      if (c.action === 'ok') {
        this.getCategories();
      }
    });
  }

  onDeleteCatalog(cat: Category): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: `Eliminar ${cat.category}`,
        message: '¿Está seguro de eliminar la categoría?'
      } as ConfirmData
    });
    dialogRef.afterClosed().pipe(take(1)).subscribe((c: ConfirmData) => {
      if (c.action === 'confirm') {
        this.service.deleteCategory(cat.idCat || 0).pipe(take(1)).subscribe(d => this.getCategories());
      }
    });
  }

  onPageChange(e: PageEvent): void {
    this.startIndex = e.pageIndex * e.pageSize;
    this.endIndex = this.startIndex + e.pageSize;
  }

}
