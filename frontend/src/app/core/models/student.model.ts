import { Department } from './department.model';
import { Company } from './company.model';

export type PlacementStatus = 'Unplaced' | 'Shortlisted' | 'Interviewing' | 'Offered' | 'Placed';

export interface Certification {
  title: string;
  issuer?: string;
  issueDate?: string;
  credentialUrl?: string;
}

export interface Project {
  title: string;
  description?: string;
  techStack?: string[];
  projectUrl?: string;
}

export interface PlacedDetails {
  company?: Company | string;
  role?: string;
  packageLPA?: number;
  offerDate?: string;
}

export interface Student {
  _id: string;
  user: string;
  rollNumber: string;
  fullName: string;
  email: string;
  phone: string;
  department: Department;
  batch: number;
  cgpa: number;
  activeBacklogs: number;
  historicalBacklogs: number;
  skills: string[];
  certifications?: Certification[];
  projects?: Project[];
  resumeUrl?: string;
  placementStatus: PlacementStatus;
  placedDetails?: PlacedDetails;
  createdAt?: string;
  updatedAt?: string;
}
