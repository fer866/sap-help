import { Injectable } from '@angular/core';
import { ReplaySubject } from 'rxjs';
import { take } from 'rxjs/operators';
import { AccountApiService } from '../api-services/account-api.service';
import { UserInfo } from '../entities/user';

@Injectable({
  providedIn: 'root'
})
export class UserInfoService {
  private _info = new ReplaySubject<UserInfo>(1);
  info = this._info.asObservable();

  constructor(private service: AccountApiService) { }

  getAccountInfo(): void {
    this.service.getAccountInfo().pipe(take(1)).subscribe(a => {
      this._info.next(a);
    });
  }
}
