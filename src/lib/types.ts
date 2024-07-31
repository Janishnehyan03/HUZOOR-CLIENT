export interface Subject {
  _id: string;
  name: string;
  students: Student[];
  teacher: Teacher;
  class: Class;
}

export interface Student {
  _id: string;
  name: string;
  admissionNumber: string;
  rollNumber:string
}
export interface Teacher {
  _id: string;
  name: string;
  role: string;
}
export interface Class {
  _id: string;
  name: string;
}

export interface Attendance {
  student: any;
  subject: string;
  class: string;
  date: string;
  isPresent: boolean;
  remarks?: string;
  reason?: "official" | "medical";
  updatedBy?: string;
}
