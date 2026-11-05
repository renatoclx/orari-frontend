import type { Metadata } from "next";
import { ClientPortalPage } from "@/components/client-portal/ClientPortalPage";

export const metadata: Metadata = {
  title: "Portal do cliente | Orari",
};

export default function ClientPortalRoute() {
  return <ClientPortalPage />;
}
