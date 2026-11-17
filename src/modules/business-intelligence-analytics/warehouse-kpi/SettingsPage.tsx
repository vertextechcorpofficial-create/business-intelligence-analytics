"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AlertCircle, ArrowLeft, CalendarClock, Check, Clock3, History, LoaderCircle, RefreshCw, Settings2, ShieldCheck, SlidersHorizontal, Target, Weight } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { warehouseRequest, sessionFetch } from "./api";
import SettingsForm, { phToday } from "./SettingsForm";

type Version = Record<string, unknown>;
type Settings = { current?: Version | null; next?: Version | null; editable?: boolean; history?: Version[] };

const KPI_LABELS: Record<string, string> = {
  "inventory-accuracy": "Inventory accuracy", "picking-accuracy": "Picking accuracy",
  "stocking-level-accuracy": "Stocking level", "loading-readiness": "Loading readiness",
  "location-compliance": "Location compliance", "receiving-accuracy": "Receiving accuracy",
  housekeeping: "Housekeeping / 5S", "sop-safety": "SOP & safety", "damage-loss": "Stock damage / loss",
  "customer-satisfaction": "Customer satisfaction",
};
const dateText = (value: unknown) => typeof value === "string" ? new Date(`${value.slice(0, 10)}T00:00:00`).toLocaleDateString("en-PH", { year: "numeric", month: "short", day: "numeric" }) : "—";
const scalar = (value: unknown, fallback = "—") => value === null || value === undefined ? fallback : String(value);

