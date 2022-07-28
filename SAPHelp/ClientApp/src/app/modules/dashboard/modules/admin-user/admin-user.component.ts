import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { EMPTY, Observable, of } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, filter, switchMap, take, tap } from 'rxjs/operators';
import { AccountApiService } from 'src/app/api-services/account-api.service';
import { Employee } from 'src/app/entities/user';
import { SnackbarService } from 'src/app/services/snackbar.service';

@Component({
  selector: 'cjf-admin-user',
  templateUrl: './admin-user.component.html',
  styleUrls: ['./admin-user.component.scss']
})
export class AdminUserComponent implements OnInit {
  searchForm = new FormControl(null, [Validators.required, Validators.minLength(3)]);
  userForm = new FormGroup({
    username: new FormControl(null, [Validators.required, Validators.minLength(3)]),
    name: new FormControl(null, Validators.required),
    resetRequest: new FormControl(true),
    active: new FormControl(true),
    userRole: new FormControl(null, Validators.required)
  });
  listEmployee: Observable<Employee[]> = EMPTY;
  edit: boolean = false;
  noResults: boolean = false;

  constructor(
    private service: AccountApiService,
    private router: Router,
    private title: Title,
    private route: ActivatedRoute,
    private snack: SnackbarService
  ) { }

  ngOnInit(): void {
    this.route.paramMap.pipe(take(1)).subscribe(p => {
      if (p.has('username')) {
        const username = p.get('username') || '';
        this.service.getUserAccount(username).pipe(take(1)).subscribe(u => {
          const exp = Number(u.username.substring(1)) || 0;
          this.searchForm.setValue({ exp: exp, name: u.name } as Employee);
          this.searchForm.disable();
          this.userForm.patchValue(u);
          this.edit = true;
          this.title.setTitle(`Editar usuario ${u.username} | Kardex CJF`);
        })
      } else {
        this.title.setTitle('Agregar usuario | SAP Help');
      }
    });

    this.listEmployee = this.searchForm.valueChanges.pipe(
      filter(v => this.searchForm.enabled),
      filter(v => typeof v === 'string' || v === null || v === undefined),
      distinctUntilChanged(),
      debounceTime(1000),
      switchMap((text: string) => {
        if (text && this.searchForm.valid) {
          return this.service.searchEmployees(text).pipe(tap(e => this.noResults = e.length <= 0), catchError(() => of([])));
        } else {
          this.noResults = false;
          return of([]);
        }
      })
    );
  }

  onResetSearch(): void {
    this.searchForm.reset();
    this.searchForm.enable();
    this.userForm.patchValue({ name: null, username: null });
  }

  onSearchEmployee(): void {
    if (this.searchForm.invalid) {
      this.searchForm.markAsTouched();
      this.searchForm.markAsDirty();
      return;
    }
    const value = this.searchForm.value.search;
    this.listEmployee = this.service.searchEmployees(value);
  }

  displayFn(emp: Employee): string {
    return emp ? 'U' + emp.exp : '';
  }

  onEmployeeSelected(e: MatAutocompleteSelectedEvent): void {
    const value: Employee = e.option.value;
    this.userForm.patchValue({ username: 'U' + value.exp, name: value.name });
    this.searchForm.disable();
  }

  onResetForm(): void {
    this.searchForm.reset();
    this.searchForm.enable();
    this.userForm.reset();
  }

  onSubmit(): void {
    if (this.searchForm.invalid) {
      this.searchForm.markAsTouched();
      this.searchForm.markAsDirty();
    }

    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      this.userForm.markAsDirty();
    }

    if (this.searchForm.invalid || this.userForm.invalid) {
      return;
    }
    const value = this.userForm.value;

    if (this.edit) {
      this.service.updateAccount(value).pipe(take(1)).subscribe(_ => {
        this.snack.open('Listo! se guardaron los cambios');
        this.router.navigate(['/dashboard/admin']);
      });
    } else {
      this.service.addAccount(value).pipe(take(1)).subscribe(_ => {
        this.snack.open(`Agregaste a ${value.name}`, 'Listo!');
        this.router.navigate(['/dashboard/admin']);
      });
    }
  }

}
