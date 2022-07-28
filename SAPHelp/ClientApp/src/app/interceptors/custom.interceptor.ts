import { Inject, Injectable, OnDestroy } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { EMPTY, Observable, Subject, throwError } from 'rxjs';
import { SnackbarService } from '../services/snackbar.service';
import { Router } from '@angular/router';
import { TokenService } from '../services/token.service';
import { DOCUMENT } from '@angular/common';
import { LoaderService } from '../services/loader.service';
import { catchError, finalize, switchMap, takeUntil, tap } from 'rxjs/operators';
import { AccountApiService } from '../api-services/account-api.service';

@Injectable()
export class CustomInterceptor implements HttpInterceptor, OnDestroy {
  private unsubscribe$ = new Subject();
  refreshTokenInProgress: boolean = false;
  private _tokenRefreshed = new Subject();
  tokenRefreshed = this._tokenRefreshed.asObservable();

  constructor(
    private snack: SnackbarService,
    private service: AccountApiService,
    private router: Router,
    private token: TokenService,
    @Inject(DOCUMENT) private doc: Document,
    private loader: LoaderService
  ) {}

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  private authHeader(request: HttpRequest<any>): HttpRequest<any> {
    const token = this.token.getToken();
    if (token) {
      return request.clone({
        setHeaders: {
          'Authorization': `Bearer ${token}`
        }
      });
    }
    return request;
  }

  private refreshToken(): Observable<any> {
    if (this.refreshTokenInProgress) {
      return new Observable(observer => {
        this.tokenRefreshed.pipe(takeUntil(this.unsubscribe$)).subscribe(() => {
          observer.next();
          observer.complete();
        });
      });
    } else {
      this.refreshTokenInProgress = true;
      return this.service.refreshToken().pipe(
        tap(t => {
          this.refreshTokenInProgress = false;
          this.token.setToken(t);
          this._tokenRefreshed.next();
        }),
        catchError(() => {
          this.refreshTokenInProgress = false;
          this.logout();
          return EMPTY;
        })
      );
    }
  }

  private logout(): void {
    this.token.logout();
    this.router.navigate(['/login']);
  }

  private handleResponseError(error: HttpErrorResponse, request?: HttpRequest<any>, next?: HttpHandler): any {
    switch (error.status) {
      case 400: //Business error
        if (error.error?.message) {
          if (error.error?.persist) {
            this.snack.open(error.error.message, undefined, true);
          } else {
            this.snack.open(error.error.message);
          }
        }
        break;
      case 401: //Invalid Token error
        return this.refreshToken().pipe(
          switchMap(() => {
            if (request && next) {
              request = this.authHeader(request);
              return next.handle(request);
            }
            return EMPTY;
          }),
          catchError(e => {
            if (e.status !== 401) {
              return this.handleResponseError(e);
            } else {
              this.logout();
            }
          })
        );
      case 403: //Access denied error
        this.snack.open('No se completo la petición porque el acceso está negado');
        if (!this.token.isAuthenticated()) {
          this.logout();
        }
        break;
      case 404: //Not Found
        this.snack.open(error.error?.message ? error.error.message : 'No fué posible realizar la solicitud');
        break;
      case 429: //Too Many Requests
          const seconds = Number(error.headers.get('Retry-After'));
          let minutes: string = '';
          if (seconds > 60) {
            minutes = Math.round(seconds / 60) + ' minuto(s)';
          } else {
            minutes = seconds + ' segundos';
          }
          this.snack.open(error.error?.message || `La cuenta se ha bloqueado, intenta dentro de ${minutes}`);
          break;
      case 500: //Internal Server error
        this.snack.open('¡Ops! Algo salió mal, porfavor intenta más tarde');
        break;
      case 503: //Maintenance error
        this.snack.open('Lamentamos el inconveniente pero estamos mejorando la página');
        this.router.navigate(['/maintenance']);
        break;
    }
    return throwError(error);
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<any> {
    request = this.authHeader(request);
    this.loader.change(true);
    const baseUrl = this.doc.getElementsByTagName('base')[0].href;
    request = request.clone({ url: `${baseUrl}${request.url}` });
    
    return next.handle(request).pipe(
      finalize(() => {
        this.loader.change(false);
      }),
      catchError(error => {
        return this.handleResponseError(error, request, next);
      })
    );
  }
}
