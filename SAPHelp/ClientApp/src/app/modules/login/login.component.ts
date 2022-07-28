import { BreakpointObserver } from '@angular/cdk/layout';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { EMPTY, Observable, Subject } from 'rxjs';
import { map, shareReplay, takeUntil } from 'rxjs/operators';
import { AccountApiService } from 'src/app/api-services/account-api.service';
import { PasswordRegex } from 'src/app/entities/user';
import { ThemeService } from 'src/app/services/theme.service';
import { TokenService } from 'src/app/services/token.service';

@Component({
  selector: 'cjf-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {
  private unsubscribe$ = new Subject();
  loginForm = new FormGroup({
    username: new FormControl(null, [Validators.required, Validators.minLength(3), Validators.maxLength(10)]),
    password: new FormControl(null, [Validators.required, Validators.minLength(8), Validators.maxLength(16), Validators.pattern(PasswordRegex)]),
    repeatPassword: new FormControl({ disabled: true, value: null })
  }, { validators: this.matchPasswords });
  showPassword: boolean = false;
  newPassword: boolean = false;
  mobile: Observable<boolean> = EMPTY;
  isDark: Observable<boolean> = EMPTY;

  constructor(
    private breakpoint: BreakpointObserver,
    private service: AccountApiService,
    private token: TokenService,
    private route: ActivatedRoute,
    private router: Router,
    private theme: ThemeService,
    private title: Title
  ) { }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  ngOnInit(): void {
    this.title.setTitle('Kardex | CJF');
    this.mobile = this.breakpoint.observe('(max-width: 768px)').pipe(map(o => o.matches), shareReplay(1));
    this.isDark = this.theme.isDark.pipe(shareReplay(1));
  }

  matchPasswords(ctrl: AbstractControl): {} | null {
    const password = ctrl.get('password');
    const repeatPassword = ctrl.get('repeatPassword');
    if (repeatPassword?.disabled) {
      return null;
    }
    if (password?.value !== repeatPassword?.value) {
      repeatPassword?.setErrors({ notSame: true });
      return { notSame: true };
    } else {
      return null;
    }
  }

  onLoginSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAsTouched();
      return;
    }

    if (!this.newPassword) {
      this.service.auth(this.loginForm.value).pipe(takeUntil(this.unsubscribe$)).subscribe(l => {
        this.onSuccess(l);
      }, error => {
        if (error?.error?.requiresAction) {
          const username = this.loginForm.value.username;
          this.loginForm.reset({ username: username });
          this.loginForm.controls.username.disable();
          this.loginForm.controls.repeatPassword.enable();
          this.newPassword = true;
        } else {
          this.loginForm.controls.password.reset();
        }
      });
    } else {
      this.service.createNewPassword(this.loginForm.getRawValue()).pipe(takeUntil(this.unsubscribe$)).subscribe(p => {
        this.onSuccess(p);
      });
    }
  }

  onSuccess(token: any): void {
    this.loginForm.reset();
    this.loginForm.controls.repeatPassword.disable();
    this.showPassword = this.newPassword = false;
    this.token.setToken(token);
    if (this.route.snapshot.queryParamMap.has('redirect')) {
      const param = this.route.snapshot.queryParamMap.get('redirect');
      this.router.navigate([`/${param}`]);
    } else {
      this.router.navigate(['/dashboard']);
    }
  }

}
