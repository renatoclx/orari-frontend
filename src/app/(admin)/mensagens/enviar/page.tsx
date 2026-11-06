import type { Metadata } from "next";
import { CampaignPage } from "@/components/auto-messages/CampaignPage";

export const metadata: Metadata = {
  title: "Enviar mensagem | Orari",
};

export default function CampaignRoute() {
  return <CampaignPage />;
}
