import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { IntercompanyEmployeeMasterlistRecord } from "../types";

export type ExportCategory =
  | "identification"
  | "organization"
  | "employment"
  | "personal"
  | "government"
  | "wage";

export type ColumnAlignment = "left" | "center" | "right";

export interface ExportColumnDefinition {
  id: string;
  label: string;
  category: ExportCategory;
  categoryLabel: string;
  defaultSelected: boolean;
  defaultAlignment: ColumnAlignment;
  formatValue: (record: IntercompanyEmployeeMasterlistRecord) => string;
}

export const EXPORT_COLUMNS: ExportColumnDefinition[] = [
  // 1. Identification
  {
    id: "employeeId",
    label: "Employee ID",
    category: "identification",
    categoryLabel: "Identification",
    defaultSelected: true,
    defaultAlignment: "center",
    formatValue: (r) => r.employeeId || "",
  },
  {
    id: "biometricId",
    label: "Biometric ID",
    category: "identification",
    categoryLabel: "Identification",
    defaultSelected: true,
    defaultAlignment: "center",
    formatValue: (r) => r.biometricId || "N/A",
  },
  {
    id: "rfId",
    label: "RFID Tag",
    category: "identification",
    categoryLabel: "Identification",
    defaultSelected: false,
    defaultAlignment: "center",
    formatValue: (r) => r.rfId || "N/A",
  },
  {
    id: "name",
    label: "Full Name",
    category: "identification",
    categoryLabel: "Identification",
    defaultSelected: true,
    defaultAlignment: "left",
    formatValue: (r) => r.name || "",
  },
  {
    id: "firstName",
    label: "First Name",
    category: "identification",
    categoryLabel: "Identification",
    defaultSelected: false,
    defaultAlignment: "left",
    formatValue: (r) => r.firstName || "",
  },
  {
    id: "lastName",
    label: "Last Name",
    category: "identification",
    categoryLabel: "Identification",
    defaultSelected: false,
    defaultAlignment: "left",
    formatValue: (r) => r.lastName || "",
  },
  {
    id: "middleName",
    label: "Middle Name",
    category: "identification",
    categoryLabel: "Identification",
    defaultSelected: false,
    defaultAlignment: "left",
    formatValue: (r) => r.middleName || "",
  },
  {
    id: "suffix",
    label: "Suffix",
    category: "identification",
    categoryLabel: "Identification",
    defaultSelected: false,
    defaultAlignment: "center",
    formatValue: (r) => r.suffix || "",
  },

  // 2. Organization
  {
    id: "companyCode",
    label: "Company Code",
    category: "organization",
    categoryLabel: "Company & Organization",
    defaultSelected: true,
    defaultAlignment: "center",
    formatValue: (r) => r.companyCode || "",
  },
  {
    id: "companyName",
    label: "Company Name",
    category: "organization",
    categoryLabel: "Company & Organization",
    defaultSelected: true,
    defaultAlignment: "left",
    formatValue: (r) => r.companyName || "",
  },
  {
    id: "department",
    label: "Department",
    category: "organization",
    categoryLabel: "Company & Organization",
    defaultSelected: true,
    defaultAlignment: "left",
    formatValue: (r) => r.department || "",
  },
  {
    id: "position",
    label: "Position / Role",
    category: "organization",
    categoryLabel: "Company & Organization",
    defaultSelected: true,
    defaultAlignment: "left",
    formatValue: (r) => r.position || "",
  },
  {
    id: "isDepartmentHead",
    label: "Department Head",
    category: "organization",
    categoryLabel: "Company & Organization",
    defaultSelected: false,
    defaultAlignment: "center",
    formatValue: (r) => (r.isDepartmentHead ? "Yes" : "No"),
  },

  // 3. Employment & Status
  {
    id: "employmentStatus",
    label: "Employment Status",
    category: "employment",
    categoryLabel: "Employment & Roster",
    defaultSelected: true,
    defaultAlignment: "center",
    formatValue: (r) => r.employmentStatus || "",
  },
  {
    id: "rosterStatus",
    label: "Roster Status",
    category: "employment",
    categoryLabel: "Employment & Roster",
    defaultSelected: true,
    defaultAlignment: "center",
    formatValue: (r) => r.rosterStatus || "",
  },
  {
    id: "dateOfHire",
    label: "Date of Hire",
    category: "employment",
    categoryLabel: "Employment & Roster",
    defaultSelected: true,
    defaultAlignment: "center",
    formatValue: (r) => r.dateOfHire || "N/A",
  },
  {
    id: "tenureYears",
    label: "Tenure (Years)",
    category: "employment",
    categoryLabel: "Employment & Roster",
    defaultSelected: true,
    defaultAlignment: "right",
    formatValue: (r) => String(r.tenureYears ?? "N/A"),
  },
  {
    id: "tenureMonths",
    label: "Tenure (Months)",
    category: "employment",
    categoryLabel: "Employment & Roster",
    defaultSelected: false,
    defaultAlignment: "right",
    formatValue: (r) => String(r.tenureMonths ?? "N/A"),
  },
  {
    id: "separationDate",
    label: "Separation Date",
    category: "employment",
    categoryLabel: "Employment & Roster",
    defaultSelected: false,
    defaultAlignment: "center",
    formatValue: (r) => r.separationDate || "N/A",
  },
  {
    id: "separationCause",
    label: "Separation Cause",
    category: "employment",
    categoryLabel: "Employment & Roster",
    defaultSelected: false,
    defaultAlignment: "left",
    formatValue: (r) => r.separationCause || "N/A",
  },

  // 4. Personal & Contact Profile
  {
    id: "gender",
    label: "Gender",
    category: "personal",
    categoryLabel: "Personal & Contact",
    defaultSelected: true,
    defaultAlignment: "center",
    formatValue: (r) => r.gender || "Other",
  },
  {
    id: "civilStatus",
    label: "Civil Status",
    category: "personal",
    categoryLabel: "Personal & Contact",
    defaultSelected: false,
    defaultAlignment: "center",
    formatValue: (r) => r.civilStatus || "N/A",
  },
  {
    id: "birthday",
    label: "Birthday",
    category: "personal",
    categoryLabel: "Personal & Contact",
    defaultSelected: false,
    defaultAlignment: "center",
    formatValue: (r) => r.birthday || "N/A",
  },
  {
    id: "age",
    label: "Age",
    category: "personal",
    categoryLabel: "Personal & Contact",
    defaultSelected: false,
    defaultAlignment: "right",
    formatValue: (r) => (r.age !== null ? String(r.age) : "N/A"),
  },
  {
    id: "email",
    label: "Email",
    category: "personal",
    categoryLabel: "Personal & Contact",
    defaultSelected: true,
    defaultAlignment: "left",
    formatValue: (r) => r.email || "",
  },
  {
    id: "personalEmail",
    label: "Personal Email",
    category: "personal",
    categoryLabel: "Personal & Contact",
    defaultSelected: false,
    defaultAlignment: "left",
    formatValue: (r) => r.personalEmail || "N/A",
  },
  {
    id: "contact",
    label: "Contact Phone",
    category: "personal",
    categoryLabel: "Personal & Contact",
    defaultSelected: true,
    defaultAlignment: "center",
    formatValue: (r) => r.contact || "",
  },
  {
    id: "city",
    label: "City / Municipality",
    category: "personal",
    categoryLabel: "Personal & Contact",
    defaultSelected: false,
    defaultAlignment: "left",
    formatValue: (r) => r.city || "",
  },
  {
    id: "province",
    label: "Province",
    category: "personal",
    categoryLabel: "Personal & Contact",
    defaultSelected: false,
    defaultAlignment: "left",
    formatValue: (r) => r.province || "",
  },
  {
    id: "barangay",
    label: "Barangay",
    category: "personal",
    categoryLabel: "Personal & Contact",
    defaultSelected: false,
    defaultAlignment: "left",
    formatValue: (r) => r.barangay || "",
  },
  {
    id: "bloodType",
    label: "Blood Type",
    category: "personal",
    categoryLabel: "Personal & Contact",
    defaultSelected: false,
    defaultAlignment: "center",
    formatValue: (r) => r.bloodType || "N/A",
  },
  {
    id: "citizenship",
    label: "Citizenship",
    category: "personal",
    categoryLabel: "Personal & Contact",
    defaultSelected: false,
    defaultAlignment: "left",
    formatValue: (r) => r.citizenship || "N/A",
  },
  {
    id: "emergencyContactName",
    label: "Emergency Contact Name",
    category: "personal",
    categoryLabel: "Personal & Contact",
    defaultSelected: false,
    defaultAlignment: "left",
    formatValue: (r) => r.emergencyContactName || "N/A",
  },
  {
    id: "emergencyContactNumber",
    label: "Emergency Contact Number",
    category: "personal",
    categoryLabel: "Personal & Contact",
    defaultSelected: false,
    defaultAlignment: "center",
    formatValue: (r) => r.emergencyContactNumber || "N/A",
  },

  // 5. Government IDs
  {
    id: "sssNumber",
    label: "SSS Number",
    category: "government",
    categoryLabel: "Government IDs",
    defaultSelected: false,
    defaultAlignment: "center",
    formatValue: (r) => r.sssNumber || "N/A",
  },
  {
    id: "philhealthNumber",
    label: "PhilHealth Number",
    category: "government",
    categoryLabel: "Government IDs",
    defaultSelected: false,
    defaultAlignment: "center",
    formatValue: (r) => r.philhealthNumber || "N/A",
  },
  {
    id: "pagibigNumber",
    label: "Pag-IBIG Number",
    category: "government",
    categoryLabel: "Government IDs",
    defaultSelected: false,
    defaultAlignment: "center",
    formatValue: (r) => r.pagibigNumber || "N/A",
  },
  {
    id: "tinNumber",
    label: "TIN Number",
    category: "government",
    categoryLabel: "Government IDs",
    defaultSelected: false,
    defaultAlignment: "center",
    formatValue: (r) => r.tinNumber || "N/A",
  },

  // 6. User Wage Management (user_wage_management)
  {
    id: "dailyWage",
    label: "Daily Wage (PHP)",
    category: "wage",
    categoryLabel: "Wage Management",
    defaultSelected: false,
    defaultAlignment: "right",
    formatValue: (r) =>
      r.wage?.dailyWage !== undefined
        ? r.wage.dailyWage.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })
        : "N/A",
  },
  {
    id: "monthlyRate",
    label: "Monthly Rate (PHP)",
    category: "wage",
    categoryLabel: "Wage Management",
    defaultSelected: false,
    defaultAlignment: "right",
    formatValue: (r) =>
      r.wage?.monthlyRate !== undefined
        ? r.wage.monthlyRate.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })
        : "N/A",
  },
  {
    id: "workingDaysPerMonth",
    label: "Working Days / Month",
    category: "wage",
    categoryLabel: "Wage Management",
    defaultSelected: false,
    defaultAlignment: "right",
    formatValue: (r) =>
      r.wage?.workingDaysPerMonth !== undefined
        ? String(r.wage.workingDaysPerMonth)
        : "26.00",
  },
  {
    id: "cutoffWageDateUpdate",
    label: "Wage Cutoff Update Date",
    category: "wage",
    categoryLabel: "Wage Management",
    defaultSelected: false,
    defaultAlignment: "center",
    formatValue: (r) => r.wage?.cutoffWageDateUpdate || "N/A",
  },
  {
    id: "philhealthContribution",
    label: "PhilHealth Monthly Contrib. (PHP)",
    category: "wage",
    categoryLabel: "Wage Management",
    defaultSelected: false,
    defaultAlignment: "right",
    formatValue: (r) =>
      r.wage?.philhealthContributionMonthly !== undefined
        ? r.wage.philhealthContributionMonthly.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })
        : "0.00",
  },
  {
    id: "sssContribution",
    label: "SSS Monthly Contrib. (PHP)",
    category: "wage",
    categoryLabel: "Wage Management",
    defaultSelected: false,
    defaultAlignment: "right",
    formatValue: (r) =>
      r.wage?.sssContributionMonthly !== undefined
        ? r.wage.sssContributionMonthly.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })
        : "0.00",
  },
  {
    id: "pagibigContribution",
    label: "Pag-IBIG Monthly Contrib. (PHP)",
    category: "wage",
    categoryLabel: "Wage Management",
    defaultSelected: false,
    defaultAlignment: "right",
    formatValue: (r) =>
      r.wage?.pagibigContributionMonthly !== undefined
        ? r.wage.pagibigContributionMonthly.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })
        : "0.00",
  },
  {
    id: "isCard",
    label: "Paid via ATM Card",
    category: "wage",
    categoryLabel: "Wage Management",
    defaultSelected: false,
    defaultAlignment: "center",
    formatValue: (r) => (r.wage ? (r.wage.isCard ? "Yes" : "No") : "N/A"),
  },
  {
    id: "paidHoliday",
    label: "Paid Holiday",
    category: "wage",
    categoryLabel: "Wage Management",
    defaultSelected: false,
    defaultAlignment: "center",
    formatValue: (r) => (r.wage ? (r.wage.paidHoliday ? "Yes" : "No") : "N/A"),
  },
  {
    id: "isRegularEmployeeWage",
    label: "Wage Regular Employee",
    category: "wage",
    categoryLabel: "Wage Management",
    defaultSelected: false,
    defaultAlignment: "center",
    formatValue: (r) =>
      r.wage ? (r.wage.isRegularEmployee ? "Yes" : "No") : "N/A",
  },
  {
    id: "vacationLeave",
    label: "Vacation Leave / Year",
    category: "wage",
    categoryLabel: "Wage Management",
    defaultSelected: false,
    defaultAlignment: "right",
    formatValue: (r) =>
      r.wage?.vacationLeavePerYear !== undefined
        ? String(r.wage.vacationLeavePerYear)
        : "0",
  },
  {
    id: "sickLeave",
    label: "Sick Leave / Year",
    category: "wage",
    categoryLabel: "Wage Management",
    defaultSelected: false,
    defaultAlignment: "right",
    formatValue: (r) =>
      r.wage?.sickLeavePerYear !== undefined
        ? String(r.wage.sickLeavePerYear)
        : "0",
  },
  {
    id: "salaryGrade",
    label: "Salary Grade",
    category: "wage",
    categoryLabel: "Wage Management",
    defaultSelected: false,
    defaultAlignment: "center",
    formatValue: (r) =>
      r.wage?.salaryGrade !== null && r.wage?.salaryGrade !== undefined
        ? `Grade ${r.wage.salaryGrade}`
        : "N/A",
  },
  {
    id: "salaryStep",
    label: "Salary Step",
    category: "wage",
    categoryLabel: "Wage Management",
    defaultSelected: false,
    defaultAlignment: "center",
    formatValue: (r) =>
      r.wage?.salaryStep !== null && r.wage?.salaryStep !== undefined
        ? `Step ${r.wage.salaryStep}`
        : "N/A",
  },
];

