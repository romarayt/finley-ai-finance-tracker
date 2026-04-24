import { HistoryPage } from "@/features/history/history-page";
import { listTransactions } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function HistoryRoute() {
  const transactions = await listTransactions();
  return <HistoryPage initialTransactions={transactions} />;
}
