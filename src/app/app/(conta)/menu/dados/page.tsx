import type { Metadata } from "next";
import { MenuSubpageHeader } from "@/components/client-app/MenuSubpageHeader";
import { ProfileForm } from "@/components/client-app/ProfileForm";
import { ProfilePhoto } from "@/components/client-app/ProfilePhoto";
import { getProfile } from "@/services/app-profile.service";

export const metadata: Metadata = { title: "Meus dados" };

// Menu → Meus dados (screens/app-cliente.md): a foto vale na hora; o resto, no Salvar.
export default async function AppProfilePage() {
  const profile = await getProfile();
  return (
    <>
      <MenuSubpageHeader title="Meus dados" />
      <ProfilePhoto name={profile.name} photoUrl={profile.photoUrl} />
      {/* key: depois de salvar, o formulário recomeça com o que foi gravado.
          Sem a foto na chave: trocar a foto (que vale na hora) não pode apagar
          o que o cliente digitou e ainda não salvou. */}
      <ProfileForm
        key={JSON.stringify({ ...profile, photoUrl: null })}
        profile={profile}
      />
    </>
  );
}
