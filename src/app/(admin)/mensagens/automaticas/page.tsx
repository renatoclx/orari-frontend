import type { Metadata } from "next";
import { AutoMessagesPage } from "@/components/auto-messages/AutoMessagesPage";

export const metadata: Metadata = {
  title: "Mensagens automáticas | Orari",
};

export default function AutoMessagesRoute() {
  return <AutoMessagesPage />;
}
