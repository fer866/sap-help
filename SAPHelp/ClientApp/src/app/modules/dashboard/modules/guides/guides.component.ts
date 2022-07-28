import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, startWith, switchMap, takeUntil, tap } from 'rxjs/operators';
import { slideToTop } from 'src/app/animations';
import { GuideApiService } from 'src/app/api-services/guide-api.service';
import { GroupGuides } from 'src/app/entities/guide';

@Component({
  selector: 'cjf-guides',
  templateUrl: './guides.component.html',
  styleUrls: ['./guides.component.scss'],
  animations: [slideToTop]
})
export class GuidesComponent implements OnInit, OnDestroy {
  private unsubscribe$ = new Subject();
  search = new FormControl(null, Validators.minLength(2));
  guides: GroupGuides[] = [];
  noResults: boolean = false;

  constructor(
    private service: GuideApiService,
    private title: Title
  ) { }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  ngOnInit(): void {
    this.title.setTitle('Guías | SAP Help');
    this.search.valueChanges.pipe(
      distinctUntilChanged(),
      debounceTime(1000),
      startWith(null),
      switchMap(v => {
        this.noResults = false;
        if (v && this.search.valid) {
          return this.service.getGuides(v).pipe(tap(n => this.noResults = n.length ? false : true, e => this.noResults = true));
        } else {
          return this.service.getRecentGuides().pipe(tap(n => this.noResults = n.length ? false : true, e => this.noResults = true));
        }
      }),
      takeUntil(this.unsubscribe$)
    ).subscribe(g => this.guides = g);
  }

}
