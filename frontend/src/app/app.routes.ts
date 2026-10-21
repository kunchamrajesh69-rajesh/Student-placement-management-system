import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

import { LoginComponent } from './features/auth/login.component';
import { AdminLayoutComponent } from './layout/admin-layout/admin-layout.component';
import { StudentLayoutComponent } from './layout/student-layout/student-layout.component';

// Admin Feature Components
import { AdminDashboardComponent } from './features/admin-dashboard/admin-dashboard.component';
import { StudentListComponent } from './features/students/student-list.component';
import { DepartmentListComponent } from './features/departments/department-list.component';
import { CompanyListComponent } from './features/companies/company-list.component';
import { JobDriveListComponent } from './features/placement-drives/job-drive-list.component';
import { JobDriveDetailComponent } from './features/placement-drives/job-drive-detail.component';
import { ApplicationListComponent } from './features/applications/application-list.component';
import { InterviewListComponent } from './features/interviews/interview-list.component';
import { OfferListComponent } from './features/offers/offer-list.component';
import { ReportsComponent } from './features/reports/reports.component';

// Student Feature Components
import { StudentDashboardComponent } from './features/student-dashboard/student-dashboard.component';
import { StudentProfileComponent } from './features/student-dashboard/student-profile.component';
import { StudentDrivesComponent } from './features/student-dashboard/student-drives.component';
import { StudentApplicationsComponent } from './features/student-dashboard/student-applications.component';
import { StudentInterviewsComponent } from './features/student-dashboard/student-interviews.component';
import { StudentOffersComponent } from './features/student-dashboard/student-offers.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },

  // Admin Routes
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [authGuard, roleGuard],
    data: { role: 'admin' },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: AdminDashboardComponent },
      { path: 'students', component: StudentListComponent },
      { path: 'departments', component: DepartmentListComponent },
      { path: 'companies', component: CompanyListComponent },
      { path: 'placement-drives', component: JobDriveListComponent },
      { path: 'placement-drives/:id', component: JobDriveDetailComponent },
      { path: 'applications', component: ApplicationListComponent },
      { path: 'interviews', component: InterviewListComponent },
      { path: 'offers', component: OfferListComponent },
      { path: 'reports', component: ReportsComponent }
    ]
  },

  // Student Routes
  {
    path: 'student',
    component: StudentLayoutComponent,
    canActivate: [authGuard, roleGuard],
    data: { role: 'student' },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: StudentDashboardComponent },
      { path: 'profile', component: StudentProfileComponent },
      { path: 'drives', component: StudentDrivesComponent },
      { path: 'applications', component: StudentApplicationsComponent },
      { path: 'interviews', component: StudentInterviewsComponent },
      { path: 'offers', component: StudentOffersComponent }
    ]
  },

  // Catch-all
  { path: '**', redirectTo: 'login' }
];
