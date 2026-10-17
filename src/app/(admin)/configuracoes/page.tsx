import type { Metadata } from "next";
import { CompanySettingsPage } from "@/components/settings/CompanySettingsPage";

export const metadata: Metadata = {
  title: "Configurações da empresa | Orari",
};

export default function CompanySettingsRoute() {
  return <CompanySettingsPage />;
}
