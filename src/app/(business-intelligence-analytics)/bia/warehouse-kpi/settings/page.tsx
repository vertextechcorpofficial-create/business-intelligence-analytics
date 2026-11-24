import SettingsPage from "@/modules/business-intelligence-analytics/warehouse-kpi/SettingsPage";
import { cookies } from "next/headers";
import { COOKIE_NAME } from "@/lib/auth-utils";
import { canManageWarehouseSettings } from "@/modules/business-intelligence-analytics/warehouse-kpi/settings-access";

export default async function Page() {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  const isAdmin = await canManageWarehouseSettings(token);
  return <div className="h-full min-h-0 overflow-y-auto"><SettingsPage isAdmin={isAdmin} /></div>;
}
