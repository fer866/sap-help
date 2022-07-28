import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TokenService {
  private readonly _key: string = '_tksh';
  private _authenticationChanged = new BehaviorSubject<boolean>(this.isAuthenticated());
  isAuthenticationChanged = this._authenticationChanged.asObservable();

  constructor() { }

  isAuthenticated(): boolean {
    const token = localStorage.getItem(this._key);
    return !(token === undefined ||
            token === null ||
            token === 'undefined' ||
            token === 'null' ||
            token === '');
  }

  getToken(): string {
    const token = localStorage.getItem(this._key);
    if (token === undefined ||
        token === null ||
        token === 'undefined' ||
        token === 'null' ||
        token === '') {
          return '';
    }
    return token;
  }

  private setStorageToken(value: any): void {
    localStorage.setItem(this._key, value);
    this._authenticationChanged.next(this.isAuthenticated());
  }

  setToken(data: any): void {
    this.setStorageToken(data.token);
  }

  failToken(): void {
    localStorage.removeItem(this._key);
  }

  logout(): void {
    localStorage.removeItem(this._key);
  }
}
