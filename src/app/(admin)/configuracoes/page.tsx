import type { Metadata } from "next";
import { CompanySettingsPage } from "@/components/settings/CompanySettingsPage";
import { requireFeature } from "@/lib/require-feature";

export const metadata: Metadata = {
  title: "Configurações da empresa | Orari",
};

export default async function CompanySettingsRoute() {
  await requireFeature("settings");
  return <CompanySettingsPage />;
}
