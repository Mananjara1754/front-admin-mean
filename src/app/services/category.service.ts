import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface CategoryProduct {
  _id?: string;
  name: string;
  description?: string;
  slug?: string;
  created_at?: Date;
  updated_at?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private apiUrl = `${environment.apiUrl}/categories`;

  constructor(private http: HttpClient) { }

  getCategories(): Observable<CategoryProduct[]> {
    return this.http.get<CategoryProduct[]>(this.apiUrl);
  }

  getCategory(id: string): Observable<CategoryProduct> {
    return this.http.get<CategoryProduct>(`${this.apiUrl}/${id}`);
  }

  createCategory(category: CategoryProduct): Observable<CategoryProduct> {
    return this.http.post<CategoryProduct>(this.apiUrl, category);
  }

  updateCategory(id: string, category: CategoryProduct): Observable<CategoryProduct> {
    return this.http.put<CategoryProduct>(`${this.apiUrl}/${id}`, category);
  }

  deleteCategory(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
