import { Student } from './student.model';
import { Company } from './company.model';
import { JobDrive } from './job-drive.model';
import { Application } from './application.model';

export type OfferStatus = 'Offered' | 'Accepted' | 'Declined' | 'Joined';

export interface Offer {
  _id: string;
  application: Application | string;
  student: Student;
  jobDrive: JobDrive;
  company: Company;
  designation: string;
  packageLPA: number;
  offerLetterUrl?: string;
  offerDate: string;
  joiningDate?: string;
  status: OfferStatus;
  remarks?: string;
  createdAt?: string;
  updatedAt?: string;
}
