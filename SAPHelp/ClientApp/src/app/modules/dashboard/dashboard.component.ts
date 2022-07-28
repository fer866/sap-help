import { BreakpointObserver } from '@angular/cdk/layout';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatRadioChange } from '@angular/material/radio';
import { MatSidenav } from '@angular/material/sidenav';
import { Router, RouterOutlet } from '@angular/router';
import { EMPTY, Observable, Subject } from 'rxjs';
import { filter, finalize, map, shareReplay, take, takeUntil } from 'rxjs/operators';
import { routeTransition } from 'src/app/animations';
import { AccountApiService } from 'src/app/api-services/account-api.service';
import { UserInfo } from 'src/app/entities/user';
import { PhotoService } from 'src/app/services/photo.service';
import { ThemeOption, ThemeOptions, ThemeService } from 'src/app/services/theme.service';
import { TokenService } from 'src/app/services/token.service';
import { UserInfoService } from 'src/app/services/user-info.service';

@Component({
  selector: 'cjf-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  animations: [routeTransition]
})
export class DashboardComponent implements OnInit, OnDestroy {
  private unsubscribe$ = new Subject();
  isDark: Observable<boolean> = EMPTY;
  tablet: Observable<boolean> = EMPTY;
  mobile: boolean = false;
  themeOptions: ThemeOption[] = ThemeOptions;
  themeOption: Observable<string> = EMPTY;
  @ViewChild(MatSidenav) sidenav?: MatSidenav;
  account!: UserInfo;
  showImage: Observable<boolean> = EMPTY;
  isPanelOpen: boolean = false;

  constructor(
    private theme: ThemeService,
    private breakpoint: BreakpointObserver,
    private token: TokenService,
    private service: AccountApiService,
    private router: Router,
    private photoService: PhotoService,
    private userService: UserInfoService
  ) { }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  ngOnInit(): void {
    this.isDark = this.theme.isDark.pipe(shareReplay(1));
    this.themeOption = this.theme.option;
    const media$ = this.breakpoint.observe(['(max-width: 600px)', '(max-width: 992px)']);
    media$.pipe(map(o => o.breakpoints['(max-width: 600px)']), takeUntil(this.unsubscribe$)).subscribe(m => this.mobile = m);
    this.tablet = media$.pipe(map(o => o.breakpoints['(max-width: 992px)']), shareReplay(1));
    this.userService.getAccountInfo();
    this.userService.info.pipe(takeUntil(this.unsubscribe$)).subscribe(i => this.account = i);
    this.showImage = this.photoService.show;
  }

  getAnimationData(outlet: RouterOutlet) {
    return outlet && outlet.activatedRouteData && outlet.activatedRouteData.b;
  }

  themeChange(val: MatRadioChange): void {
    this.theme.setThemeOption(val.value);
  }

  logout(): void {
    this.service.logOff().pipe(take(1), finalize(() => {
      this.router.navigate(['/login']);
      this.token.logout();
    })).subscribe();
  }

  changeRouteMenu(): void {
    this.tablet.pipe(filter(t => t), take(1)).subscribe(_ => this.sidenav?.toggle());
  }

  toggleSidenav(): void {
    this.sidenav?.toggle();
  }

  getAccountName(name: string | undefined): string | undefined {
    if (!name) {
      return name;
    }
    const index = name.indexOf(' ', name.indexOf(' ') + 1);
    return name.slice(0, index);
  }
}
