"use client";

import React, { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  FileSpreadsheet,
  FileText,
  Table as TableIcon,
  Download,
  CheckCheck,
  Sparkles,
  Layers,
  Building2,
  Briefcase,
  User,
  ShieldCheck,
  Coins,
  Loader2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  SlidersHorizontal,
  ArrowUp,
  ArrowDown,
  ChevronsUp,
  ChevronsDown,
  ListOrdered,
  RotateCcw,
  X,
} from "lucide-react";
import { IntercompanyEmployeeMasterlistRecord } from "../types";
import {
  EXPORT_COLUMNS,
  EXPORT_PRESETS,
  exportToExcel,
  exportToPdf,
  exportToCsvCustom,
  ExportCategory,
  ColumnAlignment,
} from "../utils/exportEngine";

interface EmployeeMasterlistExportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filteredRecords: IntercompanyEmployeeMasterlistRecord[];
  allRecords: IntercompanyEmployeeMasterlistRecord[];
}

type ExportFormat = "excel" | "pdf" | "csv";
type ExportScope = "filtered" | "all";

const CATEGORY_META: Record<
  ExportCategory,
  { label: string; icon: React.ElementType; color: string }
> = {
  identification: {
    label: "Identification & Codes",
    icon: Layers,
    color: "text-blue-500",
  },
  organization: {
    label: "Company & Organization",
    icon: Building2,
    color: "text-cyan-500",
  },
  employment: {
    label: "Employment & Roster",
    icon: Briefcase,
    color: "text-emerald-500",
  },
  personal: {
    label: "Personal & Contact Profile",
    icon: User,
    color: "text-amber-500",
  },
  government: {
    label: "Government IDs (SSS, PhilHealth, TIN)",
    icon: ShieldCheck,
    color: "text-purple-500",
  },
  wage: {
    label: "User Wage Management (user_wage_management)",
    icon: Coins,
    color: "text-rose-500",
  },
};

