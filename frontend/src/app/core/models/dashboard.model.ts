import { Student } from './student.model';
import { Application } from './application.model';
import { Offer } from './offer.model';

export interface AdminDashboardSummary {
  totalStudents: number;
  placedStudents: number;
  unplacedStudents: number;
  shortlistedStudents: number;
  placementPercentage: number;
  activeDrives: number;
  totalApplications: number;
  totalOffers: number;
}

export interface DepartmentPlacementStat {
  _id: string;
  departmentCode: string;
  departmentName: string;
  totalStudents: number;
  placedStudents: number;
  avgCgpa: number;
  placementPercentage: number;
}

export interface PackageStats {
  highestLPA: number;
  lowestLPA: number;
  averageLPA: number;
  totalOffers: number;
}

export interface CompanyStat {
  companyId: string;
  companyName: string;
  totalOffers: number;
  avgPackage: number;
  maxPackage: number;
}

export interface AdminDashboardData {
  summary: AdminDashboardSummary;
  packageStats: PackageStats;
  departmentStats: DepartmentPlacementStat[];
  companyStats: CompanyStat[];
  recentApplications: Application[];
}

export interface StudentDashboardData {
  profile: Student;
  completenessScore: number;
  totalApplications: number;
  applications: Application[];
  offers: Offer[];
  activeDrivesCount: number;
}
