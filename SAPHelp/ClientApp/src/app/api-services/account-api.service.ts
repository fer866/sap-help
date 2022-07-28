import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Binnacle, Employee, UserAccount, UserInfo } from '../entities/user';

@Injectable({
  providedIn: 'root'
})
export class AccountApiService {
  private header: HttpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

  constructor(private http: HttpClient) { }

  auth(body: any): Observable<any> {
    return this.http.post<any>('api/account', JSON.stringify(body), { headers: this.header });
  }

  addAccount(user: any): Observable<any> {
    return this.http.put<any>('api/account', JSON.stringify(user), { headers: this.header });
  }

  updateAccount(user: any): Observable<any> {
    return this.http.patch<any>('api/account', JSON.stringify(user), { headers: this.header });
  }

  deleteAccount(user: string): Observable<any> {
    return this.http.delete<any>(`api/account/${user}`, { headers: this.header });
  }

  refreshToken(): Observable<any> {
    return this.http.post<any>('api/account/refreshToken', null, { headers: this.header });
  }

  logOff(): Observable<any> {
    return this.http.post<any>('api/account/logOff', null, { headers: this.header });
  }

  createNewPassword(body: any): Observable<any> {
    return this.http.post<any>('api/account/createNewPassword', JSON.stringify(body), { headers: this.header });
  }

  getAccountInfo(): Observable<UserInfo> {
    return this.http.get<UserInfo>('api/account', { headers: this.header });
  }

  getUserAccount(username: string): Observable<UserAccount> {
    return this.http.get<UserAccount>(`api/account/getAccount/${username}`, { headers: this.header });
  }

  getUsers(): Observable<UserAccount[]> {
    return this.http.get<UserAccount[]>('api/account/getUsers', { headers: this.header });
  }

  searchEmployees(term: string): Observable<Employee[]> {
    return this.http.post<Employee[]>('api/account/searchEmployees', JSON.stringify(term), { headers: this.header });
  }

  getUserBinnacle(username: string): Observable<Binnacle[]> {
    return this.http.get<Binnacle[]>(`api/account/getUserBinnacle/${username}`, { headers: this.header });
  }
}
