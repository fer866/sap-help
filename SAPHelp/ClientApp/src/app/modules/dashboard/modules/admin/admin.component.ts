import { BreakpointObserver } from '@angular/cdk/layout';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { Title } from '@angular/platform-browser';
import { EMPTY, Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { slideToTop } from 'src/app/animations';
import { AccountApiService } from 'src/app/api-services/account-api.service';
import { SortOption } from 'src/app/entities/category';
import { compare, UserAccount } from 'src/app/entities/user';
import { ConfirmData, ConfirmDialogComponent } from 'src/app/modules/confirm-dialog/confirm-dialog.component';
import { BinnacleComponent, BinnacleData } from './components/binnacle/binnacle.component';

@Component({
  selector: 'cjf-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss'],
  animations: [slideToTop]
})
export class AdminComponent implements OnInit {
  users: UserAccount[] = [];
  search = new FormControl(null);
  pageSizeOptions: number[] = [10,20,30];
  pageSize: number = this.pageSizeOptions[0];
  startIndex: number = 0;
  endIndex: number = this.pageSize;
  @ViewChild(MatSort) userSort?: MatSort;
  mobile: Observable<boolean> = EMPTY;
  sortOptions: SortOption[] = [
    { option: 'username', name: 'Usuario' },
    { option: 'name', name: 'Nombre' },
    { option: 'created', name: 'Fecha de alta' },
    { option: 'lastAccess', name: 'Último acceso' },
    { option: 'userRole', name: 'Rol' }
  ];

  constructor(
    private service: AccountApiService,
    private dialog: MatDialog,
    private title: Title,
    private observer: BreakpointObserver
  ) { }

  ngOnInit(): void {
    this.title.setTitle('Admin. Usuarios | SAP Help');
    this.mobile = this.observer.observe('(max-width: 600px)').pipe(map(o => o.matches));
    this.getUsers();
  }

  getUsers(): void {
    this.service.getUsers().pipe(take(1)).subscribe(u => {
      this.users = u;
      if (this.userSort && this.userSort.active) {
        this.sortData({ active: this.userSort.active, direction: this.userSort.direction });
      }
    });
  }

  onPageChange(e: PageEvent): void {
    this.startIndex = e.pageIndex * e.pageSize;
    this.endIndex = this.startIndex + e.pageSize;
  }

  onDeleteUser(user: UserAccount): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent,
      { data: new ConfirmData('Eliminar usuario', `¿Estás seguro de eliminar a ${user.name}?`) }
    );
    dialogRef.afterClosed().pipe(take(1)).subscribe((d: ConfirmData) => {
      if (d?.action === 'confirm') {
        this.service.deleteAccount(user.username || '').pipe(take(1)).subscribe(d => this.getUsers());
      }
    });
  }

  sortData(sort: Sort): void {
    const data = this.users.slice();
    if (!sort.active || sort.direction === '') {
      this.users = data.sort((a, b) => compare(a.name || '', b.name || '', true));
      return;
    }

    this.users = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'username': return compare(a.username || '', b.username || '', isAsc);
        case 'name': return compare(a.name || '', b.name || '', isAsc);
        case 'created': return compare(a.created || '', b.created || '', isAsc);
        case 'lastAccess': return compare(a.lastAccess || '', b.lastAccess || '', isAsc);
        case 'userRole': return compare(a.userRole || '', b.userRole || '', isAsc);
        default: return 0;
      }
    });
  }

  sortFromMenu(option: string): void {
    if (!this.userSort) {
      return;
    }
    const sortable = this.userSort.sortables.get(option) || { disableClear: false, id: option, start: 'asc' };
    const nextDir = this.userSort.getNextSortDirection(sortable);
    if (this.userSort.active === option && nextDir === '') {
      this.userSort.sort({ id: '', disableClear: false, start: 'asc' });
    } else {
      this.userSort.sort(sortable);
    }
  }

  showBinnacle(u: UserAccount): void {
    this.service.getUserBinnacle(u.username).pipe(take(1)).subscribe(b => {
      this.dialog.open(BinnacleComponent, { data: { name: u.name, binnacle: b } as BinnacleData });
    });
  }
}
