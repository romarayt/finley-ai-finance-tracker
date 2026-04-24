import { DashboardPage } from "@/features/dashboard/dashboard-page";
import { getDashboardData } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const data = await getDashboardData();
  return <DashboardPage data={data} />;
}
