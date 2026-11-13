import type { Metadata } from "next";
import { AutoMessagesPage } from "@/components/auto-messages/AutoMessagesPage";

export const metadata: Metadata = {
  title: "Mensagens ao administrador | Orari",
};

export default function AutoMessagesAdminsRoute() {
  return <AutoMessagesPage group="administradores" />;
}
