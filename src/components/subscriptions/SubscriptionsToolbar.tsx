"use client";

import { useRouter } from "next/navigation";
import { SUBSCRIPTION_FILTERS } from "@/components/subscriptions/subscription-filters";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const BASE_PATH = "/assinaturas";

/** Filtro de situação, na URL (o servidor filtra a lista). */
export function SubscriptionsToolbar({ filter }: { filter: string }) {
  const router = useRouter();

  function change(next: string) {
    router.push(
      next === SUBSCRIPTION_FILTERS[0].id
        ? BASE_PATH
        : `${BASE_PATH}?situacao=${next}`,
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Select value={filter} onValueChange={change}>
        <SelectTrigger
          className="w-full sm:w-56"
          aria-label="Filtrar por situação"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {SUBSCRIPTION_FILTERS.map((option) => (
            <SelectItem key={option.id} value={option.id}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
