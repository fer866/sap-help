import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Category } from '../entities/category';

@Injectable({
  providedIn: 'root'
})
export class CategoryApiService {
  private header: HttpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

  constructor(private http: HttpClient) { }

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>('api/category', { headers: this.header });
  }

  addCategory(value: any): Observable<any> {
    return this.http.put<any>('api/category', JSON.stringify(value), { headers: this.header });
  }

  updateCategory(value: any): Observable<any> {
    return this.http.patch<any>('api/category', JSON.stringify(value), { headers: this.header });
  }

  deleteCategory(idCat: number): Observable<any> {
    return this.http.delete<any>(`api/category/${idCat}`, { headers: this.header });
  }
}
