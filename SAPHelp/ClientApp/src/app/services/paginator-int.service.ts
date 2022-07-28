import { Injectable } from '@angular/core';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PaginatorIntService implements MatPaginatorIntl {

  changes = new Subject<void>();
  itemsPerPageLabel: string = 'Registros por página';
  nextPageLabel: string = 'Siguiente página';
  previousPageLabel: string = 'Página anterior';
  firstPageLabel: string = 'Primera página';
  lastPageLabel: string = 'Última página';

  getRangeLabel(page: number, pageSize: number, length: number): string {
    if (length === 0) {
      return '0 - 0 de 0';
    }
    const from = (page * pageSize) + 1;
    const oper = (page + 1) * pageSize;
    const to = oper <= length ? oper : length;
    return `${from} - ${to} de ${length}`;
  }
}
