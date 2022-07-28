import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { GroupTables } from '../entities/table';

@Injectable({
  providedIn: 'root'
})
export class TableApiService {
  private header: HttpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

  constructor(private http: HttpClient) { }

  getRecentTables(): Observable<GroupTables[]> {
    return this.http.get<GroupTables[]>('api/table', { headers: this.header });
  }

  getTables(value: string): Observable<GroupTables[]> {
    return this.http.get<GroupTables[]>(`api/table/getTables/${value}`, { headers: this.header });
  }

  addTable(value: any): Observable<any> {
    return this.http.put<any>('api/table', JSON.stringify(value), { headers: this.header });
  }

  updateTable(value: any): Observable<any> {
    return this.http.patch<any>('api/table', JSON.stringify(value), { headers: this.header });
  }

  deleteTable(idTable: number): Observable<any> {
    return this.http.delete<any>(`api/table/${idTable}`, { headers: this.header });
  }
}
