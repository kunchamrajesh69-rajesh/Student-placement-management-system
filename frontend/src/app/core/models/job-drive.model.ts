import { Company } from './company.model';
import { Department } from './department.model';

export type JobType = 'Full-Time' | 'Internship' | 'Internship+FTE';
export type DriveStatus = 'Draft' | 'Active' | 'Closed' | 'Completed';

export interface SalaryPackage {
  ctcLpa: number;
  stipendPerMonth?: number;
  breakup?: string;
}

export interface EligibilityCriteria {
  minCgpa: number;
  maxBacklogs: number;
  allowHistoricalBacklogs?: boolean;
  eligibleDepartments: Department[];
  eligibleBatches: number[];
  requiredSkills?: string[];
}

export interface StudentEligibilityContext {
  isEligible: boolean;
  eligibilityReasons: string[];
  breakdown?: any;
  hasApplied: boolean;
  applicationStage?: string | null;
  isDeadlinePassed: boolean;
  canApply: boolean;
}

export interface JobDrive {
  _id: string;
  title: string;
  company: Company;
  description: string;
  jobType: JobType;
  location: string;
  salaryPackage: SalaryPackage;
  requiredSkills: string[];
  eligibilityCriteria: EligibilityCriteria;
  selectionProcess?: string[];
  applicationDeadline: string;
  driveDate?: string;
  status: DriveStatus;
  createdBy?: string;
  studentContext?: StudentEligibilityContext;
  adminAnalytics?: {
    totalStudentsCount: number;
    eligibleCount: number;
    ineligibleCount: number;
    eligibleStudentsSample: any[];
    ineligibleStudentsSample: any[];
  };
  createdAt?: string;
  updatedAt?: string;
}
