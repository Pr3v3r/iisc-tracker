export interface College {
    _id: string;
    collegeName: string;
    assignedEmployee: string;
    status: 'Upcoming' | 'Visited';
    visitDate: string | null;
    notes: string;
    followUpDate: string | null;
    followUpNotes: string;
    lastUpdatedBy: string;
    createdAt: string;
    updatedAt: string;
    contactPerson: string;
  }
  
  export interface CollegeFormData {
    collegeName: string;
    assignedEmployee?: string;
    status: 'Upcoming' | 'Visited';
    visitDate?: string;
    notes?: string;
    followUpDate?: string;
    followUpNotes?: string;
    contactPerson?: string;
    reason?: string; // for audit log
  }
  
  export interface DashboardStats {
    total: number;
    upcoming: number;
    visited: number;
    overdueFollowUps: number;
    followUpsThisWeek: number;
    upcomingVisitsThisWeek: number;
  }