export const EXPORT_PRESETS: {
  id: string;
  name: string;
  description: string;
  columnIds: string[];
}[] = [
  {
    id: "standard",
    name: "Standard Masterlist",
    description: "Common HR roster with contact, entity, and tenure",
    columnIds: [
      "employeeId",
      "biometricId",
      "name",
      "companyCode",
      "companyName",
      "department",
      "position",
      "employmentStatus",
      "rosterStatus",
      "dateOfHire",
      "tenureYears",
      "email",
      "contact",
    ],
  },
  {
    id: "payroll_wage",
    name: "Payroll & Wage Management",
    description: "Includes compensation, contributions, ATM card, and Government IDs",
    columnIds: [
      "employeeId",
      "biometricId",
      "name",
      "companyCode",
      "department",
      "position",
      "dailyWage",
      "monthlyRate",
      "workingDaysPerMonth",
      "isCard",
      "sssNumber",
      "philhealthNumber",
      "pagibigNumber",
      "tinNumber",
      "sssContribution",
      "philhealthContribution",
      "pagibigContribution",
      "vacationLeave",
      "sickLeave",
    ],
  },
  {
    id: "hr_compliance",
    name: "HR Profile & Compliance",
    description: "Personal profile, birthday, government IDs, and emergency contact",
    columnIds: [
      "employeeId",
      "name",
      "companyName",
      "department",
      "position",
      "gender",
      "civilStatus",
      "birthday",
      "age",
      "city",
      "province",
      "email",
      "contact",
      "emergencyContactName",
      "emergencyContactNumber",
      "sssNumber",
      "philhealthNumber",
      "pagibigNumber",
      "tinNumber",
    ],
  },
];

