export type RosterStatus = "Active" | "Separated";

export interface UserWageManagement {
  id: number;
  userId: number;
  dailyWage: number;
  monthlyRate: number;
  cutoffWageDateUpdate: string | null;
  philhealthContributionMonthly: number;
  sssContributionMonthly: number;
  pagibigContributionMonthly: number;
  isCard: boolean;
  vacationLeavePerYear: number;
  sickLeavePerYear: number;
  paidHoliday: boolean;
  workingDaysPerMonth: number;
  scheduleId: number | null;
  salaryGrade?: number | null;
  salaryStep?: number | null;
  isRegularEmployee: boolean;
}

export interface UserScheduleInfo {
  id?: number;
  userId: number;
  workingDays?: number;
  restDay?: string | null;
  workStart?: string | null;
  workEnd?: string | null;
  lunchStart?: string | null;
  lunchEnd?: string | null;
  breakStart?: string | null;
  breakEnd?: string | null;
  workdaysNote?: string | null;
  gracePeriod?: number;
  isFlexible: boolean;
}

export interface IntercompanyEmployeeMasterlistRecord {
  id: string; // `${companyId}-${userId}`
  userId: number;
  employeeId: string; // e.g. `VTC-0042`
  biometricId: string | null;
  rfId: string | null;
  name: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  suffix?: string;
  email: string;
  personalEmail?: string;
  contact: string;
  companyId: number;
  companyName: string;
  companyCode: string;
  department: string;
  departmentId: number | null;
  position: string;
  employmentStatus: string;
  employmentStatusId: number | null;
  rosterStatus: RosterStatus;
  dateOfHire: string | null;
  separationDate: string | null;
  separationCause: string | null;
  tenureMonths: number;
  tenureYears: number;
  birthday: string | null;
  age: number | null;
  gender: string;
  civilStatus: string;
  city: string;
  province: string;
  barangay: string;
  avatar: string | null;
  isDepartmentHead: boolean;

  // Government IDs & Extended Profile (from user table)
  sssNumber?: string | null;
  philhealthNumber?: string | null;
  pagibigNumber?: string | null;
  tinNumber?: string | null;
  bloodType?: string | null;
  citizenship?: string | null;
  emergencyContactName?: string | null;
  emergencyContactNumber?: string | null;

  // Wage & Compensation Management (from user_wage_management table)
  wage?: UserWageManagement | null;

  // Work Schedule & Flexible Time (from user_schedule table)
  schedule?: UserScheduleInfo | null;
}

export interface CompanyMasterlistSummary {
  companyId: number;
  companyName: string;
  companyCode: string;
  status: "ACTIVE" | "OFFLINE" | "INACTIVE";
  totalEmployees: number;
  activeCount: number;
  separatedCount: number;
  regularCount: number;
  probationaryCount: number;
  otherStatusCount: number;
  newHiresThisYear: number;
  departmentCount: number;
  avgTenureYears: number;
  maleCount: number;
  femaleCount: number;
  headcountSharePct: number;
}

export interface DepartmentMasterlistSummary {
  department: string;
  totalEmployees: number;
  regularCount: number;
  probationaryCount: number;
  companiesCount: number;
  percentage: number;
}

export interface DistributionSegment {
  name: string;
  count: number;
  percentage: number;
  color: string;
}

export interface TenureDistributionPoint {
  range: string;
  count: number;
  percentage: number;
}

export interface IntercompanyEmployeeMasterlistKpis {
  totalEmployees: number;
  totalRosterRecords: number;
  activeEmployeesCount: number;
  separatedEmployeesCount: number;
  regularCount: number;
  probationaryCount: number;
  otherStatusCount: number;
  newHiresThisYear: number;
  departmentHeadsCount: number;
  avgTenureYears: number;
  maleCount: number;
  femaleCount: number;
  activeCompaniesCount: number;
  totalCompaniesCount: number;
  totalDepartmentsCount: number;
  largestCompanyName: string;
  largestCompanyCount: number;
}

export interface CompanyFilterOption {
  companyId: number;
  companyName: string;
  companyCode: string;
}

export interface IntercompanyEmployeeMasterlistData {
  generatedAt: string;
  kpis: IntercompanyEmployeeMasterlistKpis;
  companySummaries: CompanyMasterlistSummary[];
  departmentSummaries: DepartmentMasterlistSummary[];
  genderDistribution: DistributionSegment[];
  statusDistribution: DistributionSegment[];
  tenureDistribution: TenureDistributionPoint[];
  records: IntercompanyEmployeeMasterlistRecord[];
  companiesList: CompanyFilterOption[];
  departmentsList: string[];
  statusesList: string[];
}

export interface IntercompanyEmployeeMasterlistFilters {
  companyIds: string[];
  departments: string[];
  employmentStatus: string; // "ALL" | specific employment status
  rosterStatus: "ACTIVE" | "SEPARATED" | "ALL";
  gender: string; // "ALL" | "Male" | "Female" | "Other"
  search: string;
}

export type EmployeeMasterlistSortField =
  | "employeeId"
  | "name"
  | "company"
  | "department"
  | "position"
  | "employmentStatus"
  | "dateOfHire"
  | "tenureYears";

export type EmployeeMasterlistSortOrder = "asc" | "desc";

