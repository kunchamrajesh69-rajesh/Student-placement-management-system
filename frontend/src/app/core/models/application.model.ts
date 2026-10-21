import { Student } from './student.model';
import { JobDrive } from './job-drive.model';

export type SelectionStage =
  | 'Applied'
  | 'Shortlisted'
  | 'Assessment'
  | 'Interview'
  | 'Selected'
  | 'Rejected'
  | 'Offered'
  | 'Joined';

export interface StageHistory {
  stage: SelectionStage;
  updatedBy?: any;
  updatedAt: string;
  remarks?: string;
}

export interface Application {
  _id: string;
  student: Student;
  jobDrive: JobDrive;
  currentStage: SelectionStage;
  stageHistory: StageHistory[];
  studentSnapshot?: {
    cgpa?: number;
    activeBacklogs?: number;
    department?: any;
    batch?: number;
  };
  isEligibleAtApply: boolean;
  appliedAt: string;
  createdAt?: string;
  updatedAt?: string;
}
