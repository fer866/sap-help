import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanActivateChild, CanLoad, Route, Router, RouterStateSnapshot, UrlSegment, UrlTree } from '@angular/router';
import { interval, Observable } from 'rxjs';
import { delayWhen, map, take, tap } from 'rxjs/operators';
import { GuideComponent } from '../modules/dashboard/modules/guide/guide.component';
import { PhotoService } from '../services/photo.service';
import { TokenService } from '../services/token.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate, CanActivateChild, CanLoad {

  constructor(
    private token: TokenService,
    private router: Router,
    private photoService: PhotoService
  ) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree {
    return this.isAuthenticated(state.url);
  }

  canActivateChild(childRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree {
    return this.canActivate(childRoute, state);
  }

  canDeactivate(component: GuideComponent, currentRoute: ActivatedRouteSnapshot, currentState: RouterStateSnapshot, nextState?: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.photoService.show.pipe(
      take(1),
      tap(s => {
        if (s) {
          this.photoService.hideImage();
        }
      }),
      delayWhen(s => s ? interval(1000) : interval(0)),   //Duración total en :leave de animación
      map(_ => true)
    );
  }

  canLoad(route: Route, segments: UrlSegment[]): boolean | UrlTree {
    let url: string = '';
    if (segments.length > 0) {
      segments.forEach(s => {
        url += '/' + s.path;
      });
    } else {
      url = '/' + route.path || '';
    }
    return this.isAuthenticated(url);
  }

  private isAuthenticated(url: string | undefined): boolean | UrlTree {
    if (this.token.isAuthenticated()) {
      return true;
    } else {
      return this.router.createUrlTree(['/login'], { queryParams: { redirect: url } });
    }
  }
}