/**
 * Export customized records to Microsoft Excel (.xlsx)
 */
export function exportToExcel(
  records: IntercompanyEmployeeMasterlistRecord[],
  selectedColumnIds: string[],
  optionsOrFilename:
    | string
    | {
        filename?: string;
        alignments?: Record<string, ColumnAlignment>;
      } = "intercompany_employee_masterlist.xlsx"
) {
  if (!records || records.length === 0) return;

  const cols = EXPORT_COLUMNS.filter((c) => selectedColumnIds.includes(c.id));
  if (cols.length === 0) return;

  const filename =
    typeof optionsOrFilename === "string"
      ? optionsOrFilename
      : optionsOrFilename?.filename || "intercompany_employee_masterlist.xlsx";
  const alignments =
    typeof optionsOrFilename === "object" ? optionsOrFilename?.alignments : undefined;

  const headers = cols.map((c) => c.label);
  const rows = records.map((record) => cols.map((col) => col.formatValue(record)));

  const worksheetData = [headers, ...rows];
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

  // Apply column alignments and width styling
  cols.forEach((col, colIdx) => {
    const align = alignments?.[col.id] || col.defaultAlignment || "left";
    for (let rowIdx = 0; rowIdx <= records.length; rowIdx++) {
      const cellAddress = XLSX.utils.encode_cell({ c: colIdx, r: rowIdx });
      if (worksheet[cellAddress]) {
        worksheet[cellAddress].s = {
          alignment: {
            horizontal: align,
            vertical: "center",
          },
        };
      }
    }
  });

  // Auto-fit column widths
  const colWidths = headers.map((header, colIndex) => {
    let maxLength = header.length;
    for (const row of rows) {
      const val = row[colIndex] || "";
      if (val.length > maxLength) maxLength = val.length;
    }
    return { wch: Math.min(Math.max(maxLength + 2, 12), 40) };
  });
  worksheet["!cols"] = colWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Employee Masterlist");

  XLSX.writeFile(workbook, filename);
}

