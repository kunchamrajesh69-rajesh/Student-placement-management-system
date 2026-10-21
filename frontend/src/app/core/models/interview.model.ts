import { Application } from './application.model';
import { Student } from './student.model';
import { JobDrive } from './job-drive.model';

export type InterviewStatus = 'Scheduled' | 'Completed' | 'Cancelled' | 'Rescheduled';

export interface InterviewFeedback {
  rating?: number;
  comments?: string;
  recommendedForNextRound?: boolean;
}

export interface Interview {
  _id: string;
  application: Application | string;
  student: Student;
  jobDrive: JobDrive;
  roundName: string;
  interviewDate: string;
  interviewTime: string;
  mode: 'Online' | 'Offline';
  locationOrLink: string;
  instructions?: string;
  status: InterviewStatus;
  feedback?: InterviewFeedback;
  createdAt?: string;
  updatedAt?: string;
}
