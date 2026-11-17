import "server-only";

// The backend's admin-only endpoint is the authority; editable is not a role.
export async function canManageWarehouseSettings(token?: string) {
  const base = process.env.SPRING_API_BASE_URL?.replace(/\/$/, "");
  if (!token || !base) return false;
  try {
    const response = await fetch(`${base}/api/bia/warehouse-kpi/settings/history`, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store", signal: AbortSignal.timeout(10000), redirect: "error" });
    return response.ok;
  } catch { return false; }
}
