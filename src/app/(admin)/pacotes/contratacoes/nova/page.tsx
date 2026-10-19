import type { Metadata } from "next";
import { NewClientPlanPage } from "@/components/client-plans/NewClientPlanPage";

export const metadata: Metadata = {
  title: "Nova contratação | Orari",
};

export default function NewClientPlanRoute() {
  return <NewClientPlanPage />;
}
