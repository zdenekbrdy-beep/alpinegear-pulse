import { getSnapshot } from "./_lib/getSnapshot";
import { DashboardClient } from "./DashboardClient";

export default function Page() {
  const snapshot = getSnapshot();
  return <DashboardClient snapshot={snapshot} />;
}
