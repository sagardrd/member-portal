import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Needed for *ngIf and *ngFor
import { FormsModule } from '@angular/forms';   // Needed for [(ngModel)]
import { MemberService } from '../member.service';
import { Member } from '../member';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './search.component.html',
  styleUrl: './search.component.css'
})
export class SearchComponent implements OnInit {

  selectedSearchType: string = '';
  searchQuery: string = '';
  searchResults: Member[] = [];
  errorMessage: string = '';
  hasSearched: boolean = false;

  // new event dropdown state
  eventList: any[] = [];
  selectedEvent: any = null;

  // Track which members have been marked as attended (by uniqueId)
  attendedMembers: Set<string> = new Set();

  constructor(private memberService: MemberService) { }

  ngOnInit(): void {
    // populate event dropdown on init
    this.memberService.getEventList('').subscribe({
      next: (data: any) => {
        this.eventList = Array.isArray(data) ? data : [];
      },
      error: (err) => {
        console.error('Failed to load events', err);
      }
    });
  }

  // called when user changes the selected event; clear any marked attendance
  onEventChange() {
    // reset attended members when event changes
    this.attendedMembers.clear();
    // also reset the attended flags on current results
    this.searchResults.forEach(m => (m as any).attended = false);
  }

  onSearchTypeChange() {
    this.searchQuery = '';
    this.searchResults = [];
    this.hasSearched = false;
    this.errorMessage = '';
    this.attendedMembers.clear();
  }

  performSearch() {
    if (!this.searchQuery) return;
    this.hasSearched = true;
    this.errorMessage = '';
    this.searchResults = [];

    // Decide which API to call
    if (this.selectedSearchType === 'membershipNo') {
      this.memberService.getByMembershipNo(this.searchQuery).subscribe({
        next: (data) => this.handleResponse(data),
        error: (err) => this.handleError(err)
      });
    } else if (this.selectedSearchType === 'fullName') {
      this.memberService.getByName(this.searchQuery).subscribe({
        next: (data) => this.handleResponse(data),
        error: (err) => this.handleError(err)
      });
    } else if (this.selectedSearchType === 'mobileNo') {
      this.memberService.getByMobileNo(this.searchQuery).subscribe({
        next: (data) => this.handleResponse(data),
        error: (err) => this.handleError(err)
      });
    }
  }

  handleResponse(data: any) {
    // If backend returns a single object, put it in an array so the list view works
    if (Array.isArray(data)) {  
      // If backend does not return any data, show "No Record Found" message
      if(data.length === 0) {
        // this.searchResults = data;
        this.errorMessage = 'No Record Found.';
      } else {
        this.searchResults = data;
      }
    } else if (data) {
      this.searchResults = [data];
    } else {
      this.searchResults = [];
    }
    // Restore attendance state for members that were previously marked
    this.searchResults.forEach(m => {
      const id = (m as any).uniqueId ?? (m as any).membershipNo;
      if (id && this.attendedMembers.has(id)) {
        (m as any).attended = true;
      }
    });
  }

  handleError(error: any) {
    console.error(error);
    this.errorMessage = 'No records found.';
  }

  resetAll() {
    this.selectedSearchType = '';
    this.searchQuery = '';
    this.searchResults = [];
    this.hasSearched = false;
    this.errorMessage = '';
    // Note: selectedEvent is intentionally NOT reset to preserve user's event selection
  }

  markAttendance(member: any) {
    member.attended = true;

    if (member.uniqueId) this.attendedMembers.add(member.uniqueId);

    // determine event id from selectedEvent (support eventId property or primitive value)
    const eventId = this.selectedEvent?.eventId ?? this.selectedEvent;

    // Call storeAttendence with memberId and eventId
    this.storeAttendence(eventId, member.uniqueId);
  }

  // storeAttendence: record attendance for given uniqueId and eventId
  storeAttendence(uniqueId: number, eventId: number | any) {
    if (!uniqueId) return;
    const evtId = eventId?.eventId ?? eventId ?? this.selectedEvent?.eventId ?? this.selectedEvent;

    // If the service exposes a backend call, call it. Otherwise just log locally.
    if ((this.memberService as any).storeAttendanceInDB) {
      console.log("1st if passsed");

      (this.memberService as any).storeAttendanceInDB(evtId, uniqueId).subscribe({
        next: (res: any) => console.log('Attendance Recorded', res),
        error: (err: any) => console.error('Failed to Store Attendance', err)
      });
    } else {
      console.log('storeAttendence called', { uniqueId, eventId: evtId });
    }
  }

  downloadEventPdf(event: any) {
    const eventId = event?.eventId ?? event;
    const eventName = event?.eventName ?? event;
    const eventYear = event?.eventYear ?? '';
    console.log('Downloading PDF for eventId:', eventId, 'eventName:', eventName);
    this.memberService.downloadPdf(eventId).subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${eventName}-${eventYear}-Attendance.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
    });
  }


  getPlaceholder(): string {
    if (this.selectedSearchType === 'membershipNo') return 'Enter Membership ID';
    if (this.selectedSearchType === 'fullName') return 'Enter Name';
    if (this.selectedSearchType === 'mobileNo') return 'Enter Mobile No';
    return '';
  }
}