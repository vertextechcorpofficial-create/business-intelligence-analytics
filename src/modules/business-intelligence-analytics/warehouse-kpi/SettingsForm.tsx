"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { sessionFetch } from "./api";

export function phToday() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Manila", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
}

const fields = [
  ["overallTargetPercent", "Overall target (%)", 1, 100],
  ["loadingExcellentMinutes", "Excellent loading (minutes)", 1, 65534],
  ["loadingOnTimeMinutes", "On-time loading (minutes)", 1, 65535],
  ["locationCheckPickedSkus", "Picked SKUs", 0, 65535],
  ["locationCheckRotationSkus", "Rotation SKUs", 1, 65535],
  ["damageAllowedLossPercent", "Allowed damage / loss (%)", 0.01, 100],
] as const;

export default function SettingsForm({ current, labels, onSaved }: { current: Record<string, unknown>; labels: Record<string, string>; onSaved: () => Promise<void> }) {
  const [draft, setDraft] = useState<Record<string, string>>(() => Object.fromEntries(fields.map(([key]) => [key, String(current[key] ?? "")])));
  const [weights, setWeights] = useState<Record<string, string>>(() => Object.fromEntries(Object.keys(labels).map(key => [key, String((current.weights as Record<string, unknown> | undefined)?.[key] ?? 0)])));
  const [date, setDate] = useState(phToday());
  const [ids, setIds] = useState((current.warehouseBranchIds as number[] | undefined) ?? []);
  const [reason, setReason] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [options, setOptions] = useState<Array<{ id: number; name: string; lastPickingBatchAt: string | null }>>([]);
  const [search, setSearch] = useState("");
  const total = Object.values(weights).reduce((sum, value) => sum + Number(value), 0);
  const today = phToday();
  const min = `${today.slice(0, 7)}-01`;
  const maxDate = new Date(`${today}T00:00:00Z`); maxDate.setUTCFullYear(maxDate.getUTCFullYear() + 1);
  const max = maxDate.toISOString().slice(0, 10);
  const fieldErrors = (key: string) => errors.filter(error => error.startsWith(key)).map(error => <p key={error} className="text-xs text-destructive">{error}</p>);

  async function submit(event: React.FormEvent) {
    event.preventDefault(); setSaved(false);
    const issues: string[] = [];
    if (!date || date < min || date > max) issues.push(`effectiveFrom must be between ${min} and ${max} (Philippine time).`);
    for (const [key, , low, high] of fields) {
      const value = Number(draft[key]);
      if (!draft[key] || !Number.isFinite(value) || value < low || value > high) issues.push(`${key} must be between ${low} and ${high}.`);
      if (key !== "damageAllowedLossPercent" && key !== "overallTargetPercent" && !Number.isInteger(value)) issues.push(`${key} must be a whole number.`);
    }
    if (Number(draft.loadingExcellentMinutes) >= Number(draft.loadingOnTimeMinutes)) issues.push("loadingExcellentMinutes must be less than loadingOnTimeMinutes.");
    if (!/^\d+(\.\d{1,2})?$/.test(draft.damageAllowedLossPercent)) issues.push("damageAllowedLossPercent must have at most 2 decimals.");
    if (total !== 100 || Object.values(weights).some(value => value.trim() === "" || !Number.isFinite(Number(value)) || Number(value) < 0 || Number(value) > 100)) issues.push("weights must each be 0–100 and total exactly 100.");
    if (!ids.length || new Set(ids).size !== ids.length) issues.push("warehouseBranchIds must include at least one unique warehouse.");
    if (reason.length > 500) issues.push("reason must be at most 500 characters.");
    setErrors(issues); if (issues.length) return;
    setBusy(true);
    try {
      const response = await sessionFetch("/api/bia/warehouse-kpi/settings", { method: "POST", cache: "no-store", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ effectiveFrom: date, ...Object.fromEntries(Object.entries(draft).map(([key, value]) => [key, Number(value)])), weights: Object.fromEntries(Object.entries(weights).map(([key, value]) => [key, Number(value)])), warehouseBranchIds: ids, reason }) });
      const body = await response.json().catch(() => null);
      if (!response.ok) { setErrors(body?.errors ?? [body?.message ?? (response.status === 403 ? "Administrator access required." : response.status === 409 ? "Settings are not editable. Refresh and retry." : `Save failed (${response.status}).`)]); return; }
      setSaved(true); await onSaved();
    } catch { setErrors(["The service is unavailable. Please retry."]); }
    finally { setBusy(false); }
  }

  return <Card><CardHeader><CardTitle>Create a settings version</CardTitle><p className="text-sm text-muted-foreground">Prefilled from the current version. Saving creates a new version; it never overwrites history.</p></CardHeader><CardContent><form onSubmit={submit} className="space-y-5" noValidate>
    {saved && <p role="status" className="rounded border p-3">Version saved successfully.</p>}
    {errors.length > 0 && <ul role="alert" className="rounded border border-destructive p-3 text-sm text-destructive">{errors.map(error => <li key={error}>{error}</li>)}</ul>}
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"><div className="space-y-2"><Label htmlFor="effectiveFrom">Effective from (PH time)</Label><Input id="effectiveFrom" type="date" min={min} max={max} value={date} onChange={event => setDate(event.target.value)} />{fieldErrors("effectiveFrom")}</div>{fields.map(([key, title, low, high]) => <div key={key} className="space-y-2"><Label htmlFor={key}>{title}</Label><Input id={key} type="number" min={low} max={high} step={key === "damageAllowedLossPercent" ? "0.01" : "1"} value={draft[key]} onChange={event => setDraft(value => ({ ...value, [key]: event.target.value }))} />{fieldErrors(key)}</div>)}</div>
    <fieldset className="space-y-3"><legend className="font-medium">Card weights · {total} / 100</legend>{fieldErrors("weights")}<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{Object.entries(labels).map(([key, title]) => <div key={key} className="space-y-2"><Label htmlFor={`weight-${key}`}>{title} (%)</Label><Input id={`weight-${key}`} type="number" min="0" max="100" value={weights[key]} onChange={event => setWeights(value => ({ ...value, [key]: event.target.value }))} /></div>)}</div></fieldset>
    <fieldset className="space-y-3"><legend className="font-medium">Warehouse selection</legend><p className="text-sm text-muted-foreground">Current selections are retained. Bad-stock branches are excluded; final eligibility is validated by the backend.</p><Button type="button" variant="outline" onClick={async () => { try {
      const [warehouseResponse, branchResponse] = await Promise.all([
        sessionFetch(`/api/bia/warehouse-kpi/warehouses?to=${date || today}`, { cache: "no-store" }),
        sessionFetch("/api/bia/warehouse-kpi/branches", { cache: "no-store" }),
      ]);
      if (!warehouseResponse.ok || !branchResponse.ok) throw new Error();
      const warehouses = await warehouseResponse.json() as Array<{ id: number; name: string; lastPickingBatchAt: string | null }>;
      const { branches } = await branchResponse.json() as { branches: Array<{ id: string; name: string }> };
      setOptions(branches.filter(branch => !/bad\s*stock/i.test(branch.name)).map(branch => ({ id: Number(branch.id), name: branch.name, lastPickingBatchAt: warehouses.find(warehouse => warehouse.id === Number(branch.id))?.lastPickingBatchAt ?? null })));
    } catch { setErrors(["warehouseBranchIds: unable to load warehouse options."]); } }}>Load eligible branches</Button><Input aria-label="Search warehouse branches" placeholder="Search branches…" value={search} onChange={event => setSearch(event.target.value)} /><div className="grid max-h-80 gap-2 overflow-y-auto sm:grid-cols-2">{Array.from(new Set([...ids, ...options.map(option => option.id)])).filter(id => (options.find(option => option.id === id)?.name ?? String(id)).toLowerCase().includes(search.toLowerCase())).map(id => { const option = options.find(item => item.id === id); return <label key={id} className="flex items-center gap-2 rounded border p-3 text-sm"><input type="checkbox" checked={ids.includes(id)} onChange={event => setIds(value => event.target.checked ? [...value, id] : value.filter(item => item !== id))} /><span>{option?.name ?? `Branch #${id}`}{option && <span className="block text-xs text-muted-foreground">Last picking: {option.lastPickingBatchAt?.slice(0, 10) ?? "None"}</span>}</span></label>; })}</div>{fieldErrors("warehouseBranchIds")}</fieldset>
    <div className="space-y-2"><Label htmlFor="reason">Reason (optional)</Label><Input id="reason" maxLength={500} value={reason} onChange={event => setReason(event.target.value)} />{fieldErrors("reason")}</div><Button disabled={busy} type="submit">{busy ? "Saving…" : "Save new version"}</Button>
  </form></CardContent></Card>;
}
