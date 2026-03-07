import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { Member } from './member';

@Injectable({
  providedIn: 'root'
})
export class MemberService {

  private baseUrl = `${environment.apiBaseUrl}/members`;

  constructor(private http: HttpClient) { }

  getByMembershipNo(membershipNo: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/byMembershipNo/${membershipNo}`);
  }

  getByName(fullName: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/byName/${fullName}`);
  }

  getByMobileNo(mobileNo: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/byMobileNo/${mobileNo}`);
  }

  // parameter kept for compatibility but not used
  getEventList(mobileNo?: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/events`);
  }

  // New method to store attendance for a member at an event
  storeAttendanceInDB(uniqueId: number, eventId: number): Observable<any> {
  const payload = {
    eventId: eventId,
    uniqueId: uniqueId
  };

  return this.http.post(`${this.baseUrl}/attendance`, payload);
}

  downloadPdf(eventId: number) {
  return this.http.get(`${this.baseUrl}/downloadPDF/${eventId}`, {
    responseType: 'blob'
  });
}

}