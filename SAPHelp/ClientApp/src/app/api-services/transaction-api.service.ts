import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { GroupTransactions } from '../entities/transaction';

@Injectable({
  providedIn: 'root'
})
export class TransactionApiService {
  private header: HttpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

  constructor(private http: HttpClient) { }

  getRecentTransactions(): Observable<GroupTransactions[]> {
    return this.http.get<GroupTransactions[]>('api/transaction', { headers: this.header });
  }

  getTransactions(value: string): Observable<GroupTransactions[]> {
    return this.http.get<GroupTransactions[]>(`api/transaction/getTransactions/${value}`, { headers: this.header });
  }

  addTransaction(value: any): Observable<any> {
    return this.http.put<any>('api/transaction', JSON.stringify(value), { headers: this.header });
  }

  updateTransaction(value: any): Observable<any> {
    return this.http.patch<any>('api/transaction', JSON.stringify(value), { headers: this.header });
  }

  deleteTransaction(idTransaction: number): Observable<any> {
    return this.http.delete<any>(`api/transaction/${idTransaction}`, { headers: this.header });
  }
}