/**
 * Export customized records to PDF (.pdf) using jsPDF and jspdf-autotable
 */
export function exportToPdf(
  records: IntercompanyEmployeeMasterlistRecord[],
  selectedColumnIds: string[],
  options?: {
    orientation?: "landscape" | "portrait";
    filename?: string;
    title?: string;
    alignments?: Record<string, ColumnAlignment>;
  }
) {
  if (!records || records.length === 0) return;

  const cols = EXPORT_COLUMNS.filter((c) => selectedColumnIds.includes(c.id));
  if (cols.length === 0) return;

  const orientation =
    options?.orientation || (cols.length > 6 ? "landscape" : "portrait");
  const filename =
    options?.filename ||
    `intercompany_employee_masterlist_${new Date().toISOString().slice(0, 10)}.pdf`;
  const title =
    options?.title || "Intercompany Employee Masterlist Directory";

  const doc = new jsPDF({
    orientation,
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const todayStr = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  // Header Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(14, 116, 144); // Cyan-700
  doc.text(title, 14, 15);

  // Metadata subheader
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139); // Slate-500
  doc.text(
    `Generated: ${todayStr}  |  Total Records: ${records.length}  |  Included Fields: ${cols.length}`,
    14,
    21
  );

  // Custom column & header alignments
  const columnStyles: Record<number, { halign: "left" | "center" | "right" }> = {};
  cols.forEach((col, idx) => {
    const align = options?.alignments?.[col.id] || col.defaultAlignment || "left";
    columnStyles[idx] = { halign: align };
  });

  // Table Data
  const headers = [
    cols.map((c) => ({
      content: c.label,
      styles: {
        halign: options?.alignments?.[c.id] || c.defaultAlignment || "left",
      },
    })),
  ];
  const body = records.map((record) =>
    cols.map((col) => col.formatValue(record))
  );

  autoTable(doc, {
    startY: 25,
    head: headers,
    body: body,
    theme: "striped",
    columnStyles: columnStyles,
    headStyles: {
      fillColor: [14, 116, 144], // Cyan-700
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: "bold",
      cellPadding: 2,
    },
    bodyStyles: {
      fontSize: 7.5,
      textColor: [30, 41, 59], // Slate-800
      cellPadding: 1.8,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252], // Slate-50
    },
    styles: {
      overflow: "linebreak",
      lineWidth: 0.1,
      lineColor: [226, 232, 240], // Slate-200
    },
    margin: { top: 25, right: 10, bottom: 15, left: 10 },
    didDrawPage: (data) => {
      // Footer page numbering
      const pageCount = doc.getNumberOfPages();
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184); // Slate-400
      const pageText = `Page ${data.pageNumber} of ${pageCount}`;
      doc.text(pageText, pageWidth - 14, doc.internal.pageSize.getHeight() - 8, {
        align: "right",
      });
      doc.text(
        "VOS Business Intelligence & Analytics - Confidential",
        10,
        doc.internal.pageSize.getHeight() - 8
      );
    },
  });

  doc.save(filename);
}

/**
 * Export customized records to CSV (.csv)
 */
export function exportToCsvCustom(
  records: IntercompanyEmployeeMasterlistRecord[],
  selectedColumnIds: string[],
  optionsOrFilename:
    | string
    | {
        filename?: string;
        alignments?: Record<string, ColumnAlignment>;
      } = "intercompany_employee_masterlist.csv"
) {
  if (!records || records.length === 0) return;

  const filename =
    typeof optionsOrFilename === "string"
      ? optionsOrFilename
      : optionsOrFilename?.filename || "intercompany_employee_masterlist.csv";

  const cols = EXPORT_COLUMNS.filter((c) => selectedColumnIds.includes(c.id));
  if (cols.length === 0) return;

  const headers = cols.map((c) => c.label);
  const rows = records.map((record) =>
    cols.map((col) => {
      const val = col.formatValue(record);
      return `"${val.replace(/"/g, '""')}"`;
    })
  );

  const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join(
    "\r\n"
  );
  const blob = new Blob(["\uFEFF" + csvContent], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
