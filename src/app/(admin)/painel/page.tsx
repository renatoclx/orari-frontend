import type { Metadata } from "next";
import { PlatformDashboardPage } from "@/components/platform-dashboard/PlatformDashboardPage";

export const metadata: Metadata = {
  title: "Painel | Orari",
};

export default function PlatformDashboardRoute() {
  return <PlatformDashboardPage />;
}