export function EmployeeMasterlistExportModal({
  open,
  onOpenChange,
  filteredRecords,
  allRecords,
}: EmployeeMasterlistExportModalProps) {
  const [format, setFormat] = useState<ExportFormat>("excel");
  const [scope, setScope] = useState<ExportScope>("filtered");
  const [orientation, setOrientation] = useState<"landscape" | "portrait">("landscape");
  const [isExporting, setIsExporting] = useState(false);

  // Initialize selected columns from defaultSelected
  const [selectedColumnIds, setSelectedColumnIds] = useState<string[]>(() =>
    EXPORT_COLUMNS.filter((c) => c.defaultSelected).map((c) => c.id)
  );

  // Initialize individual column alignments from defaults
  const [columnAlignments, setColumnAlignments] = useState<Record<string, ColumnAlignment>>(() => {
    const initial: Record<string, ColumnAlignment> = {};
    EXPORT_COLUMNS.forEach((col) => {
      initial[col.id] = col.defaultAlignment;
    });
    return initial;
  });

  const setColumnAlignment = (colId: string, align: ColumnAlignment) => {
    setColumnAlignments((prev) => ({
      ...prev,
      [colId]: align,
    }));
  };

  const setAllAlignments = (type: ColumnAlignment | "smart") => {
    setColumnAlignments(() => {
      const updated: Record<string, ColumnAlignment> = {};
      EXPORT_COLUMNS.forEach((col) => {
        updated[col.id] = type === "smart" ? col.defaultAlignment : type;
      });
      return updated;
    });
  };

  // Active view mode: select fields vs arrange column order
  const [viewMode, setViewMode] = useState<"fields" | "order">("fields");

  // Reordering helpers
  const moveColumnUp = (colId: string) => {
    setSelectedColumnIds((prev) => {
      const idx = prev.indexOf(colId);
      if (idx <= 0) return prev;
      const copy = [...prev];
      const temp = copy[idx - 1];
      copy[idx - 1] = copy[idx];
      copy[idx] = temp;
      return copy;
    });
  };

  const moveColumnDown = (colId: string) => {
    setSelectedColumnIds((prev) => {
      const idx = prev.indexOf(colId);
      if (idx === -1 || idx >= prev.length - 1) return prev;
      const copy = [...prev];
      const temp = copy[idx + 1];
      copy[idx + 1] = copy[idx];
      copy[idx] = temp;
      return copy;
    });
  };

  const moveColumnToTop = (colId: string) => {
    setSelectedColumnIds((prev) => {
      const idx = prev.indexOf(colId);
      if (idx <= 0) return prev;
      const copy = prev.filter((id) => id !== colId);
      return [colId, ...copy];
    });
  };

  const moveColumnToBottom = (colId: string) => {
    setSelectedColumnIds((prev) => {
      const idx = prev.indexOf(colId);
      if (idx === -1 || idx === prev.length - 1) return prev;
      const copy = prev.filter((id) => id !== colId);
      return [...copy, colId];
    });
  };

  const resetColumnOrderToDefault = () => {
    setSelectedColumnIds((prev) => {
      return EXPORT_COLUMNS.filter((col) => prev.includes(col.id)).map((col) => col.id);
    });
  };

  // Group columns by category
  const groupedColumns = useMemo(() => {
    const map = new Map<ExportCategory, typeof EXPORT_COLUMNS>();
    EXPORT_COLUMNS.forEach((col) => {
      const list = map.get(col.category) || [];
      list.push(col);
      map.set(col.category, list);
    });
    return map;
  }, []);

  const toggleColumn = (id: string) => {
    setSelectedColumnIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleCategory = (category: ExportCategory) => {
    const cols = groupedColumns.get(category) || [];
    const catIds = cols.map((c) => c.id);
    const allSelected = catIds.every((id) => selectedColumnIds.includes(id));

    if (allSelected) {
      setSelectedColumnIds((prev) => prev.filter((id) => !catIds.includes(id)));
    } else {
      setSelectedColumnIds((prev) => Array.from(new Set([...prev, ...catIds])));
    }
  };

  const applyPreset = (presetId: string) => {
    const preset = EXPORT_PRESETS.find((p) => p.id === presetId);
    if (preset) {
      setSelectedColumnIds(preset.columnIds);
    }
  };

  const selectAll = () => {
    setSelectedColumnIds(EXPORT_COLUMNS.map((c) => c.id));
  };

  const deselectAll = () => {
    setSelectedColumnIds([]);
  };

  const targetRecords = scope === "filtered" ? filteredRecords : allRecords;

  const handleExecuteExport = async () => {
    if (selectedColumnIds.length === 0 || targetRecords.length === 0) return;
    setIsExporting(true);

    try {
      const dateStr = new Date().toISOString().slice(0, 10);
      const filenameBase = `intercompany_employee_masterlist_${dateStr}`;

      // Allow UI to update before synchronous file generation
      await new Promise((resolve) => setTimeout(resolve, 80));

      if (format === "excel") {
        exportToExcel(targetRecords, selectedColumnIds, {
          filename: `${filenameBase}.xlsx`,
          alignments: columnAlignments,
        });
      } else if (format === "pdf") {
        exportToPdf(targetRecords, selectedColumnIds, {
          orientation,
          filename: `${filenameBase}.pdf`,
          title: "Intercompany Employee Masterlist Directory",
          alignments: columnAlignments,
        });
      } else {
        exportToCsvCustom(targetRecords, selectedColumnIds, {
          filename: `${filenameBase}.csv`,
          alignments: columnAlignments,
        });
      }

      onOpenChange(false);
    } catch (err) {
      console.error("[Export Error]", err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl sm:max-w-3xl lg:max-w-4xl max-h-[92vh] flex flex-col p-0 overflow-hidden bg-card border-border rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="shrink-0 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-indigo-500/10 p-4 sm:p-5 border-b border-border/60">
          <DialogHeader className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30">
                <Download className="h-5 w-5" />
              </span>
              <div>
                <DialogTitle className="text-base sm:text-lg font-bold text-foreground">
                  Custom Export Masterlist
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Choose your preferred format and select custom columns from the User and Wage Management tables.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 min-h-0">
          {/* 1. Format & Scope Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Format Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <FileSpreadsheet className="h-3.5 w-3.5 text-cyan-500" />
                Export Format
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setFormat("excel")}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                    format === "excel"
                      ? "bg-emerald-500/15 border-emerald-500 text-emerald-700 dark:text-emerald-300 shadow-xs"
                      : "bg-background border-border text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <FileSpreadsheet className="h-4 w-4 mb-1 text-emerald-600 dark:text-emerald-400" />
                  <span>Excel (.xlsx)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFormat("pdf")}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                    format === "pdf"
                      ? "bg-rose-500/15 border-rose-500 text-rose-700 dark:text-rose-300 shadow-xs"
                      : "bg-background border-border text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <FileText className="h-4 w-4 mb-1 text-rose-600 dark:text-rose-400" />
                  <span>PDF (.pdf)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFormat("csv")}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                    format === "csv"
                      ? "bg-cyan-500/15 border-cyan-500 text-cyan-700 dark:text-cyan-300 shadow-xs"
                      : "bg-background border-border text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <TableIcon className="h-4 w-4 mb-1 text-cyan-600 dark:text-cyan-400" />
                  <span>CSV (.csv)</span>
                </button>
              </div>
            </div>

            {/* Scope & Options */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5 text-indigo-500" />
                Data Scope &amp; Layout
              </label>
              <div className="flex items-center gap-2">
                <div className="grid grid-cols-2 gap-2 flex-1">
                  <button
                    type="button"
                    onClick={() => setScope("filtered")}
                    className={`px-3 py-2 rounded-xl border text-xs font-medium transition-all text-center ${
                      scope === "filtered"
                        ? "bg-primary/10 border-primary text-primary font-semibold"
                        : "bg-background border-border text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    Filtered ({filteredRecords.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setScope("all")}
                    className={`px-3 py-2 rounded-xl border text-xs font-medium transition-all text-center ${
                      scope === "all"
                        ? "bg-primary/10 border-primary text-primary font-semibold"
                        : "bg-background border-border text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    All Records ({allRecords.length})
                  </button>
                </div>

                {format === "pdf" && (
                  <div className="flex rounded-xl border border-border p-0.5 bg-background text-xs">
                    <button
                      type="button"
                      onClick={() => setOrientation("landscape")}
                      className={`px-2 py-1.5 rounded-lg font-medium transition ${
                        orientation === "landscape"
                          ? "bg-muted font-bold text-foreground"
                          : "text-muted-foreground"
                      }`}
                      title="Landscape Orientation"
                    >
                      Landscape
                    </button>
                    <button
                      type="button"
                      onClick={() => setOrientation("portrait")}
                      className={`px-2 py-1.5 rounded-lg font-medium transition ${
                        orientation === "portrait"
                          ? "bg-muted font-bold text-foreground"
                          : "text-muted-foreground"
                      }`}
                      title="Portrait Orientation"
                    >
                      Portrait
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 2. Quick Presets Toolbar */}
          <div className="rounded-xl bg-muted/40 border border-border/60 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                Quick Selection Presets
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={selectAll}
                  className="text-[11px] text-cyan-600 dark:text-cyan-400 hover:underline font-medium cursor-pointer"
                >
                  Select All
                </button>
                <span className="text-muted-foreground/40">•</span>
                <button
                  type="button"
                  onClick={deselectAll}
                  className="text-[11px] text-muted-foreground hover:text-foreground font-medium cursor-pointer"
                >
                  Clear All
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {EXPORT_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => applyPreset(preset.id)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-background border border-border hover:bg-muted hover:border-cyan-500/50 text-foreground transition-all cursor-pointer"
                >
                  <CheckCheck className="h-3 w-3 text-cyan-500" />
                  <span>{preset.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 3. Column Alignment Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-muted/30 border border-border/50 text-xs">
            <div className="flex items-center gap-1.5 text-foreground font-semibold">
              <SlidersHorizontal className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400" />
              <span>Column Alignment:</span>
              <span className="text-[11px] font-normal text-muted-foreground">
                (Adjust per column or apply globally)
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setAllAlignments("smart")}
                className="px-2.5 py-1 rounded-lg text-[11px] font-semibold border border-border bg-background hover:bg-muted text-foreground transition-colors cursor-pointer"
                title="Smart Auto alignments (Numbers right, Codes/Status center, Text left)"
              >
                Smart Auto
              </button>
              <button
                type="button"
                onClick={() => setAllAlignments("left")}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium border border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                title="Align all columns to the left"
              >
                <AlignLeft className="h-3 w-3" />
                <span>All Left</span>
              </button>
              <button
                type="button"
                onClick={() => setAllAlignments("center")}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium border border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                title="Align all columns to center"
              >
                <AlignCenter className="h-3 w-3" />
                <span>All Center</span>
              </button>
              <button
                type="button"
                onClick={() => setAllAlignments("right")}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium border border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                title="Align all columns to the right"
              >
                <AlignRight className="h-3 w-3" />
                <span>All Right</span>
              </button>
            </div>
          </div>

          {/* 4. Column Selection & Ordering Section */}
          <div className="space-y-2.5">
            {/* View Mode Toggle: Choose Fields vs Reorder Sequence */}
            <div className="flex items-center justify-between pb-1">
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-muted/60 border border-border/70 text-xs">
                <button
                  type="button"
                  onClick={() => setViewMode("fields")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    viewMode === "fields"
                      ? "bg-card text-foreground shadow-2xs font-bold border border-border/60"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Layers className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400" />
                  <span>Choose Fields</span>
                  <Badge variant="secondary" className="px-1.5 py-0 h-4 text-[10px]">
                    {selectedColumnIds.length}
                  </Badge>
                </button>

                <button
                  type="button"
                  onClick={() => setViewMode("order")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    viewMode === "order"
                      ? "bg-card text-foreground shadow-2xs font-bold border border-border/60"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <ListOrdered className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span>Column Sequence &amp; Order</span>
                  {selectedColumnIds.length > 0 && (
                    <Badge variant="secondary" className="px-1.5 py-0 h-4 text-[10px] bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/20">
                      #{selectedColumnIds.length}
                    </Badge>
                  )}
                </button>
              </div>

              {viewMode === "order" && selectedColumnIds.length > 1 && (
                <button
                  type="button"
                  onClick={resetColumnOrderToDefault}
                  className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors cursor-pointer font-medium"
                  title="Reset column order to default category arrangement"
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>Reset Default Order</span>
                </button>
              )}
            </div>

            {/* View 1: Categorized Column Grid */}
            {viewMode === "fields" && (
              <ScrollArea className="h-60 sm:h-72 pr-3 border border-border/70 rounded-xl bg-muted/10 p-3">
                <div className="space-y-4">
                  {(Array.from(groupedColumns.entries()) as [ExportCategory, typeof EXPORT_COLUMNS][]).map(
                    ([category, columns]) => {
                      const meta = CATEGORY_META[category];
                      const Icon = meta.icon;
                      const catIds = columns.map((c) => c.id);
                      const selectedCount = catIds.filter((id) =>
                        selectedColumnIds.includes(id)
                      ).length;
                      const allSelected = selectedCount === catIds.length;

                      return (
                        <div
                          key={category}
                          className="rounded-xl border border-border/70 bg-card p-3 space-y-2.5"
                        >
                          {/* Category Header */}
                          <div className="flex items-center justify-between pb-2 border-b border-border/50">
                            <div className="flex items-center gap-2">
                              <Icon className={`h-4 w-4 ${meta.color}`} />
                              <span className="text-xs font-bold text-foreground">
                                {meta.label}
                              </span>
                              <Badge
                                variant="secondary"
                                className="text-[10px] px-1.5 py-0 h-4"
                              >
                                {selectedCount}/{columns.length}
                              </Badge>
                            </div>
                            <button
                              type="button"
                              onClick={() => toggleCategory(category)}
                              className="text-[11px] text-cyan-600 dark:text-cyan-400 hover:underline font-medium cursor-pointer"
                            >
                              {allSelected ? "Deselect Group" : "Select Group"}
                            </button>
                          </div>

                          {/* Column Checkboxes Grid */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                            {columns.map((col) => {
                              const checked = selectedColumnIds.includes(col.id);
                              const orderIndex = selectedColumnIds.indexOf(col.id);
                              const currentAlign = columnAlignments[col.id] || col.defaultAlignment;

                              return (
                                <div
                                  key={col.id}
                                  onClick={() => toggleColumn(col.id)}
                                  className={`flex items-center justify-between gap-2 p-2 rounded-lg text-xs cursor-pointer transition-all border ${
                                    checked
                                      ? "bg-cyan-500/5 dark:bg-cyan-950/20 border-cyan-500/30 text-foreground font-medium"
                                      : "bg-background border-border/60 text-muted-foreground hover:bg-muted"
                                  }`}
                                >
                                  <div className="flex items-center gap-2 min-w-0 flex-1">
                                    <Checkbox
                                      checked={checked}
                                      onCheckedChange={() => toggleColumn(col.id)}
                                    />
                                    {checked && (
                                      <span
                                        className="px-1 rounded text-[10px] font-bold bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30 shrink-0"
                                        title={`Column #${orderIndex + 1} in export sequence`}
                                      >
                                        #{orderIndex + 1}
                                      </span>
                                    )}
                                    <span className="truncate" title={col.label}>
                                      {col.label}
                                    </span>
                                  </div>

                                  {/* Order Nudge + Alignment Controls */}
                                  <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                                    {checked && (
                                      <div className="flex items-center rounded-md border border-border/60 p-0.5 bg-background/80">
                                        <button
                                          type="button"
                                          title="Move up in column order"
                                          disabled={orderIndex <= 0}
                                          onClick={() => moveColumnUp(col.id)}
                                          className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-20 transition cursor-pointer"
                                        >
                                          <ArrowUp className="h-2.5 w-2.5" />
                                        </button>
                                        <button
                                          type="button"
                                          title="Move down in column order"
                                          disabled={orderIndex >= selectedColumnIds.length - 1}
                                          onClick={() => moveColumnDown(col.id)}
                                          className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-20 transition cursor-pointer"
                                        >
                                          <ArrowDown className="h-2.5 w-2.5" />
                                        </button>
                                      </div>
                                    )}

                                    {/* Alignment segmented buttons */}
                                    <div
                                      className={`flex items-center rounded-md border p-0.5 shrink-0 transition-opacity ${
                                        checked
                                          ? "border-border/80 bg-background/90 opacity-100"
                                          : "border-border/40 bg-muted/30 opacity-30 hover:opacity-80"
                                      }`}
                                    >
                                      <button
                                        type="button"
                                        title={checked ? `Align ${col.label} Left` : `Select ${col.label} to align left`}
                                        onClick={() => {
                                          if (!checked) toggleColumn(col.id);
                                          setColumnAlignment(col.id, "left");
                                        }}
                                        className={`p-1 rounded transition-colors cursor-pointer ${
                                          currentAlign === "left" && checked
                                            ? "bg-cyan-600 text-white dark:bg-cyan-500 shadow-2xs font-bold"
                                            : currentAlign === "left" && !checked
                                            ? "bg-muted text-muted-foreground font-medium"
                                            : "text-muted-foreground hover:text-foreground hover:bg-muted"
                                        }`}
                                      >
                                        <AlignLeft className="h-3 w-3" />
                                      </button>
                                      <button
                                        type="button"
                                        title={checked ? `Align ${col.label} Center` : `Select ${col.label} to align center`}
                                        onClick={() => {
                                          if (!checked) toggleColumn(col.id);
                                          setColumnAlignment(col.id, "center");
                                        }}
                                        className={`p-1 rounded transition-colors cursor-pointer ${
                                          currentAlign === "center" && checked
                                            ? "bg-cyan-600 text-white dark:bg-cyan-500 shadow-2xs font-bold"
                                            : currentAlign === "center" && !checked
                                            ? "bg-muted text-muted-foreground font-medium"
                                            : "text-muted-foreground hover:text-foreground hover:bg-muted"
                                        }`}
                                      >
                                        <AlignCenter className="h-3 w-3" />
                                      </button>
                                      <button
                                        type="button"
                                        title={checked ? `Align ${col.label} Right` : `Select ${col.label} to align right`}
                                        onClick={() => {
                                          if (!checked) toggleColumn(col.id);
                                          setColumnAlignment(col.id, "right");
                                        }}
                                        className={`p-1 rounded transition-colors cursor-pointer ${
                                          currentAlign === "right" && checked
                                            ? "bg-cyan-600 text-white dark:bg-cyan-500 shadow-2xs font-bold"
                                            : currentAlign === "right" && !checked
                                            ? "bg-muted text-muted-foreground font-medium"
                                            : "text-muted-foreground hover:text-foreground hover:bg-muted"
                                        }`}
                                      >
                                        <AlignRight className="h-3 w-3" />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              </ScrollArea>
            )}

            {/* View 2: Column Sequence & Reordering List */}
            {viewMode === "order" && (
              <ScrollArea className="h-60 sm:h-72 pr-3 border border-border/70 rounded-xl bg-muted/10 p-3">
                {selectedColumnIds.length === 0 ? (
                  <div className="h-48 flex flex-col items-center justify-center p-6 text-center text-muted-foreground space-y-2">
                    <ListOrdered className="h-8 w-8 text-muted-foreground/40" />
                    <p className="text-sm font-semibold">No columns selected</p>
                    <p className="text-xs max-w-xs">
                      Switch to &quot;Choose Fields&quot; tab to select which columns to include in your export.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground px-1 pb-1">
                      <span>Click arrows to change the exact column sequence in the export file:</span>
                      <span>Total: <strong>{selectedColumnIds.length}</strong> columns</span>
                    </div>

                    <div className="space-y-1.5">
                      {selectedColumnIds.map((colId, index) => {
                        const col = EXPORT_COLUMNS.find((c) => c.id === colId);
                        if (!col) return null;
                        const meta = CATEGORY_META[col.category];
                        const Icon = meta.icon;
                        const align = columnAlignments[col.id] || col.defaultAlignment;

                        return (
                          <div
                            key={col.id}
                            className="flex items-center justify-between gap-3 p-2 rounded-xl border border-border/70 bg-card hover:bg-muted/40 transition-all text-xs"
                          >
                            {/* Left: Position Rank Badge + Category Icon + Column Title */}
                            <div className="flex items-center gap-2.5 min-w-0 flex-1">
                              <span className="flex h-5 w-6 shrink-0 items-center justify-center rounded-md bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 font-bold text-[10px] border border-cyan-500/30">
                                #{index + 1}
                              </span>
                              <Icon className={`h-3.5 w-3.5 shrink-0 ${meta.color}`} />
                              <div className="min-w-0 truncate flex items-center gap-2">
                                <span className="font-semibold text-foreground truncate">
                                  {col.label}
                                </span>
                                <span className="text-[10px] text-muted-foreground shrink-0 hidden sm:inline">
                                  ({meta.label})
                                </span>
                                <Badge variant="outline" className="text-[10px] py-0 px-1.5 h-4 capitalize shrink-0 text-muted-foreground">
                                  Align: {align}
                                </Badge>
                              </div>
                            </div>

                            {/* Right: Reorder Action Buttons */}
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                title="Move to Top"
                                disabled={index === 0}
                                onClick={() => moveColumnToTop(col.id)}
                                className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-25 disabled:pointer-events-none transition cursor-pointer"
                              >
                                <ChevronsUp className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                title="Move Up"
                                disabled={index === 0}
                                onClick={() => moveColumnUp(col.id)}
                                className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-25 disabled:pointer-events-none transition cursor-pointer"
                              >
                                <ArrowUp className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                title="Move Down"
                                disabled={index === selectedColumnIds.length - 1}
                                onClick={() => moveColumnDown(col.id)}
                                className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-25 disabled:pointer-events-none transition cursor-pointer"
                              >
                                <ArrowDown className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                title="Move to Bottom"
                                disabled={index === selectedColumnIds.length - 1}
                                onClick={() => moveColumnToBottom(col.id)}
                                className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-25 disabled:pointer-events-none transition cursor-pointer"
                              >
                                <ChevronsDown className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                title="Remove from export"
                                onClick={() => toggleColumn(col.id)}
                                className="p-1 rounded-md text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 transition cursor-pointer ml-1"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </ScrollArea>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <DialogFooter className="shrink-0 p-3 sm:p-4 border-t border-border/60 bg-muted/20 flex items-center justify-between sm:justify-between w-full">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>
              Target: <strong className="text-foreground">{targetRecords.length}</strong> employees
            </span>
            <span>•</span>
            <span>
              Columns: <strong className="text-foreground">{selectedColumnIds.length}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isExporting}
              className="text-xs border-border"
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleExecuteExport}
              disabled={selectedColumnIds.length === 0 || isExporting || targetRecords.length === 0}
              className="gap-2 text-xs bg-cyan-600 hover:bg-cyan-700 text-white dark:bg-cyan-600 dark:hover:bg-cyan-500 shadow-xs cursor-pointer font-semibold"
            >
              {isExporting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Generating {format.toUpperCase()}...</span>
                </>
              ) : (
                <>
                  <Download className="h-3.5 w-3.5" />
                  <span>Download {format.toUpperCase()}</span>
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
