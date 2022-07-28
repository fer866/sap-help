import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { GroupGuides, Guide, Step } from '../entities/guide';

@Injectable({
  providedIn: 'root'
})
export class GuideApiService {
  private header: HttpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

  constructor(private http: HttpClient) { }

  getRecentGuides(): Observable<GroupGuides[]> {
    return this.http.get<GroupGuides[]>('api/guide', { headers: this.header });
  }

  getGuides(value: string): Observable<GroupGuides[]> {
    return this.http.get<GroupGuides[]>(`api/guide/getGuides/${value}`, { headers: this.header });
  }

  getGuideById(id: number): Observable<Guide> {
    return this.http.get<Guide>(`api/guide/getGuideById/${id}`, { headers: this.header });
  }

  getGuideSteps(id: number): Observable<Step[]> {
    return this.http.get<Step[]>(`api/guide/getGuideSteps/${id}`, { headers: this.header });
  }
  
  addGuide(guide: any): Observable<any> {
    return this.http.put<any>('api/guide', JSON.stringify(guide), { headers: this.header });
  }

  updateGuide(guide: any): Observable<any> {
    return this.http.patch<any>('api/guide', JSON.stringify(guide), { headers: this.header });
  }

  deleteGuide(idGuide: number): Observable<any> {
    return this.http.delete<any>(`api/guide/${idGuide}`, { headers: this.header });
  }

  addGuideStep(form: FormData): Observable<any> {
    return this.http.put<any>('api/guide/addGuideStep', form);
  }

  updateGuideStep(form: FormData): Observable<any> {
    return this.http.patch<any>('api/guide/updateGuideStep', form);
  }

  deleteGuideStep(idStep: number): Observable<any> {
    return this.http.delete<any>(`api/guide/deleteGuideStep/${idStep}`, { headers: this.header });
  }

  changeStepsPosition(steps: Step[]): Observable<any> {
    return this.http.patch<any>('api/guide/changeStepsPosition', JSON.stringify(steps), { headers: this.header });
  }

  downloadStepFile(idStep: number): Observable<any> {
    return this.http.get(`api/guide/downloadStepFile/${idStep}`, { headers: this.header, responseType: 'blob' });
  }

  generateGuidePdf(idGuide: number): Observable<any> {
    return this.http.get(`api/guide/generateGuidePdf/${idGuide}`, { headers: this.header, responseType: 'blob' });
  }
}
