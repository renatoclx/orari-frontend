import type { Metadata } from "next";
import { AutoMessagesPage } from "@/components/auto-messages/AutoMessagesPage";

export const metadata: Metadata = { title: "Mensagens ao cliente | Orari" };

export default function AutoMessagesClientsRoute() {
  return <AutoMessagesPage group="clientes" />;
}
