import type { Metadata } from "next";
import { AutoMessagesPage } from "@/components/auto-messages/AutoMessagesPage";

export const metadata: Metadata = {
  title: "Mensagens ao profissional | Orari",
};

export default function AutoMessagesProfessionalsRoute() {
  return <AutoMessagesPage group="profissionais" />;
}
