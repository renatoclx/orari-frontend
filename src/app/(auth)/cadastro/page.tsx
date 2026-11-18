import type { Metadata } from "next";
import { SignupForm } from "@/components/auth/SignupForm";
import { planFromQuery } from "@/components/auth/signup-validation";

export const metadata: Metadata = {
  title: "Teste grátis | Orari",
};

/**
 * Cadastro sozinho (screens/cadastro.md): o plano chega da landing
 * (?plano=essencial|plus|clinical; sem ele, o Plus).
 */
export default async function SignupPage({
  searchParams,
}: PageProps<"/cadastro">) {
  const { plano } = await searchParams;
  return (
    <div className="w-full max-w-md">
      <div className="mb-6 space-y-2">
        <h1 className="text-2xl font-semibold">Teste o Orari por 7 dias</h1>
        <p className="text-sm text-muted-foreground">
          Crie a conta do seu negócio e comece a agendar agora mesmo.
        </p>
      </div>
      <SignupForm initialPlan={planFromQuery(plano)} />
    </div>
  );
}
