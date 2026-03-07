export interface Member {
  uniqueId: number; // Unique identifier for each member
  membershipNo: string;
  fullName: string;
  mobileNo: string;
  doj: Date;
  photo?: string; // The '?' means this is optional;
  attended: boolean; // New property to track attendance
}