import { SettingsPage } from "@/features/settings/settings-page";
import { getSettings } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function SettingsRoute() {
  const settings = await getSettings();
  return <SettingsPage initialSettings={settings} />;
}
