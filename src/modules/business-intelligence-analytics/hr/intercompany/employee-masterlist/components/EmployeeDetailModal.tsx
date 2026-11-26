"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  UserCheck,
  Briefcase,
  Fingerprint,
  Coins,
  ShieldCheck,
  CreditCard,
  HeartPulse,
} from "lucide-react";
import { IntercompanyEmployeeMasterlistRecord } from "../types";

interface EmployeeDetailModalProps {
  record: IntercompanyEmployeeMasterlistRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EmployeeDetailModal({
  record,
  open,
  onOpenChange,
}: EmployeeDetailModalProps) {
  if (!record) return null;

  const isSeparated = record.rosterStatus === "Separated";
  const wage = record.wage;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md sm:max-w-xl p-0 overflow-hidden bg-card border-border rounded-2xl shadow-xl">
        {/* Header with decorative gradient */}
        <div className="bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-indigo-500/10 p-5 sm:p-6 border-b border-border/60">
          <DialogHeader className="space-y-1">
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-bold font-mono bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30">
                <Building2 className="h-3 w-3" />
                {record.companyCode} • {record.employeeId}
              </span>
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                  isSeparated
                    ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                    : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                }`}
              >
                <UserCheck className="h-3.5 w-3.5" />
                {record.employmentStatus} ({record.rosterStatus})
              </span>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
                {record.name}
              </DialogTitle>
              {record.isDepartmentHead && (
                <Badge
                  variant="secondary"
                  className="text-[10px] bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/30 font-bold"
                >
                  Department Head
                </Badge>
              )}
            </div>
            <DialogDescription className="text-xs text-muted-foreground">
              {record.position} • {record.department}
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Content Body with smooth ScrollArea */}
        <ScrollArea className="max-h-[72vh]">
          <div className="p-5 sm:p-6 space-y-4">
            {/* Employment & Tenure Card */}
            <div className="rounded-xl border border-border/70 bg-muted/30 p-3.5 space-y-2.5">
              <h4 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Briefcase className="h-3.5 w-3.5 text-cyan-500" />
                Employment &amp; Service Tenure
              </h4>
              <div className="grid grid-cols-3 gap-2.5 text-center">
                <div className="p-2.5 rounded-lg bg-background border border-border/50">
                  <span className="text-[10px] font-medium text-muted-foreground">
                    Date of Hire
                  </span>
                  <p className="text-xs font-bold text-foreground mt-0.5 tabular-nums">
                    {record.dateOfHire || "N/A"}
                  </p>
                </div>
                <div className="p-2.5 rounded-lg bg-background border border-border/50">
                  <span className="text-[10px] font-medium text-muted-foreground">
                    Service Tenure
                  </span>
                  <p className="text-xs font-bold text-cyan-600 dark:text-cyan-400 mt-0.5 tabular-nums">
                    {record.tenureYears > 0
                      ? `${record.tenureYears} yrs`
                      : record.dateOfHire
                      ? "< 1 yr"
                      : "N/A"}
                  </p>
                </div>
                <div className="p-2.5 rounded-lg bg-background border border-border/50">
                  <span className="text-[10px] font-medium text-muted-foreground">
                    Total Months
                  </span>
                  <p className="text-xs font-bold text-foreground mt-0.5 tabular-nums">
                    {record.tenureMonths} mos
                  </p>
                </div>
              </div>
            </div>

            {/* Wage & Compensation Card (user_wage_management) */}
            {wage ? (
              <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 dark:bg-rose-950/15 p-3.5 space-y-3 text-xs">
                <div className="flex items-center justify-between pb-1 border-b border-rose-500/10">
                  <h4 className="text-[11px] font-bold text-rose-700 dark:text-rose-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Coins className="h-3.5 w-3.5 text-rose-500" />
                    Wage &amp; Compensation (user_wage_management)
                  </h4>
                  {wage.isCard && (
                    <Badge
                      variant="outline"
                      className="text-[10px] gap-1 bg-background text-foreground border-rose-500/30"
                    >
                      <CreditCard className="h-2.5 w-2.5 text-rose-500" />
                      ATM Card Payroll
                    </Badge>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
                  <div className="p-2 rounded-lg bg-background border border-border/60">
                    <span className="text-[10px] text-muted-foreground">Daily Wage</span>
                    <p className="text-xs font-bold text-foreground mt-0.5 font-mono">
                      ₱{wage.dailyWage.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="p-2 rounded-lg bg-background border border-border/60">
                    <span className="text-[10px] text-muted-foreground">Monthly Rate</span>
                    <p className="text-xs font-bold text-foreground mt-0.5 font-mono">
                      ₱{wage.monthlyRate.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="p-2 rounded-lg bg-background border border-border/60">
                    <span className="text-[10px] text-muted-foreground">Working Days/Mo</span>
                    <p className="text-xs font-bold text-foreground mt-0.5 font-mono">
                      {wage.workingDaysPerMonth} days
                    </p>
                  </div>
                  <div className="p-2 rounded-lg bg-background border border-border/60">
                    <span className="text-[10px] text-muted-foreground">Paid Holiday</span>
                    <p className="text-xs font-bold text-foreground mt-0.5">
                      {wage.paidHoliday ? "Yes" : "No"}
                    </p>
                  </div>
                </div>

                {/* Statutory Contributions & Leaves */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-xs">
                  <div className="space-y-1.5 p-2.5 rounded-lg bg-background border border-border/50">
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase">
                      Monthly Statutory Deductions
                    </span>
                    <div className="space-y-1 text-[11px]">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">SSS Contrib:</span>
                        <span className="font-mono font-semibold">
                          ₱{wage.sssContributionMonthly.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">PhilHealth Contrib:</span>
                        <span className="font-mono font-semibold">
                          ₱{wage.philhealthContributionMonthly.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Pag-IBIG Contrib:</span>
                        <span className="font-mono font-semibold">
                          ₱{wage.pagibigContributionMonthly.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5 p-2.5 rounded-lg bg-background border border-border/50">
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase">
                      Leave Entitlements &amp; Schedule
                    </span>
                    <div className="space-y-1 text-[11px]">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Vacation Leave:</span>
                        <span className="font-semibold">{wage.vacationLeavePerYear} days/yr</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Sick Leave:</span>
                        <span className="font-semibold">{wage.sickLeavePerYear} days/yr</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Salary Grade / Step:</span>
                        <span className="font-semibold">
                          {wage.salaryGrade ? `Grade ${wage.salaryGrade} (Step ${wage.salaryStep ?? 1})` : "Unassigned"}
                        </span>
                      </div>
                      {wage.cutoffWageDateUpdate && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Cutoff Updated:</span>
                          <span className="font-semibold">{wage.cutoffWageDateUpdate}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            {/* Government Identifiers (from user table) */}
            {(record.sssNumber || record.philhealthNumber || record.pagibigNumber || record.tinNumber) && (
              <div className="rounded-xl border border-border/70 bg-card p-3.5 space-y-2 text-xs">
                <h4 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-purple-500" />
                  Government Identifiers (user table)
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                  <div className="p-2 rounded-lg bg-muted/30 border border-border/40">
                    <span className="text-muted-foreground block text-[10px]">SSS Number</span>
                    <span className="font-mono font-semibold text-foreground">
                      {record.sssNumber || "N/A"}
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-muted/30 border border-border/40">
                    <span className="text-muted-foreground block text-[10px]">PhilHealth</span>
                    <span className="font-mono font-semibold text-foreground">
                      {record.philhealthNumber || "N/A"}
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-muted/30 border border-border/40">
                    <span className="text-muted-foreground block text-[10px]">Pag-IBIG</span>
                    <span className="font-mono font-semibold text-foreground">
                      {record.pagibigNumber || "N/A"}
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-muted/30 border border-border/40">
                    <span className="text-muted-foreground block text-[10px]">TIN Number</span>
                    <span className="font-mono font-semibold text-foreground">
                      {record.tinNumber || "N/A"}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Organization & Personal Details */}
            <div className="rounded-xl border border-border/70 bg-card p-3.5 space-y-2.5 text-xs">
              <h4 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Organization &amp; Personal Profile
              </h4>
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <span className="text-muted-foreground">Company Entity:</span>
                  <p className="font-semibold text-foreground">{record.companyName}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Department:</span>
                  <p className="font-semibold text-foreground">{record.department}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Gender &amp; Civil Status:</span>
                  <p className="font-semibold text-foreground">
                    {record.gender} • {record.civilStatus}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Birthday &amp; Age:</span>
                  <p className="font-semibold text-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-muted-foreground" />
                    <span>
                      {record.birthday || "N/A"}
                      {record.age ? ` (${record.age} yrs)` : ""}
                    </span>
                  </p>
                </div>
                {record.bloodType && (
                  <div>
                    <span className="text-muted-foreground">Blood Type:</span>
                    <p className="font-semibold text-foreground flex items-center gap-1">
                      <HeartPulse className="h-3 w-3 text-rose-500" />
                      <span>{record.bloodType}</span>
                    </p>
                  </div>
                )}
                {record.citizenship && (
                  <div>
                    <span className="text-muted-foreground">Citizenship:</span>
                    <p className="font-semibold text-foreground">{record.citizenship}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Biometric & System Identifiers */}
            {(record.biometricId || record.rfId) && (
              <div className="rounded-xl border border-border/70 bg-card p-3.5 space-y-2 text-xs">
                <h4 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Fingerprint className="h-3.5 w-3.5 text-purple-500" />
                  System &amp; Biometric Identifiers
                </h4>
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <span className="text-muted-foreground">Biometric ID:</span>
                    <p className="font-mono font-semibold text-foreground">
                      {record.biometricId || "Unassigned"}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">RFID Card:</span>
                    <p className="font-mono font-semibold text-foreground">
                      {record.rfId || "Unassigned"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Separation Info (if separated) */}
            {isSeparated && (
              <div className="rounded-xl border border-rose-500/30 bg-rose-500/5 dark:bg-rose-950/20 p-3.5 space-y-1.5 text-xs">
                <h4 className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
                  Separation Record
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-muted-foreground">Separation Date:</span>
                    <p className="font-semibold text-foreground">
                      {record.separationDate || "N/A"}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Cause:</span>
                    <p className="font-semibold text-foreground">
                      {record.separationCause || "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Contact & Address Details */}
            <div className="space-y-2 text-xs border-t border-border/60 pt-3">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-3.5 w-3.5 text-cyan-500 shrink-0" />
                <span className="truncate">{record.email || "No email registered"}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-3.5 w-3.5 text-cyan-500 shrink-0" />
                <span>{record.contact || "No phone registered"}</span>
              </div>
              {(record.barangay || record.city || record.province) && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5 text-cyan-500 shrink-0" />
                  <span>
                    {[record.barangay, record.city, record.province]
                      .filter(Boolean)
                      .join(", ")}
                  </span>
                </div>
              )}
              {(record.emergencyContactName || record.emergencyContactNumber) && (
                <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-200">
                  <span className="text-[10px] uppercase font-bold tracking-wider block">
                    Emergency Contact
                  </span>
                  <span className="font-semibold">
                    {record.emergencyContactName || "N/A"}
                    {record.emergencyContactNumber ? ` (${record.emergencyContactNumber})` : ""}
                  </span>
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}


