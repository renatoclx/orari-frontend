import type { Metadata } from "next";
import { HelpPage } from "@/components/help/HelpPage";

export const metadata: Metadata = {
  title: "Ajuda | Orari",
};

export default function HelpRoute() {
  return <HelpPage />;
}
