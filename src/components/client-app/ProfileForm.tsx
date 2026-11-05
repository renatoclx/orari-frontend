"use client";

import { useActionState, useState, useTransition } from "react";
import { Save } from "lucide-react";
import { appCepAction, appProfileAction } from "@/app/app/actions";
import { AppField } from "@/components/client-app/AppField";
import { AppFormMessage } from "@/components/client-app/AppFormMessage";
import { Button } from "@/components/ui/button";
import type { AppProfile } from "@/types/client-app";
import { onlyDigits } from "@/utils/masks";

/**
 * Formulário de Meus dados (screens/app-cliente.md): dados pessoais, contato e
 * endereço. O endereço vem do CEP (rua, bairro e cidade); a cidade não é
 * digitada. Trocar o telefone (o login) pede a senha atual.
 */
export function ProfileForm({ profile }: { profile: AppProfile }) {
  const [state, action, pending] = useActionState(
    appProfileAction.bind(null, profile.phone),
    undefined,
  );
  const initial = state?.values;
  const [phone, setPhone] = useState(initial?.phone ?? profile.phone);
  const [address, setAddress] = useState({
    street: initial?.street ?? profile.address?.street ?? "",
    neighborhood: initial?.neighborhood ?? profile.address?.neighborhood ?? "",
    complement: initial?.complement ?? profile.address?.complement ?? "",
    cityName: initial?.cityName ?? profile.address?.city.name ?? "",
    cityState: initial?.cityState ?? profile.address?.city.state ?? "",
  });
  const [cepMessage, setCepMessage] = useState<string>();
  const [searching, startSearch] = useTransition();
  const errors = state?.fieldErrors ?? {};
  const phoneChanged = onlyDigits(phone) !== profile.phone;

  // Ao terminar o CEP (8 dígitos): preenche rua, bairro e cidade.
  function searchCep(cep: string) {
    if (onlyDigits(cep).length !== 8) return;
    setCepMessage(undefined);
    startSearch(async () => {
      const result = await appCepAction(cep);
      if (result.status === "found") {
        setAddress((current) => ({
          ...current,
          street: result.address.street || current.street,
          neighborhood: result.address.neighborhood || current.neighborhood,
          cityName: result.address.city,
          cityState: result.address.stateAcronym,
        }));
      } else {
        setAddress((current) => ({ ...current, cityName: "", cityState: "" }));
        setCepMessage(
          result.status === "not-found"
            ? "CEP não encontrado. Confira os números."
            : "Não foi possível buscar o CEP agora. Tente de novo.",
        );
      }
    });
  }

  return (
    <form action={action} noValidate className="space-y-6">
      {state?.message && <AppFormMessage>{state.message}</AppFormMessage>}

      <section className="space-y-4">
        <h2 className="font-semibold">Dados pessoais</h2>
        <AppField
          name="name"
          label="Nome"
          autoComplete="name"
          defaultValue={initial?.name ?? profile.name}
          error={errors.name}
        />
        <AppField
          name="document"
          label="CPF (opcional)"
          type="cpf"
          defaultValue={initial?.document ?? profile.document ?? ""}
          error={errors.document}
        />
        <AppField
          name="birthDate"
          label="Data de nascimento (opcional)"
          type="date"
          autoComplete="bday"
          defaultValue={
            initial?.birthDate ?? profile.birthDate?.slice(0, 10) ?? ""
          }
          error={errors.birthDate}
        />
        <AppField
          name="profession"
          label="Profissão (opcional)"
          defaultValue={initial?.profession ?? profile.profession ?? ""}
          error={errors.profession}
        />
      </section>

      <section className="space-y-4">
        <h2 className="font-semibold">Contato</h2>
        <AppField
          name="phone"
          label="Telefone (com DDD)"
          type="tel"
          autoComplete="tel"
          defaultValue={phone}
          onValueChange={setPhone}
          error={errors.phone}
        />
        {phoneChanged && (
          <AppField
            name="currentPassword"
            label="Senha atual (para trocar o telefone)"
            type="password"
            autoComplete="current-password"
            error={errors.currentPassword}
          />
        )}
        <AppField
          name="email"
          label="E-mail (opcional)"
          type="email"
          autoComplete="email"
          defaultValue={initial?.email ?? profile.email ?? ""}
          error={errors.email}
        />
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="font-semibold">Endereço (opcional)</h2>
          <p className="text-sm text-muted-foreground">
            Digite o CEP: rua, bairro e cidade são preenchidos.
          </p>
        </div>
        <AppField
          name="cep"
          label="CEP"
          type="cep"
          autoComplete="postal-code"
          defaultValue={initial?.cep ?? profile.address?.cep ?? ""}
          onValueChange={searchCep}
          error={errors.cep}
        />
        {searching && (
          <p className="text-sm text-muted-foreground">Buscando o CEP…</p>
        )}
        {cepMessage && <AppFormMessage>{cepMessage}</AppFormMessage>}
        {address.cityName && (
          <p className="text-sm">
            Cidade:{" "}
            <span className="font-medium">
              {address.cityName} - {address.cityState}
            </span>
          </p>
        )}
        <input type="hidden" name="cityName" value={address.cityName} />
        <input type="hidden" name="cityState" value={address.cityState} />
        <AppField
          name="street"
          label="Rua"
          autoComplete="address-line1"
          value={address.street}
          onValueChange={(street) =>
            setAddress((current) => ({ ...current, street }))
          }
          error={errors.street}
        />
        <AppField
          name="number"
          label="Número"
          defaultValue={initial?.number ?? profile.address?.number ?? ""}
          error={errors.number}
        />
        <AppField
          name="complement"
          label="Complemento (opcional)"
          value={address.complement}
          onValueChange={(complement) =>
            setAddress((current) => ({ ...current, complement }))
          }
        />
        <AppField
          name="neighborhood"
          label="Bairro (opcional)"
          value={address.neighborhood}
          onValueChange={(neighborhood) =>
            setAddress((current) => ({ ...current, neighborhood }))
          }
        />
      </section>

      <p className="text-xs text-muted-foreground">
        Ao salvar, seus dados também são atualizados nos estabelecimentos em que
        você é cliente.
      </p>
      <Button
        type="submit"
        disabled={pending || searching}
        className="h-12 w-full text-base"
      >
        <Save aria-hidden="true" />
        {pending ? "Salvando…" : "Salvar"}
      </Button>
    </form>
  );
}