export default function SettingsPage({ isAdmin = false }: { isAdmin?: boolean }) {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);

  async function loadSettings(signal?: AbortSignal) {
    const result = await warehouseRequest<Settings>("settings", signal);
    setSettings(previous => ({ ...result, history: previous?.history }));
  }

  useEffect(() => {
    const controller = new AbortController();
    loadSettings(controller.signal).catch(reason => { if (!controller.signal.aborted) setError(reason instanceof Error ? reason.message : "Unable to load settings."); });
    return () => controller.abort();
  }, []);

  const current = settings?.current ?? null;
  const next = settings?.next ?? null;
  const weights = (current?.weights && typeof current.weights === "object" ? current.weights : {}) as Record<string, unknown>;
  const historySorted = useMemo(() => [...(settings?.history ?? [])].sort((a, b) => String(b.effectiveFrom ?? "").localeCompare(String(a.effectiveFrom ?? "")) || Number(b.id) - Number(a.id)), [settings?.history]);
  const timeline = useMemo(() => {
    if (settings?.history?.length) return [...settings.history]
      .filter(version => !version.cancelledAt)
      .sort((a, b) => String(a.effectiveFrom ?? "").localeCompare(String(b.effectiveFrom ?? "")) || Number(a.id) - Number(b.id));
    return [current, next].filter((version): version is Version => Boolean(version));
  }, [settings?.history, current, next]);
  const totalWeight = Object.values(weights).reduce<number>((sum, value) => sum + (typeof value === "number" ? value : 0), 0);

  async function loadHistory() {
    setBusy(true); setError("");
    try {
      const result = await warehouseRequest<Version[]>("settings/history");
      setSettings(value => ({ ...(value ?? {}), history: result }));
      setHistoryLoaded(true);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Unable to load version history."); }
    finally { setBusy(false); }
  }

  async function cancelVersion(id: unknown) {
    if (typeof id !== "number" || !Number.isInteger(id)) return;
    setBusy(true); setError("");
    try {
      if (!window.confirm(`Cancel scheduled version ${id}? This will remain in the audit history.`)) return;
      const response = await sessionFetch(`/api/bia/warehouse-kpi/settings/${id}`, { method: "DELETE", cache: "no-store" });
      if (!response.ok) {
        const body = await response.json().catch(() => null) as { errors?: string[]; message?: string } | null;
        const fallback = response.status === 403 ? "Administrator access required. Reload the page to refresh your permissions." : response.status === 404 ? "This version no longer exists. Refresh the history." : response.status === 409 ? "This version is already effective or cancelled, or settings are no longer editable. Refresh before retrying." : `Cancel failed (${response.status}).`;
        throw new Error(body?.errors?.join(" · ") || body?.message || fallback);
      }
      await loadSettings();
      await loadHistory();
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Unable to cancel version."); }
    finally { setBusy(false); }
  }

  const today = phToday();
  return <main className="mx-auto w-full max-w-7xl space-y-7 px-4 py-6 sm:px-6 lg:px-8">
    <header className="flex flex-col justify-between gap-4 border-b pb-6 sm:flex-row sm:items-end">
      <div className="space-y-1.5"><div className="flex items-center gap-2 text-sm font-medium text-primary"><Settings2 className="size-4" /> Dashboard configuration</div><h1 className="text-3xl font-semibold tracking-tight">Warehouse KPI settings</h1><p className="max-w-2xl text-sm text-muted-foreground">Review scoring targets, KPI weights, and effective-dated configuration versions.</p></div>
      <div className="flex shrink-0 items-center gap-2"><Button asChild variant="outline"><Link href="/bia/warehouse-kpi"><ArrowLeft className="mr-2 size-4" />Back to dashboard</Link></Button><Button variant="outline" disabled={busy} onClick={() => { setBusy(true); setError(""); loadSettings().catch(reason => setError(reason instanceof Error ? reason.message : "Refresh failed.")).finally(() => setBusy(false)); }}><RefreshCw className={`mr-2 size-4 ${busy ? "animate-spin" : ""}`} />Refresh</Button></div>
    </header>

    {error && <Alert variant="destructive"><AlertCircle className="size-4" /><AlertDescription>{error}</AlertDescription></Alert>}
    {!settings && !error && <div role="status" className="flex items-center gap-2 rounded-lg border bg-card p-6 text-sm text-muted-foreground"><LoaderCircle className="size-4 animate-spin" />Loading warehouse KPI configuration…</div>}
    {settings && <>
      {!isAdmin && <p className="rounded-lg border p-3 text-sm text-muted-foreground">Read-only access. Administrator permission is required to manage versions.</p>}
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(280px,1fr)]">
        <Card className="overflow-hidden">
          <CardHeader className="border-b bg-muted/20 pb-4"><div className="flex items-start justify-between gap-3"><div><CardTitle className="flex items-center gap-2"><SlidersHorizontal className="size-5 text-primary" />Current configuration</CardTitle><CardDescription className="mt-1">The settings version used for scoring periods ending in its effective window.</CardDescription></div><Badge variant="outline" className="shrink-0"><ShieldCheck className="mr-1 size-3.5" />{settings.editable ? "Managed" : "Read-only"}</Badge></div></CardHeader>
          <CardContent className="space-y-5 pt-5">
            {!settings.editable && <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 px-3 py-2 text-sm text-muted-foreground">Configuration is controlled by the server. Contact an administrator to change it.</div>}
            {current ? <>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border bg-background p-4"><div className="flex items-center gap-2 text-sm text-muted-foreground"><CalendarClock className="size-4" />Effective from</div><p className="mt-2 text-lg font-semibold">{dateText(current.effectiveFrom)}</p></div>
                <div className="rounded-xl border bg-background p-4"><div className="flex items-center gap-2 text-sm text-muted-foreground"><Target className="size-4" />Overall passing target</div><p className="mt-2 text-lg font-semibold">{scalar(current.overallTargetPercent)}<span className="ml-1 text-sm font-normal text-muted-foreground">%</span></p></div>
                <div className="rounded-xl border bg-background p-4"><div className="flex items-center gap-2 text-sm text-muted-foreground"><Weight className="size-4" />Damage allowance</div><p className="mt-2 text-lg font-semibold">{scalar(current.damageAllowedLossPercent)}<span className="ml-1 text-sm font-normal text-muted-foreground">% loss</span></p></div>
                <div className="rounded-xl border bg-background p-4"><div className="flex items-center gap-2 text-sm text-muted-foreground"><Clock3 className="size-4" />Loading thresholds</div><p className="mt-2 text-sm font-medium">Excellent ≤ {scalar(current.loadingExcellentMinutes)} min</p><p className="text-sm text-muted-foreground">On time ≤ {scalar(current.loadingOnTimeMinutes)} min</p></div>
              </div>
              <Separator />
              <p className="text-sm text-muted-foreground">Daily location checks: {scalar(current.locationCheckPickedSkus)} picked SKUs + {scalar(current.locationCheckRotationSkus)} rotation SKUs.</p>
              <div><div className="mb-3 flex items-center justify-between gap-3"><div><h3 className="text-sm font-semibold">KPI weight distribution</h3><p className="text-xs text-muted-foreground">Contribution to the overall score</p></div><Badge variant={totalWeight === 100 ? "secondary" : "destructive"}>{totalWeight} / 100{totalWeight === 100 && <Check className="ml-1 size-3" />}</Badge></div>
                <div className="grid gap-x-6 gap-y-3 sm:grid-cols-2">{Object.entries(KPI_LABELS).map(([key, label]) => { const weight = typeof weights[key] === "number" ? weights[key] as number : 0; return <div key={key} className="space-y-1.5"><div className="flex justify-between gap-3 text-sm"><span>{label}</span><span className="font-medium tabular-nums">{weight}%</span></div><div className="h-1.5 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary/75" style={{ width: `${Math.max(0, Math.min(100, weight))}%` }} /></div></div>; })}</div>
              </div>
            </> : <p className="text-sm text-muted-foreground">No current settings were returned.</p>}
            {Array.isArray(current?.warehouseBranchIds) && <div className="rounded-lg bg-muted/40 p-3"><p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Configured warehouses</p><div className="flex flex-wrap gap-1.5">{(current.warehouseBranchIds as unknown[]).map(id => <Badge key={String(id)} variant="outline">Branch #{String(id)}</Badge>)}</div></div>}
          </CardContent>
        </Card>

        <Card className="h-fit">
          <CardHeader className="border-b bg-muted/20 pb-4"><CardTitle className="flex items-center gap-2"><CalendarClock className="size-5 text-primary" />Effective timeline</CardTitle><CardDescription>Settings are selected using the last day of the report period.</CardDescription></CardHeader>
          <CardContent className="space-y-4 pt-5">
            {timeline.length > 0 ? <ol className="relative space-y-0">{timeline.map((version, index) => {
              const isCurrent = String(version.id) === String(current?.id);
              const isNext = String(version.id) === String(next?.id);
              return <li key={`${String(version.id)}-${String(version.effectiveFrom)}`} className="relative min-h-24 pb-5 pl-8 last:min-h-0 last:pb-0">
                {index < timeline.length - 1 && <span aria-hidden="true" className="absolute bottom-0 left-[7px] top-3 w-px bg-border" />}
                <span aria-hidden="true" className={`absolute left-0 top-1 size-4 rounded-full border-4 bg-background ${isCurrent ? "border-primary" : isNext ? "border-amber-500" : "border-muted-foreground/50"}`} />
                <div className="flex flex-wrap items-center gap-2"><span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">v{scalar(version.id)}</span>{isCurrent && <Badge variant="default">Current</Badge>}{isNext && !isCurrent && <Badge variant="secondary">Scheduled</Badge>}</div>
                <p className="mt-1 font-medium">Effective {dateText(version.effectiveFrom)}</p><p className="text-sm text-muted-foreground">Target {scalar(version.overallTargetPercent)}% · Damage allowance {scalar(version.damageAllowedLossPercent)}%</p>
                {typeof version.reason === "string" && version.reason && <p className="mt-1 text-xs text-muted-foreground">{version.reason}</p>}
              </li>;
            })}</ol> : <div className="rounded-lg border border-dashed p-3 text-sm text-muted-foreground">No active versions found.</div>}
            {isAdmin && !historyLoaded && <p className="text-xs text-muted-foreground">Load history below to show all effective versions on this timeline.</p>}
            <p className="text-xs text-muted-foreground">A report spanning multiple versions uses the version in effect on its end date.</p>
          </CardContent>
        </Card>
      </div>

      {isAdmin && settings.editable && current && <SettingsForm key={String(current.id)} current={current} labels={KPI_LABELS} onSaved={async () => { await loadSettings(); await loadHistory(); }} />}
      {isAdmin && <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3 border-b bg-muted/20"><div><CardTitle className="flex items-center gap-2"><History className="size-5 text-primary" />Version history</CardTitle><CardDescription className="mt-1">Audit trail of saved and cancelled configurations.</CardDescription></div><Button variant="outline" size="sm" disabled={busy} onClick={loadHistory}>{busy ? <LoaderCircle className="mr-2 size-4 animate-spin" /> : <History className="mr-2 size-4" />}{historyLoaded ? "Refresh history" : "Load history"}</Button></CardHeader>
        <CardContent className="pt-4">{!historyLoaded ? <div className="rounded-lg border border-dashed px-4 py-8 text-center"><History className="mx-auto mb-2 size-6 text-muted-foreground" /><p className="text-sm font-medium">Version history is ready</p><p className="mt-1 text-sm text-muted-foreground">Load the audit trail to review prior changes.</p></div> : historySorted.length === 0 ? <p className="py-6 text-center text-sm text-muted-foreground">No versions found.</p> : <Table><TableHeader><TableRow><TableHead>Version</TableHead><TableHead>Effective from</TableHead><TableHead>Target</TableHead><TableHead>Damage allowance</TableHead><TableHead>Reason</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Action</TableHead></TableRow></TableHeader><TableBody>{historySorted.map(version => {
          const cancelled = Boolean(version.cancelledAt);
          const future = String(version.effectiveFrom ?? "") > today;
          const canCancel = settings.editable && !cancelled && future;
          return <TableRow key={String(version.id)} className={cancelled ? "opacity-60" : ""}><TableCell className="font-medium">v{String(version.id)}</TableCell><TableCell>{dateText(version.effectiveFrom)}</TableCell><TableCell>{scalar(version.overallTargetPercent)}%</TableCell><TableCell>{scalar(version.damageAllowedLossPercent)}%</TableCell><TableCell className="max-w-[260px] truncate" title={scalar(version.reason, "No reason provided")}>{scalar(version.reason, "—")}</TableCell><TableCell><Badge variant={cancelled ? "outline" : future ? "secondary" : "outline"}>{cancelled ? "Cancelled" : future ? "Scheduled" : "Effective"}</Badge></TableCell><TableCell className="text-right">{canCancel && <Button size="sm" variant="outline" disabled={busy} onClick={() => cancelVersion(version.id)}>Cancel version</Button>}</TableCell></TableRow>;
        })}</TableBody></Table>}
        {historyLoaded && historySorted.length > 0 && <details className="mt-4 rounded-lg border p-3"><summary className="cursor-pointer text-sm font-medium">Saved and cancelled audit details</summary><div className="mt-3 space-y-3">{historySorted.map(version => <div key={String(version.id)} className="rounded bg-muted/40 p-3 text-sm"><p className="font-medium">Version {scalar(version.id)}</p><p>Saved by {version.createdBy == null ? "Setup script" : `User #${String(version.createdBy)}`} · {scalar(version.createdAt)}</p>{Boolean(version.cancelledAt) && <p>Cancelled by {version.cancelledBy == null ? "Setup script" : `User #${String(version.cancelledBy)}`} · {scalar(version.cancelledAt)}</p>}<p className="mt-1 whitespace-pre-wrap break-words text-muted-foreground">{scalar(version.reason, "No reason provided")}</p></div>)}</div></details>}
        </CardContent>
      </Card>}
    </>}
  </main>;
}
